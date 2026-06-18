import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ventasService } from '../services/ventasService'
import toast from 'react-hot-toast'

export function useVentas() {
  const qc = useQueryClient()
  const [modalNuevo, setModalNuevo]     = useState(false)
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, venta: null })
  const [modalAnular, setModalAnular]   = useState({ abierto: false, venta: null })
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [filtroDesde, setFiltroDesde]   = useState('')
  const [filtroHasta, setFiltroHasta]   = useState('')
  const [form, setForm] = useState({
    tipo_cliente: 'registrado', cliente_id: '', cliente_nombre: '',
    productos: [], tipo_pago: 'total', // 'total' | 'fiado'
  })
  const [prodBusqueda, setProdBusqueda]       = useState('')
  const [prodsFiltrados, setProdsFiltrados]   = useState([])
  const [clienteBusqueda, setClienteBusqueda] = useState('')

  const { data: ventas = [] }    = useQuery({ queryKey: ['pedidos'],        queryFn: ventasService.getAll })
  const { data: clientes = [] }  = useQuery({ queryKey: ['clientes'],       queryFn: ventasService.getClientes })
  const { data: productos = [] } = useQuery({ queryKey: ['productos'],      queryFn: ventasService.getProductos })
  const { data: estados = [] }   = useQuery({ queryKey: ['estados-pedido'], queryFn: ventasService.getEstados })

  const estadoPagado   = estados.find(e => e.nombre?.toLowerCase().includes('paga') || e.nombre?.toLowerCase().includes('complet'))
  const estadoPendiente = estados.find(e => e.nombre?.toLowerCase().includes('pendiente'))

  const getStock = producto_id => productos.find(p => p.id === producto_id)?.stock ?? Infinity

  // Construye, para un producto y una cantidad total deseada, las líneas de carrito
  // necesarias: si la cantidad cabe dentro del lote activo, una sola línea con el
  // precio actual. Si la cruza, dos líneas: una al precio actual (hasta agotar el
  // lote activo) y otra al precio proyectado del siguiente lote (con el resto).
  const construirLineas = (prod, cantidadTotal) => {
    const stockLoteActivo = prod.stock_lote_activo != null ? +prod.stock_lote_activo : null
    const siguienteLote = prod.siguiente_lote || null

    if (stockLoteActivo == null || cantidadTotal <= stockLoteActivo || !siguienteLote) {
      // no hay info de lotes, o la cantidad no cruza, o no hay un siguiente lote disponible:
      // una sola línea al precio actual (tope natural es el stock global, ya validado afuera)
      return [{
        producto_id: prod.id, lote_id: 'activo', cantidad: cantidadTotal,
        precio_unitario: parseFloat(prod.precio), nombre: prod.nombre, stock: prod.stock,
        stock_lote_activo: stockLoteActivo,
      }]
    }

    const cantLinea1 = stockLoteActivo
    const cantLinea2 = cantidadTotal - stockLoteActivo
    const lineas = []
    if (cantLinea1 > 0) {
      lineas.push({
        producto_id: prod.id, lote_id: 'activo', cantidad: cantLinea1,
        precio_unitario: parseFloat(prod.precio), nombre: prod.nombre, stock: prod.stock,
        stock_lote_activo: stockLoteActivo,
      })
    }
    lineas.push({
      producto_id: prod.id, lote_id: siguienteLote.id, cantidad: cantLinea2,
      precio_unitario: siguienteLote.precio_venta_proyectado,
      nombre: prod.nombre, stock: prod.stock,
      stock_lote_activo: stockLoteActivo,
      es_lote_siguiente: true,
    })
    return lineas
  }

  const crearVenta = useMutation({
    mutationFn: async data => {
      const res = await ventasService.create({ ...data, tipo_venta: 'mostrador' })
      const pedido_id = res.data.pedido_id

      if (data._tipo_pago === 'fiado') {
        // fiado: dejar en pendiente, no registrar pago
        if (estadoPendiente) await ventasService.cambiarEstado(pedido_id, { estado_id: estadoPendiente.id })
      } else {
        // pago total: marcar pagado y registrar pago
        if (estadoPagado) await ventasService.cambiarEstado(pedido_id, { estado_id: estadoPagado.id })
        await ventasService.registrarPago({ pedido_id, monto: data._total, metodo: 'efectivo' })
      }
      return res.data
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries(['pedidos']); qc.invalidateQueries(['productos']); qc.invalidateQueries(['pagos'])
      setModalNuevo(false)
      setForm({ tipo_cliente: 'registrado', cliente_id: '', cliente_nombre: '', productos: [], tipo_pago: 'total' })
      setProdBusqueda(''); setClienteBusqueda('')
      toast.success(vars._tipo_pago === 'fiado' ? 'Venta registrada como fiado' : 'Venta registrada y marcada como pagada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })

  const anular = useMutation({
    mutationFn: id => {
      const e = estados.find(e => e.nombre?.toLowerCase().includes('anula'))
      return ventasService.cambiarEstado(id, { estado_id: e?.id || 3 })
    },
    onSuccess: () => { qc.invalidateQueries(['pedidos']); setModalAnular({ abierto: false, venta: null }); toast.success('Venta anulada') },
    onError: err => toast.error(err.response?.data?.mensaje || 'No se pudo anular la venta'),
  })

  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado_id }) => ventasService.cambiarEstado(id, { estado_id }),
    onSuccess: () => { qc.invalidateQueries(['pedidos']); toast.success('Estado actualizado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })

  const clientesFiltrados = clientes.filter(c => !clienteBusqueda || `${c.nombre} ${c.apellido}`.toLowerCase().includes(clienteBusqueda.toLowerCase())).slice(0, 6)

  const buscarProducto = texto => {
    setProdBusqueda(texto)
    if (!texto) { setProdsFiltrados([]); return }
    const t = texto.toLowerCase()
    setProdsFiltrados(productos.filter(p => p.nombre.toLowerCase().includes(t) || (p.codigo_barras && p.codigo_barras.includes(t))).slice(0, 8))
  }

  const buscarPorCodigo = async cod => {
    try {
      const { data } = await ventasService.getBarcode(cod)
      if (data.ok) { agregarProducto(data.datos); toast.success('Agregado: ' + data.datos.nombre) }
      else toast.error('Producto no encontrado')
    } catch { toast.error('Producto no encontrado') }
  }

  // cantidad total ya en el carrito para un producto (sumando todas sus líneas,
  // sin importar si están repartidas entre lote activo y lote siguiente)
  const cantidadEnCarrito = (prods, producto_id) =>
    prods.filter(p => p.producto_id === producto_id).reduce((s, p) => s + (+p.cantidad || 0), 0)

  const agregarProducto = prod => {
    const stock = prod.stock ?? getStock(prod.id)
    const yaEnCarrito = cantidadEnCarrito(form.productos, prod.id)
    const nuevaCantidadTotal = yaEnCarrito + 1

    if (nuevaCantidadTotal > stock) { toast.error(`Stock insuficiente — solo hay ${stock} unidades`); return }

    const lineasNuevas = construirLineas(prod, nuevaCantidadTotal)
    setForm(f => ({
      ...f,
      productos: [...f.productos.filter(p => p.producto_id !== prod.id), ...lineasNuevas],
    }))
    setProdBusqueda(''); setProdsFiltrados([])
  }

  // cambia la cantidad TOTAL deseada para un producto (suma de sus líneas);
  // reconstruye las líneas correspondientes, dividiendo en dos precios si corresponde
  const cambiarCantidadProducto = (producto_id, nuevaCantidadTotal) => {
    const prod = productos.find(p => p.id === producto_id)
    if (!prod) return
    const stock = prod.stock ?? Infinity

    if (nuevaCantidadTotal === '' || nuevaCantidadTotal === 0) {
      setForm(f => ({ ...f, productos: f.productos.map(p =>
        p.producto_id === producto_id ? { ...p, cantidad: '' } : p
      )}))
      return
    }

    const num = Math.max(1, +nuevaCantidadTotal || 1)
    const cant = Math.min(num, stock)
    if (+nuevaCantidadTotal > stock) toast.error(`Stock insuficiente — máximo ${stock} unidades`)

    const lineasNuevas = construirLineas(prod, cant)
    setForm(f => ({
      ...f,
      productos: [...f.productos.filter(p => p.producto_id !== producto_id), ...lineasNuevas],
    }))
  }

  // mantiene compatibilidad con el índice usado en el formulario: identifica
  // la línea por posición, pero el cambio de cantidad aplica al TOTAL del producto
  const cambiarCantidad = (idx, nuevaCantidad) => {
    const linea = form.productos[idx]
    if (!linea) return
    if (nuevaCantidad === '') {
      setForm(f => ({ ...f, productos: f.productos.map((p, i) => i === idx ? { ...p, cantidad: '' } : p) }))
      return
    }
    const otrasLineas = cantidadEnCarrito(form.productos, linea.producto_id) - (+linea.cantidad || 0)
    cambiarCantidadProducto(linea.producto_id, otrasLineas + Math.max(1, +nuevaCantidad || 1))
  }

  const quitarProducto = idx => {
    const linea = form.productos[idx]
    if (!linea) return
    // quitar TODAS las líneas de ese producto (las dos partes del lote, si las hay)
    setForm(f => ({ ...f, productos: f.productos.filter(p => p.producto_id !== linea.producto_id) }))
  }

  const totalVenta = form.productos.reduce((s, p) => s + p.precio_unitario * (+p.cantidad || 0), 0)

  const handleCrear = e => {
    e.preventDefault()
    if (form.tipo_cliente === 'registrado' && !form.cliente_id) { toast.error('Selecciona un cliente'); return }
    if (form.tipo_cliente === 'manual' && !form.cliente_nombre.trim()) { toast.error('Ingresa el nombre del cliente'); return }
    if (!form.productos.length) { toast.error('Agrega al menos un producto'); return }
    for (const p of form.productos) {
      if (!p.cantidad || +p.cantidad < 1) { toast.error(`${p.nombre}: la cantidad debe ser al menos 1`); return }
    }
    // validar stock total por producto (sumando sus líneas)
    const totalesPorProducto = {}
    for (const p of form.productos) totalesPorProducto[p.producto_id] = (totalesPorProducto[p.producto_id] || 0) + (+p.cantidad || 0)
    for (const producto_id of Object.keys(totalesPorProducto)) {
      const stock = getStock(+producto_id)
      if (totalesPorProducto[producto_id] > stock) {
        const nombre = form.productos.find(p => p.producto_id === +producto_id)?.nombre
        toast.error(`${nombre}: solo hay ${stock} unidades en stock`); return
      }
    }
    crearVenta.mutate({
      cliente_id:     form.tipo_cliente === 'registrado' ? form.cliente_id    : null,
      cliente_nombre: form.tipo_cliente === 'manual'     ? form.cliente_nombre : null,
      productos:      form.productos,
      _total:         totalVenta,
      _tipo_pago:     form.tipo_pago,
    })
  }

  const getBadge = n => {
    if (!n) return 'badge-pendiente'
    const l = n.toLowerCase()
    if (l.includes('anula')) return 'badge-anulado'
    if (l.includes('entrega') || l.includes('paga') || l.includes('complet')) return 'badge-activo'
    return 'badge-pendiente'
  }

  // Ventana de anulación: aplica a TODAS las ventas, 72 horas.
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
    creando: crearVenta.isPending, anulando: anular.isPending,
  }
}