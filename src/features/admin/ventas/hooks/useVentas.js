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

  // ── Queries ──
  const { data: ventas = [] }    = useQuery({ queryKey: ['pedidos'],        queryFn: ventasService.getAll })
  const { data: clientes = [] }  = useQuery({ queryKey: ['clientes'],       queryFn: ventasService.getClientes })
  const { data: productos = [] } = useQuery({ queryKey: ['productos'],      queryFn: ventasService.getProductos })
  const { data: estados = [] }   = useQuery({ queryKey: ['estados-pedido'], queryFn: ventasService.getEstados })

  const estadoPagado    = estados.find(e => e.nombre?.toLowerCase().includes('paga') || e.nombre?.toLowerCase().includes('complet'))
  const estadoPendiente = estados.find(e => e.nombre?.toLowerCase().includes('pendiente'))

  // ── Sub-hooks ──
  const carrito = useCarritoProductos({
    productos,
    getBarcode: ventasService.getBarcode,
  })
  const fiado    = useFiadoCalculo({ clientes, form })
  const anulacion = useAnulacionVenta()

  // ── Helpers carrito adaptados al form local ──
  const buscarProducto  = texto => carrito.buscarProducto(texto, setForm)
  const buscarPorCodigo = cod   => carrito.buscarPorCodigo(cod, prod => carrito.agregarProducto(prod, form, setForm))
  const agregarProducto = prod  => { carrito.agregarProducto(prod, form, setForm) }
  const cambiarCantidad = (idx, val) => carrito.cambiarCantidad(idx, val, form, setForm)
  const quitarProducto  = idx => carrito.quitarProducto(idx, setForm)

  const clientesFiltrados = clientes
    .filter(c => !clienteBusqueda ||
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(clienteBusqueda.toLowerCase()))
    .slice(0, 6)

  // ── Mutations ──
  const crearVenta = useMutation({
    mutationFn: async data => {
      const res = await ventasService.create({ ...data, tipo_venta: 'mostrador' })
      const pedido_id = res.data.pedido_id
      if (data._tipo_pago === 'fiado') {
        if (estadoPendiente) await ventasService.cambiarEstado(pedido_id, { estado_id: estadoPendiente.id })
        if (data._monto_inmediato > 0) {
          await ventasService.registrarPago({
            pedido_id, monto: data._monto_inmediato, metodo: data._metodo_pago_inmediato || 'efectivo',
          })
        }
      } else {
        if (estadoPagado) await ventasService.cambiarEstado(pedido_id, { estado_id: estadoPagado.id })
        await ventasService.registrarPago({ pedido_id, monto: data._total, metodo: data._metodo_pago || 'efectivo' })
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
      carrito.setProdBusqueda(''); setClienteBusqueda('')
      toast.success(
        vars._tipo_pago === 'fiado'
          ? (vars._monto_inmediato > 0 ? 'Venta registrada — fiado parcial y abono inmediato' : 'Venta registrada como fiado')
          : 'Venta registrada y marcada como pagada'
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

  // ── Handlers ──
  const handleCrear = e => {
    if (e?.preventDefault) e.preventDefault()
    if (form.tipo_cliente === 'registrado' && !form.cliente_id) { toast.error('Selecciona un cliente'); return }
    if (!form.productos.length) { toast.error('Agrega al menos un producto'); return }
    for (const p of form.productos) {
      if (!p.cantidad || +p.cantidad < 1) { toast.error(`${p.nombre}: la cantidad debe ser al menos 1`); return }
      const stock = p.stock ?? carrito.getStock(p.producto_id)
      if (+p.cantidad > stock) { toast.error(`${p.nombre}: solo hay ${stock} unidades en stock`); return }
    }
    if (form.tipo_pago === 'fiado' && fiado.totalVenta < MINIMO_FIADO) {
      toast.error(`El mínimo para ventas a crédito es de $${MINIMO_FIADO.toLocaleString('es-CO')}`); return
    }
    if (form.tipo_pago === 'fiado' && form.cliente_id && fiado.cupoFiadoDisponible != null && fiado.cupoFiadoDisponible <= 0) {
      toast.error('Este cliente no tiene cupo de fiado disponible actualmente'); return
    }
    crearVenta.mutate({
      cliente_id:             form.tipo_cliente === 'registrado' ? form.cliente_id : null,
      cliente_nombre:         form.tipo_cliente === 'manual' ? (form.cliente_nombre.trim() || 'Mostrador') : null,
      productos:              form.productos,
      es_fiado:               form.tipo_pago === 'fiado',
      monto_fiado:            form.tipo_pago === 'fiado' ? fiado.montoFiado : 0,
      _total:                 fiado.totalVenta,
      _tipo_pago:             form.tipo_pago,
      _metodo_pago:           form.metodo_pago || 'efectivo',
      _monto_inmediato:       fiado.montoInmediato,
      _metodo_pago_inmediato: form.metodo_pago_inmediato || 'efectivo',
    })
  }

  // ── Filtros ──
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
    const nombres = { normal: 'general', rango: 'personalizado' }
    const ext = formato === 'excel' ? 'xlsx' : 'pdf'
    const params = new URLSearchParams({ formato })
    if (tipo === 'rango') {
      if (desde) params.set('desde', desde)
      if (hasta) params.set('hasta', hasta)
    }
    const url = `/reportes/ventas?${params.toString()}`
    const nombreArchivo = `reporte-ventas-${nombres[tipo] || tipo}.${ext}`
    if (formato === 'excel') await descargarExcel(url, nombreArchivo)
    else await descargarPDF(url, nombreArchivo)
  }

  return {
    ventasFiltradas, clientes, productos, estados,
    form, setForm,
    prodBusqueda:      carrito.prodBusqueda,
    prodsFiltrados:    carrito.prodsFiltrados,
    setProdBusqueda:   carrito.setProdBusqueda,
    setProdsFiltrados: carrito.setProdsFiltrados,
    buscarProducto, buscarPorCodigo, agregarProducto, cambiarCantidad, quitarProducto,
    clientesFiltrados, clienteBusqueda, setClienteBusqueda,
    totalVenta:          fiado.totalVenta,
    clienteSeleccionado: fiado.clienteSeleccionado,
    cupoFiadoDisponible: fiado.cupoFiadoDisponible,
    excedeCupoFiado:     fiado.excedeCupoFiado,
    montoFiado:          fiado.montoFiado,
    montoInmediato:      fiado.montoInmediato,
    modalNuevo, setModalNuevo,
    modalDetalle, setModalDetalle,
    modalAnular, setModalAnular,
    filtroEstado, setFiltroEstado,
    filtroBusqueda, setFiltroBusqueda,
    filtroDesde, setFiltroDesde,
    filtroHasta, setFiltroHasta,
    ...anulacion,
    anular: anularMutation,
    cambiarEstado,
    handleCrear,
    getBadge, descargarReporte,
    notaAnulacion, setNotaAnulacion, MINIMO_FIADO,
    creando: crearVenta.isPending, anulando: anularMutation.isPending,
  }
}