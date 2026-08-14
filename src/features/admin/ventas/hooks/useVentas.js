import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ventasService } from '../services/ventasService'
import { descargarPDF, descargarExcel } from '@shared/utils/reportes'
import toast from 'react-hot-toast'

export function useVentas() {
  const qc = useQueryClient()
  const [modalNuevo, setModalNuevo]     = useState(false)
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, venta: null })
  const [modalAnular, setModalAnular]   = useState({ abierto: false, venta: null })
  const [notaAnulacion, setNotaAnulacion] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [filtroDesde, setFiltroDesde]   = useState('')
  const [filtroHasta, setFiltroHasta]   = useState('')
  const [form, setForm] = useState({
    tipo_cliente: 'registrado', cliente_id: '', cliente_nombre: '',
    productos: [], tipo_pago: 'total', metodo_pago: 'efectivo',
    metodo_pago_inmediato: 'efectivo',
  })
  const [prodBusqueda, setProdBusqueda]       = useState('')
  const [prodsFiltrados, setProdsFiltrados]   = useState([])
  const [clienteBusqueda, setClienteBusqueda] = useState('')

  const { data: ventas = [] }    = useQuery({ queryKey: ['pedidos'],        queryFn: ventasService.getAll })
  const { data: clientes = [] }  = useQuery({ queryKey: ['clientes'],       queryFn: ventasService.getClientes })
  const { data: productos = [] } = useQuery({ queryKey: ['productos'],      queryFn: ventasService.getProductos })
  const { data: estados = [] }   = useQuery({ queryKey: ['estados-pedido'], queryFn: ventasService.getEstados })

  const estadoPagado    = estados.find(e => e.nombre?.toLowerCase().includes('paga') || e.nombre?.toLowerCase().includes('complet'))
  const estadoPendiente = estados.find(e => e.nombre?.toLowerCase().includes('pendiente'))

  const getStock = producto_id => productos.find(p => p.id === producto_id)?.stock ?? Infinity

  // Una sola línea por producto — sin lógica de lotes en el carrito
  const construirLinea = (prod, cantidad) => ({
    producto_id:     prod.id,
    cantidad,
    precio_unitario: parseFloat(prod.precio),
    nombre:          prod.nombre,
    stock:           prod.stock,
  })

  const crearVenta = useMutation({
    mutationFn: async data => {
      const res = await ventasService.create({ ...data, tipo_venta: 'mostrador' })
      const pedido_id = res.data.pedido_id
      if (data._tipo_pago === 'fiado') {
        if (estadoPendiente) await ventasService.cambiarEstado(pedido_id, { estado_id: estadoPendiente.id })
        if (data._monto_inmediato > 0) {
          await ventasService.registrarPago({
            pedido_id,
            monto:  data._monto_inmediato,
            metodo: data._metodo_pago_inmediato || 'efectivo',
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
      setForm({
        tipo_cliente: 'registrado', cliente_id: '', cliente_nombre: '',
        productos: [], tipo_pago: 'total', metodo_pago: 'efectivo',
        metodo_pago_inmediato: 'efectivo',
      })
      setProdBusqueda(''); setClienteBusqueda('')
      toast.success(
        vars._tipo_pago === 'fiado'
          ? (vars._monto_inmediato > 0 ? 'Venta registrada — fiado parcial y abono inmediato' : 'Venta registrada como fiado')
          : 'Venta registrada y marcada como pagada'
      )
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })

  const anular = useMutation({
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

  const clientesFiltrados = clientes
    .filter(c => !clienteBusqueda ||
      `${c.nombre} ${c.apellido}`.toLowerCase().includes(clienteBusqueda.toLowerCase()))
    .slice(0, 6)

  const buscarProducto = texto => {
    setProdBusqueda(texto)
    if (!texto) { setProdsFiltrados([]); return }
    const t = texto.toLowerCase()
    setProdsFiltrados(
      productos.filter(p =>
        p.nombre.toLowerCase().includes(t) ||
        (p.codigo_barras && p.codigo_barras.includes(t))
      ).slice(0, 8)
    )
  }

  const buscarPorCodigo = async cod => {
    try {
      const { data } = await ventasService.getBarcode(cod)
      if (data.ok) { agregarProducto(data.datos); toast.success('Agregado: ' + data.datos.nombre) }
      else toast.error('Producto no encontrado')
    } catch { toast.error('Producto no encontrado') }
  }

  const agregarProducto = prod => {
    const stock = prod.stock ?? getStock(prod.id)
    const existente = form.productos.find(p => p.producto_id === prod.id)
    const cantidadActual = existente ? (+existente.cantidad || 0) : 0
    const nuevaCantidad = cantidadActual + 1

    if (nuevaCantidad > stock) {
      toast.error(`Stock insuficiente — solo hay ${stock} unidades`)
      return
    }

    setForm(f => {
      const idx = f.productos.findIndex(p => p.producto_id === prod.id)
      if (idx === -1) {
        // producto nuevo — agregar al final
        return { ...f, productos: [...f.productos, construirLinea(prod, 1)] }
      }
      // producto existente — actualizar cantidad en su posición
      const nuevos = [...f.productos]
      nuevos[idx] = { ...nuevos[idx], cantidad: nuevaCantidad }
      return { ...f, productos: nuevos }
    })
    setProdBusqueda(''); setProdsFiltrados([])
  }

  const cambiarCantidad = (idx, nuevaCantidad) => {
    if (nuevaCantidad === '') {
      setForm(f => ({
        ...f,
        productos: f.productos.map((p, i) => i === idx ? { ...p, cantidad: '' } : p)
      }))
      return
    }
    const linea = form.productos[idx]
    if (!linea) return
    const stock = linea.stock ?? getStock(linea.producto_id)
    const num = Math.max(1, +nuevaCantidad || 1)
    const cant = Math.min(num, stock)
    if (+nuevaCantidad > stock) toast.error(`Stock insuficiente — máximo ${stock} unidades`)
    setForm(f => ({
      ...f,
      productos: f.productos.map((p, i) => i === idx ? { ...p, cantidad: cant } : p)
    }))
  }

  const quitarProducto = idx => {
    setForm(f => ({ ...f, productos: f.productos.filter((_, i) => i !== idx) }))
  }

  const totalVenta = form.productos.reduce((s, p) => s + p.precio_unitario * (+p.cantidad || 0), 0)

  const clienteSeleccionado = clientes.find(c => c.id === +form.cliente_id)
  const cupoFiadoDisponible = clienteSeleccionado?.cupo_fiado_disponible != null
    ? +clienteSeleccionado.cupo_fiado_disponible
    : null
  const excedeCupoFiado = form.tipo_pago === 'fiado' && cupoFiadoDisponible != null && totalVenta > cupoFiadoDisponible
  const montoFiado      = excedeCupoFiado ? cupoFiadoDisponible : totalVenta
  const montoInmediato  = excedeCupoFiado ? totalVenta - cupoFiadoDisponible : 0

  const handleCrear = e => {
    e.preventDefault()
    if (form.tipo_cliente === 'registrado' && !form.cliente_id) {
      toast.error('Selecciona un cliente'); return
    }
    if (!form.productos.length) { toast.error('Agrega al menos un producto'); return }
    for (const p of form.productos) {
      if (!p.cantidad || +p.cantidad < 1) {
        toast.error(`${p.nombre}: la cantidad debe ser al menos 1`); return
      }
      const stock = p.stock ?? getStock(p.producto_id)
      if (+p.cantidad > stock) {
        toast.error(`${p.nombre}: solo hay ${stock} unidades en stock`); return
      }
    }
    if (form.tipo_pago === 'fiado' && form.cliente_id && cupoFiadoDisponible != null && cupoFiadoDisponible <= 0) {
      toast.error('Este cliente no tiene cupo de fiado disponible actualmente'); return
    }

    crearVenta.mutate({
      cliente_id:             form.tipo_cliente === 'registrado' ? form.cliente_id : null,
      cliente_nombre:         form.tipo_cliente === 'manual'
                                ? (form.cliente_nombre.trim() || 'Anónimo')
                                : null,
      productos:              form.productos,
      es_fiado:               form.tipo_pago === 'fiado',
      monto_fiado:            form.tipo_pago === 'fiado' ? montoFiado : 0,
      _total:                 totalVenta,
      _tipo_pago:             form.tipo_pago,
      _metodo_pago:           form.metodo_pago || 'efectivo',
      _monto_inmediato:       montoInmediato,
      _metodo_pago_inmediato: form.metodo_pago_inmediato || 'efectivo',
    })
  }

  const getBadge = n => {
    if (!n) return 'badge-pendiente'
    const l = n.toLowerCase()
    if (l.includes('anula')) return 'badge-anulado'
    if (l.includes('entrega') || l.includes('paga') || l.includes('complet')) return 'badge-activo'
    return 'badge-pendiente'
  }

  const getFechaLimiteAnulacion = venta => {
    if (!venta) return null
    if (venta.fecha_limite_anulacion) return new Date(venta.fecha_limite_anulacion)
    if (!venta.fecha_pedido) return null
    const f = new Date(venta.fecha_pedido)
    f.setHours(f.getHours() + 72)
    return f
  }

  const puedeAnular = venta => {
    const limite = getFechaLimiteAnulacion(venta)
    if (!limite) return true
    return new Date() <= limite
  }

  const horasRestantesAnulacion = venta => {
    const limite = getFechaLimiteAnulacion(venta)
    if (!limite) return null
    return Math.max(0, Math.ceil((limite - new Date()) / (1000 * 60 * 60)))
  }

  const ventasFiltradas = ventas.filter(v => {
    if (filtroEstado && v.estado_id !== +filtroEstado) return false
    if (filtroBusqueda && !`${v.id} ${v.cliente}`.toLowerCase().includes(filtroBusqueda.toLowerCase())) return false
    if (filtroDesde && v.fecha_pedido && new Date(v.fecha_pedido) < new Date(filtroDesde)) return false
    if (filtroHasta && v.fecha_pedido && new Date(v.fecha_pedido) > new Date(filtroHasta)) return false
    return true
  })

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
    ventasFiltradas, clientes, productos, estados, form, setForm,
    clientesFiltrados, prodBusqueda, prodsFiltrados, clienteBusqueda,
    setProdBusqueda, setClienteBusqueda, setProdsFiltrados,
    modalNuevo, modalDetalle, modalAnular, filtroEstado, filtroBusqueda,
    filtroDesde, setFiltroDesde, filtroHasta, setFiltroHasta,
    setModalNuevo, setModalDetalle, setModalAnular, setFiltroEstado, setFiltroBusqueda,
    buscarProducto, buscarPorCodigo, agregarProducto, quitarProducto, cambiarCantidad,
    totalVenta, handleCrear, anular, getBadge,
    getFechaLimiteAnulacion, puedeAnular, horasRestantesAnulacion,
    descargarReporte,
    clienteSeleccionado, cupoFiadoDisponible, excedeCupoFiado, montoFiado, montoInmediato,
    notaAnulacion, setNotaAnulacion,
    creando: crearVenta.isPending, anulando: anular.isPending,
  }
}