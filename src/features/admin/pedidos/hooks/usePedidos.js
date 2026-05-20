import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pedidosService } from '../services/pedidosService'
import toast from 'react-hot-toast'
 
const ESTADOS_DOM = [
  { key: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { key: 'entregado', label: 'Entregado', color: 'green'  },
  { key: 'anulado',   label: 'Anulado',   color: 'red'    },
]
const formVacio = {
  tipo_cliente: 'registrado', cliente_id: '', cliente_nombre: '',
  tipo_venta: 'mostrador', notas: '', productos: [],
  dom_tipo_dir: 'registrada', dom_direccion_id: '', dom_direccion_manual: '', dom_tarifa_id: '',
}
const tarifaVacia = { barrio: '', zona: '', tarifa: '', distancia_km: '' }
 
export function usePedidos() {
  const qc = useQueryClient()
  const barcodeRef = useRef(null)
  const [tabActivo, setTabActivo]             = useState('pedidos')
  const [modalNuevo, setModalNuevo]           = useState(false)
  const [modalDetalle, setModalDetalle]       = useState({ abierto: false, pedido: null })
  const [modalHistorial, setModalHistorial]   = useState({ abierto: false, cliente: null })
  const [modalConfig, setModalConfig]         = useState(false)
  const [form, setForm]                       = useState(formVacio)
  const [prodBusqueda, setProdBusqueda]       = useState('')
  const [prodsFiltrados, setProdsFiltrados]   = useState([])
  const [clienteBusqueda, setClienteBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado]       = useState('')
  const [filtroDesde, setFiltroDesde]         = useState('')
  const [filtroHasta, setFiltroHasta]         = useState('')
  const [filtroBusqueda, setFiltroBusqueda]   = useState('')
  const [filtroDom, setFiltroDom]             = useState('')
  const [formTarifa, setFormTarifa]           = useState(tarifaVacia)
  const [modalElimTarifa, setModalElimTarifa] = useState({ abierto: false, item: null })
  const [formDomDetalle, setFormDomDetalle]   = useState({ tipo_dir: 'manual', direccion_id: '', direccion_manual: '', tarifa_id: '' })
  const [configCancelacion, setConfigCancelacion] = useState({ horas: 24 })
 
  // ── queries ──
  const { data: pedidos = [] }    = useQuery({ queryKey: ['pedidos'],        queryFn: pedidosService.getAll })
  const { data: domicilios = [] } = useQuery({ queryKey: ['domicilios'],     queryFn: pedidosService.getDomicilios })
  const { data: clientes = [] }   = useQuery({ queryKey: ['clientes'],       queryFn: pedidosService.getClientes })
  const { data: productos = [] }  = useQuery({ queryKey: ['productos'],      queryFn: pedidosService.getProductos })
  const { data: estados = [] }    = useQuery({ queryKey: ['estados-pedido'], queryFn: pedidosService.getEstados })
  const { data: estadosDom = [] } = useQuery({ queryKey: ['estados-dom'],    queryFn: pedidosService.getEstadosDom })
  const { data: tarifas = [], refetch: refetchTarifas } = useQuery({ queryKey: ['tarifas'], queryFn: pedidosService.getTarifas })
  const { data: historial = [] }  = useQuery({
    queryKey: ['historial', modalHistorial.cliente?.id],
    queryFn: () => pedidosService.getAll().then(d => d.filter(p => p.cliente_id_ref === modalHistorial.cliente?.id)),
    enabled: !!modalHistorial.cliente?.id,
  })
  const { data: domDetalle } = useQuery({
    queryKey: ['dom-pedido', modalDetalle.pedido?.id],
    queryFn: () => pedidosService.getDomPedido(modalDetalle.pedido?.id),
    enabled: !!modalDetalle.pedido?.id,
  })
  const clienteSelId = form.tipo_cliente === 'registrado' ? form.cliente_id : null
  const { data: direcciones = [] } = useQuery({
    queryKey: ['dirs-dom', clienteSelId],
    queryFn: () => pedidosService.getDirs(clienteSelId),
    enabled: !!clienteSelId,
  })
  const clienteDetallId = modalDetalle.pedido?.cliente_id_ref
  const { data: dirsDetalle = [] } = useQuery({
    queryKey: ['dirs-detalle', clienteDetallId],
    queryFn: () => pedidosService.getDirs(clienteDetallId),
    enabled: !!clienteDetallId,
  })
 
  // ── mutations ──
  const crearPedido = useMutation({
    mutationFn: async data => {
      const res = await pedidosService.create({
        cliente_id: data.cliente_id, cliente_nombre: data.cliente_nombre,
        tipo_venta: data.tipo_venta, notas: data.notas, productos: data.productos,
      })
      const pedido_id = res.data.pedido_id || res.data.datos?.id
      if (data.tipo_venta === 'domicilio' && pedido_id) {
        const tarifa = tarifas.find(t => t.id === +data.dom_tarifa_id)
        await pedidosService.crearDomicilio({
          pedido_id,
          direccion_id: data.dom_tipo_dir === 'registrada' && data.dom_direccion_id ? +data.dom_direccion_id : null,
          direccion_manual: data.dom_tipo_dir === 'manual' ? data.dom_direccion_manual : null,
          tarifa_id: data.dom_tarifa_id ? +data.dom_tarifa_id : null,
          tarifa_aplicada: tarifa?.tarifa || 0,
        })
      }
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries(['pedidos']); qc.invalidateQueries(['domicilios']); qc.invalidateQueries(['productos'])
      setModalNuevo(false); setForm(formVacio); setProdBusqueda(''); setClienteBusqueda('')
      toast.success('Pedido creado correctamente')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error al crear el pedido'),
  })
 
  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado_id }) => pedidosService.cambiarEstado(id, { estado_id }),
    onSuccess: () => { qc.invalidateQueries(['pedidos']); toast.success('Estado actualizado') },
  })
  const cambiarEstadoDom = useMutation({
    mutationFn: ({ id, estado_id }) => pedidosService.cambiarEstadoDom(id, { estado_id }),
    onSuccess: () => { qc.invalidateQueries(['domicilios']); qc.invalidateQueries(['dom-pedido', modalDetalle.pedido?.id]); toast.success('Estado del domicilio actualizado') },
  })
  const asignarDomicilio = useMutation({
    mutationFn: pedidosService.crearDomicilio,
    onSuccess: () => { qc.invalidateQueries(['dom-pedido', modalDetalle.pedido?.id]); qc.invalidateQueries(['domicilios']); toast.success('Domicilio asignado') },
  })
  const anular = useMutation({
    mutationFn: id => {
      const e = estados.find(e => e.nombre?.toLowerCase().includes('anula'))
      return pedidosService.cambiarEstado(id, { estado_id: e?.id || 3 })
    },
    onSuccess: () => { qc.invalidateQueries(['pedidos']); setModalDetalle({ abierto: false, pedido: null }); toast.success('Pedido anulado') },
  })
  const guardarTarifa = useMutation({
    mutationFn: pedidosService.crearTarifa,
    onSuccess: () => { refetchTarifas(); setFormTarifa(tarifaVacia); toast.success('Tarifa guardada') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })
  const eliminarTarifa = useMutation({
    mutationFn: pedidosService.eliminarTarifa,
    onSuccess: () => { refetchTarifas(); setModalElimTarifa({ abierto: false, item: null }); toast.success('Tarifa eliminada') },
    onError: err => toast.error(err.response?.data?.mensaje || 'No se puede eliminar'),
  })
 
  // ── helpers productos ──
  const clientesFiltrados = clientes.filter(c =>
    !clienteBusqueda || `${c.nombre} ${c.apellido}`.toLowerCase().includes(clienteBusqueda.toLowerCase())
  ).slice(0, 6)
 
  const buscarProducto = texto => {
    setProdBusqueda(texto)
    if (!texto) { setProdsFiltrados([]); return }
    const t = texto.toLowerCase()
    setProdsFiltrados(productos.filter(p => p.nombre.toLowerCase().includes(t) || (p.codigo_barras && p.codigo_barras.includes(t))).slice(0, 8))
  }
  const buscarPorCodigo = async cod => {
    try {
      const { data } = await pedidosService.getBarcode(cod)
      if (data.ok) { agregarProducto(data.datos); toast.success(`Agregado: ${data.datos.nombre}`) }
      else toast.error('Producto no encontrado')
    } catch { toast.error('Producto no encontrado') }
  }
  const agregarProducto = prod => {
    const id = prod.id || prod.producto_id
    const existe = form.productos.find(p => p.producto_id === id)
    if (existe) setForm(f => ({ ...f, productos: f.productos.map(p => p.producto_id === id ? { ...p, cantidad: p.cantidad + 1 } : p) }))
    else setForm(f => ({ ...f, productos: [...f.productos, { producto_id: id, cantidad: 1, precio_unitario: parseFloat(prod.precio), nombre: prod.nombre }] }))
    setProdBusqueda(''); setProdsFiltrados([])
  }
  const quitarProducto = idx => setForm(f => ({ ...f, productos: f.productos.filter((_, i) => i !== idx) }))
  const totalPedido    = form.productos.reduce((s, p) => s + p.precio_unitario * p.cantidad, 0)
  const setF = (campo, val) => setForm(prev => ({ ...prev, [campo]: val }))
 
  const handleCrear = e => {
    e.preventDefault()
    if (form.tipo_cliente === 'registrado' && !form.cliente_id) { toast.error('Selecciona un cliente'); return }
    if (form.tipo_cliente === 'manual' && !form.cliente_nombre.trim()) { toast.error('Ingresa el nombre del cliente'); return }
    if (!form.productos.length) { toast.error('Agrega al menos un producto'); return }
    if (form.tipo_venta === 'domicilio') {
      if (form.dom_tipo_dir === 'registrada' && !form.dom_direccion_id && direcciones.length > 0) { toast.error('Selecciona una dirección'); return }
      if (form.dom_tipo_dir === 'manual' && !form.dom_direccion_manual.trim()) { toast.error('Ingresa la dirección del domicilio'); return }
    }
    crearPedido.mutate({
      cliente_id: form.tipo_cliente === 'registrado' ? form.cliente_id : null,
      cliente_nombre: form.tipo_cliente === 'manual' ? form.cliente_nombre : null,
      tipo_venta: form.tipo_venta, notas: form.notas, productos: form.productos,
      dom_tipo_dir: form.dom_tipo_dir, dom_direccion_id: form.dom_direccion_id,
      dom_direccion_manual: form.dom_direccion_manual, dom_tarifa_id: form.dom_tarifa_id,
    })
  }
 
  const handleAsignarDomDetalle = () => {
    if (formDomDetalle.tipo_dir === 'manual' && !formDomDetalle.direccion_manual.trim()) { toast.error('Ingresa la dirección'); return }
    if (formDomDetalle.tipo_dir === 'registrada' && !formDomDetalle.direccion_id) { toast.error('Selecciona una dirección'); return }
    const tarifa = tarifas.find(t => t.id === +formDomDetalle.tarifa_id)
    asignarDomicilio.mutate({
      pedido_id: modalDetalle.pedido.id,
      direccion_id: formDomDetalle.tipo_dir === 'registrada' ? +formDomDetalle.direccion_id : null,
      direccion_manual: formDomDetalle.tipo_dir === 'manual' ? formDomDetalle.direccion_manual : null,
      tarifa_id: formDomDetalle.tarifa_id ? +formDomDetalle.tarifa_id : null,
      tarifa_aplicada: tarifa?.tarifa || 0,
    })
  }
 
  const handleGuardarTarifa = () => {
    if (!formTarifa.barrio.trim()) { toast.error('El barrio es obligatorio'); return }
    if (!formTarifa.tarifa || +formTarifa.tarifa <= 0) { toast.error('Ingresa una tarifa válida'); return }
    guardarTarifa.mutate(formTarifa)
  }
 
  const puedeAnular = pedido => {
    if (!pedido) return false
    const anulado = estados.find(e => e.nombre?.toLowerCase().includes('anula'))
    if (pedido.estado_id === anulado?.id) return false
    return (new Date() - new Date(pedido.fecha_pedido)) / (1000 * 60 * 60) <= configCancelacion.horas
  }
 
  const getKeyEstadoDom = nombre => {
    if (!nombre) return 'pendiente'
    const n = nombre.toLowerCase()
    if (n.includes('entrega') || n.includes('complet')) return 'entregado'
    if (n.includes('anula')  || n.includes('cancel'))   return 'anulado'
    return 'pendiente'
  }
  const getEstadoDomId = key => {
    const mapa = { pendiente: ['pendiente'], entregado: ['entregado','complet'], anulado: ['anulado','cancel'] }
    return estadosDom.find(e => mapa[key]?.some(k => e.nombre?.toLowerCase().includes(k)))?.id
  }
 
  const pedidosFiltrados = pedidos.filter(p => {
    if (filtroEstado   && p.estado_id !== +filtroEstado) return false
    if (filtroDesde    && new Date(p.fecha_pedido) < new Date(filtroDesde)) return false
    if (filtroHasta    && new Date(p.fecha_pedido) > new Date(filtroHasta)) return false
    if (filtroBusqueda && !`${p.id} ${p.cliente}`.toLowerCase().includes(filtroBusqueda.toLowerCase())) return false
    return true
  })
  const domFiltrados = domicilios.filter(d => !filtroDom || getKeyEstadoDom(d.estado) === filtroDom)
 
  return {
    // datos
    pedidosFiltrados, domFiltrados, tarifas, clientes, productos, estados, estadosDom, historial, domDetalle, direcciones, dirsDetalle,
    clientesFiltrados,
    // form nuevo pedido
    form, setF, setForm, prodBusqueda, prodsFiltrados, clienteBusqueda,
    setClienteBusqueda, setProdBusqueda, setProdsFiltrados,
    buscarProducto, buscarPorCodigo, agregarProducto, quitarProducto, totalPedido,
    handleCrear, barcodeRef,
    // modales
    modalNuevo, setModalNuevo, modalDetalle, setModalDetalle,
    modalHistorial, setModalHistorial, modalConfig, setModalConfig,
    // filtros pedidos
    filtroEstado, setFiltroEstado, filtroDesde, setFiltroDesde,
    filtroHasta, setFiltroHasta, filtroBusqueda, setFiltroBusqueda,
    // filtro domicilios
    filtroDom, setFiltroDom,
    // domicilio en detalle
    formDomDetalle, setFormDomDetalle, handleAsignarDomDetalle,
    // tarifas
    formTarifa, setFormTarifa, modalElimTarifa, setModalElimTarifa, handleGuardarTarifa,
    // config
    configCancelacion, setConfigCancelacion,
    // helpers
    getKeyEstadoDom, getEstadoDomId, ESTADOS_DOM, puedeAnular,
    // mutations estado
    cambiarEstado, cambiarEstadoDom, anular, asignarDomicilio, guardarTarifa, eliminarTarifa,
    // loading
    creando: crearPedido.isPending, anulando: anular.isPending,
    asignando: asignarDomicilio.isPending, guardandoTarifa: guardarTarifa.isPending,
    eliminandoTarifa: eliminarTarifa.isPending,
    // tabs
    tabActivo, setTabActivo,
  }
}
