import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ventasService } from '../services/ventasService'
import { descargarPDF, descargarExcel } from '@shared/utils/reportes'
import { useCarritoProductos } from '../../../../shared/hooks/useCarritoProductos'
import { useFiadoCalculo }     from '../../../../shared/hooks/useFiadoCalculo'
import { useAnulacionVenta }   from '../../../../shared/hooks/useAnulacionVenta'
import toast from 'react-hot-toast'

const MINIMO_FIADO = 10000

const formInicial = {
  tipo_cliente: 'registrado', cliente_id: '', cliente_nombre: '',
  productos: [], tipo_pago: 'total', metodo_pago: 'efectivo',
  metodo_pago_inmediato: 'efectivo',
  pago_mixto: false, monto_efectivo: '', monto_transferencia: '',
  monto_fiado_personalizado: null,
  inmediato_mixto: false, inmediato_efectivo: '', inmediato_transferencia: '',
}

export function useVentas() {
  const qc = useQueryClient()
  const [modalNuevo, setModalNuevo]         = useState(false)
  const [modalDetalle, setModalDetalle]     = useState({ abierto: false, venta: null })
  const [modalAnular, setModalAnular]       = useState({ abierto: false, venta: null })
  const [notaAnulacion, setNotaAnulacion]   = useState('')
  const [filtroEstado, setFiltroEstado]     = useState('')
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [filtroDesde, setFiltroDesde]       = useState('')
  const [filtroHasta, setFiltroHasta]       = useState('')
  const [form, setForm]                     = useState(formInicial)
  const [clienteBusqueda, setClienteBusqueda] = useState('')

  const { data: ventas = [] }    = useQuery({ queryKey: ['pedidos'],        queryFn: ventasService.getAll })
  const { data: clientes = [] }  = useQuery({ queryKey: ['clientes'],       queryFn: ventasService.getClientes })
  const { data: productos = [] } = useQuery({ queryKey: ['productos'],      queryFn: ventasService.getProductos })
  const { data: estados = [] }   = useQuery({ queryKey: ['estados-pedido'], queryFn: ventasService.getEstados })

  const estadoPagado    = estados.find(e => e.nombre?.toLowerCase().includes('paga') || e.nombre?.toLowerCase().includes('complet'))
  const estadoPendiente = estados.find(e => e.nombre?.toLowerCase().includes('pendiente'))

  const carrito   = useCarritoProductos({ productos, getBarcode: ventasService.getBarcode })
  const fiado     = useFiadoCalculo({ clientes, form })
  const anulacion = useAnulacionVenta()

  const buscarProducto  = texto => carrito.buscarProducto(texto, setForm)
  const buscarPorCodigo = cod   => carrito.buscarPorCodigo(cod, null, form, setForm)
  const agregarProducto = prod  => carrito.agregarProducto(prod, form, setForm)
  const cambiarCantidad = (idx, val) => carrito.cambiarCantidad(idx, val, form, setForm)
  const quitarProducto  = idx  => carrito.quitarProducto(idx, setForm)

  const clientesFiltrados = clientes
    .filter(c => !clienteBusqueda ||
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(clienteBusqueda.toLowerCase()))
    .slice(0, 6)

  const crearVenta = useMutation({
    mutationFn: async data => {
      const res       = await ventasService.create({ ...data, tipo_venta: 'mostrador' })
      const pedido_id = res.data.pedido_id

      if (data._tipo_pago === 'fiado') {
        if (estadoPendiente)
          await ventasService.cambiarEstado(pedido_id, { estado_id: estadoPendiente.id })

        if (data._monto_inmediato > 0) {
          if (data._inmediato_mixto) {
            // Cobro inmediato mixto
            if (data._inmediato_efectivo > 0)
              await ventasService.registrarPago({
                pedido_id, monto: data._inmediato_efectivo, metodo: 'efectivo' })
            if (data._inmediato_transferencia > 0)
              await ventasService.registrarPago({
                pedido_id, monto: data._inmediato_transferencia, metodo: 'transferencia' })
          } else {
            await ventasService.registrarPago({
              pedido_id, monto: data._monto_inmediato,
              metodo: data._metodo_pago_inmediato || 'efectivo' })
          }
        }
      } else if (data._pago_mixto) {
        if (estadoPagado)
          await ventasService.cambiarEstado(pedido_id, { estado_id: estadoPagado.id })
        if (data._monto_efectivo > 0)
          await ventasService.registrarPago({ pedido_id, monto: data._monto_efectivo, metodo: 'efectivo' })
        if (data._monto_transferencia > 0)
          await ventasService.registrarPago({ pedido_id, monto: data._monto_transferencia, metodo: 'transferencia' })
      } else {
        if (estadoPagado)
          await ventasService.cambiarEstado(pedido_id, { estado_id: estadoPagado.id })
        await ventasService.registrarPago({
          pedido_id, monto: data._total, metodo: data._metodo_pago || 'efectivo' })
      }
      return res.data
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries(['pedidos'])
      qc.invalidateQueries(['productos'])
      qc.invalidateQueries(['pagos'])
      qc.invalidateQueries(['clientes'])
      setModalNuevo(false)
      setForm(formInicial)
      carrito.setProdBusqueda('')
      setClienteBusqueda('')
      toast.success(
        vars._tipo_pago === 'fiado'
          ? (vars._monto_inmediato > 0
              ? 'Venta registrada — crédito parcial'
              : 'Venta registrada a crédito')
          : vars._pago_mixto
            ? 'Venta registrada — pago mixto'
            : 'Venta registrada'
      )
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })

  const anularMutation = useMutation({
    mutationFn: ({ id, nota }) => {
      const e = estados.find(e => e.nombre?.toLowerCase().includes('anula'))
      return ventasService.cambiarEstado(id, { estado_id: e?.id || 3, nota })
    },
    onSuccess: () => {
      qc.invalidateQueries(['pedidos'])
      setModalAnular({ abierto: false, venta: null })
      setNotaAnulacion('')
      toast.success('Venta anulada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'No se pudo anular la venta'),
  })

  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado_id }) => ventasService.cambiarEstado(id, { estado_id }),
    onSuccess: () => { qc.invalidateQueries(['pedidos']); toast.success('Estado actualizado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })

  const completarPedidoMovil = useMutation({
    mutationFn: async ({ id, total, metodo_pago }) => {
      if (estadoPagado) await ventasService.cambiarEstado(id, { estado_id: estadoPagado.id })
      await ventasService.registrarPago({ pedido_id: id, monto: total, metodo: metodo_pago || 'efectivo' })
    },
    onSuccess: () => {
      qc.invalidateQueries(['pedidos'])
      qc.invalidateQueries(['pagos'])
      toast.success('Pedido completado y pago registrado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error al completar el pedido'),
  })

  const marcarEntregado = useMutation({
    mutationFn: ({ id }) => ventasService.marcarEntregado(id),
    onSuccess: () => { qc.invalidateQueries(['pedidos']); toast.success('Pedido marcado como entregado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })

  const handleCrear = e => {
    if (e?.preventDefault) e.preventDefault()

    if (form.tipo_cliente === 'registrado' && !form.cliente_id) {
      toast.error('Selecciona un cliente'); return
    }
    if (!form.productos.length) {
      toast.error('Agrega al menos un producto'); return
    }
    for (const p of form.productos) {
      if (!p.cantidad || +p.cantidad < 1) {
        toast.error(`${p.nombre}: la cantidad debe ser al menos 1`); return
      }
      const stock = p.stock ?? carrito.getStock(p.producto_id)
      if (+p.cantidad > stock) {
        toast.error(`${p.nombre}: solo hay ${stock} unidades en stock`); return
      }
    }

    // ── Validaciones crédito ────────────────────────────────
    if (form.tipo_pago === 'fiado') {

      if (fiado.totalVenta < MINIMO_FIADO) {
        toast.error(`El mínimo para ventas a crédito es de $${MINIMO_FIADO.toLocaleString('es-CO')}`)
        return
      }

      if (form.cliente_id && fiado.cupoFiadoDisponible != null && fiado.cupoFiadoDisponible <= 0) {
        toast.error('Este cliente no tiene cupo de crédito disponible'); return
      }

      // Crédito personalizado
      if (form.monto_fiado_personalizado != null) {
        const mc = parseFloat(form.monto_fiado_personalizado || 0)

        if (mc <= 0) {
          toast.error('Ingresa el monto que va a crédito'); return
        }
        if (mc < MINIMO_FIADO) {
          toast.error(`El monto mínimo a crédito es de $${MINIMO_FIADO.toLocaleString('es-CO')}. Se cambió a pago total.`)
          setForm(f => ({ ...f, tipo_pago: 'total', monto_fiado_personalizado: null }))
          return
        }
        if (fiado.cupoFiadoDisponible != null && mc > fiado.cupoFiadoDisponible) {
          toast.error(`El monto a crédito supera el cupo disponible ($${fiado.cupoFiadoDisponible.toLocaleString('es-CO')})`)
          return
        }
        if (mc > fiado.totalVenta) {
          toast.error('El monto a crédito no puede superar el total de la venta'); return
        }

        const inmediato = fiado.totalVenta - mc
        if (inmediato > 0) {
          if (form.inmediato_mixto) {
            // Validar pago mixto inmediato
            const ief = parseFloat(form.inmediato_efectivo || 0)
            const itr = parseFloat(form.inmediato_transferencia || 0)
            if (ief <= 0 && itr <= 0) {
              toast.error('Ingresa los montos del pago mixto para el cobro inmediato'); return
            }
            if (Math.abs(ief + itr - inmediato) >= 1) {
              toast.error('La suma del pago mixto no coincide con el cobro inmediato'); return
            }
            if (ief > 0 && ief < MINIMO_FIADO && itr > 0) {
              // Permitir montos menores si la suma cubre el total
            }
          } else if (!form.metodo_pago_inmediato) {
            toast.error('Selecciona el método de pago para el cobro inmediato'); return
          }
        }
      } else if (fiado.excedeCupoFiado) {
        // Excede cupo sin personalizar — validar cobro del excedente
        const excedente = fiado.totalVenta - fiado.cupoFiadoDisponible
        if (form.inmediato_mixto) {
          const ief = parseFloat(form.inmediato_efectivo || 0)
          const itr = parseFloat(form.inmediato_transferencia || 0)
          if (ief <= 0 && itr <= 0) {
            toast.error('Ingresa los montos del pago mixto para el cobro inmediato'); return
          }
          if (Math.abs(ief + itr - excedente) >= 1) {
            toast.error('La suma del pago mixto no coincide con el cobro inmediato'); return
          }
        } else if (!form.metodo_pago_inmediato) {
          toast.error('Selecciona el método de pago para el cobro inmediato'); return
        }
      }
    }

    // ── Validación pago mixto total ─────────────────────────
    if (form.pago_mixto) {
      const ef = parseFloat(form.monto_efectivo || 0)
      const tr = parseFloat(form.monto_transferencia || 0)
      if (ef <= 0 && tr <= 0) {
        toast.error('Ingresa los montos del pago mixto'); return
      }
      if (Math.abs(ef + tr - fiado.totalVenta) >= 1) {
        toast.error('La suma del pago mixto no coincide con el total'); return
      }
    }

    crearVenta.mutate({
      cliente_id:               form.tipo_cliente === 'registrado' ? form.cliente_id : null,
      cliente_nombre:           form.tipo_cliente === 'manual' ? (form.cliente_nombre.trim() || 'Mostrador') : null,
      productos:                form.productos,
      es_fiado:                 form.tipo_pago === 'fiado',
      monto_fiado:              form.tipo_pago === 'fiado' ? fiado.montoFiado : 0,
      _total:                   fiado.totalVenta,
      _tipo_pago:               form.tipo_pago,
      _metodo_pago:             form.metodo_pago || 'efectivo',
      _monto_inmediato:         fiado.montoInmediato,
      _metodo_pago_inmediato:   form.metodo_pago_inmediato || 'efectivo',
      _pago_mixto:              !!form.pago_mixto,
      _monto_efectivo:          parseFloat(form.monto_efectivo || 0),
      _monto_transferencia:     parseFloat(form.monto_transferencia || 0),
      _inmediato_mixto:         !!form.inmediato_mixto,
      _inmediato_efectivo:      parseFloat(form.inmediato_efectivo || 0),
      _inmediato_transferencia: parseFloat(form.inmediato_transferencia || 0),
    })
  }

  const ventasFiltradas = ventas.filter(v => {
    if (filtroEstado   && v.estado_id !== +filtroEstado) return false
    if (filtroBusqueda && !`${v.id} ${v.cliente}`.toLowerCase().includes(filtroBusqueda.toLowerCase())) return false
    if (filtroDesde    && v.fecha_pedido && new Date(v.fecha_pedido) < new Date(filtroDesde)) return false
    if (filtroHasta    && v.fecha_pedido && new Date(v.fecha_pedido) > new Date(filtroHasta)) return false
    return true
  })

  const getBadge = n => {
    if (!n) return 'badge-pendiente'
    const l = n.toLowerCase()
    if (l.includes('anula')) return 'badge-anulado'
    if (l.includes('entrega') || l.includes('paga') || l.includes('complet')) return 'badge-activo'
    return 'badge-pendiente'
  }

  const descargarReporte = async ({ tipo, formato = 'pdf', desde, hasta } = {}) => {
    const ext    = formato === 'excel' ? 'xlsx' : 'pdf'
    const params = new URLSearchParams({ formato })
    if (tipo === 'rango') {
      if (desde) params.set('desde', desde)
      if (hasta) params.set('hasta', hasta)
    }
    const url    = `/reportes/ventas?${params}`
    const nombre = `reporte-ventas-${tipo || 'general'}.${ext}`
    if (formato === 'excel') await descargarExcel(url, nombre)
    else await descargarPDF(url, nombre)
  }

  return {
    ventas, ventasFiltradas, clientes, productos, estados,
    form, setForm, clienteBusqueda, setClienteBusqueda,
    clientesFiltrados,
    modalNuevo, setModalNuevo,
    modalDetalle, setModalDetalle,
    modalAnular, setModalAnular,
    notaAnulacion, setNotaAnulacion,
    filtroEstado, setFiltroEstado,
    filtroBusqueda, setFiltroBusqueda,
    filtroDesde, setFiltroDesde,
    filtroHasta, setFiltroHasta,
    buscarProducto, buscarPorCodigo, agregarProducto, cambiarCantidad, quitarProducto,
    prodBusqueda:   carrito.prodBusqueda,
    prodsFiltrados: carrito.prodsFiltrados,
    handleCrear,
    crearVenta, creando: crearVenta.isPending,
    anular: anularMutation.mutate, anulando: anularMutation.isPending,
    cambiarEstado, completarPedidoMovil, marcarEntregado,
    getBadge,
    clienteSeleccionado:  fiado.clienteSeleccionado,
    cupoFiadoDisponible:  fiado.cupoFiadoDisponible,
    excedeCupoFiado:      fiado.excedeCupoFiado,
    montoFiado:           fiado.montoFiado,
    montoInmediato:       fiado.montoInmediato,
    totalVenta:           fiado.totalVenta,
    getFechaLimiteAnulacion: anulacion.getFechaLimiteAnulacion,
    puedeAnular:             anulacion.puedeAnular,
    horasRestantesAnulacion: anulacion.horasRestantesAnulacion,
    descargarReporte,
    MINIMO_FIADO,
  }
}