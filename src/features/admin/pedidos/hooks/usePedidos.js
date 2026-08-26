import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pedidosService } from '../services/pedidosService'
import { useCarritoProductos } from '@shared/hooks/useCarritoProductos'
import { useDomicilios }       from './useDomicilios'
import { useTarifas }          from './useTarifas'
import toast from 'react-hot-toast'

const formVacio = {
  tipo_cliente: 'registrado', cliente_id: '', cliente_nombre: '',
  tipo_venta: 'mostrador', notas: '', productos: [],
  dom_tipo_dir: 'registrada', dom_direccion_id: '', dom_direccion_manual: '', dom_tarifa_id: '',
}

export function usePedidos() {
  const qc = useQueryClient()
  const barcodeRef = useRef(null)

  const [tabActivo, setTabActivo]           = useState('pedidos')
  const [modalNuevo, setModalNuevo]         = useState(false)
  const [modalDetalle, setModalDetalle]     = useState({ abierto: false, pedido: null })
  const [modalHistorial, setModalHistorial] = useState({ abierto: false, cliente: null })
  const [modalConfig, setModalConfig]       = useState(false)
  const [form, setForm]                     = useState(formVacio)
  const [clienteBusqueda, setClienteBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado]     = useState('')
  const [filtroDesde, setFiltroDesde]       = useState('')
  const [filtroHasta, setFiltroHasta]       = useState('')
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [configCancelacion, setConfigCancelacion] = useState({ horas: 24 })

  // ── Queries ──
  const { data: pedidos = [] }   = useQuery({ queryKey: ['pedidos'],        queryFn: pedidosService.getAll })
  const { data: clientes = [] }  = useQuery({ queryKey: ['clientes'],       queryFn: pedidosService.getClientes })
  const { data: productos = [] } = useQuery({ queryKey: ['productos'],      queryFn: pedidosService.getProductos })
  const { data: estados = [] }   = useQuery({ queryKey: ['estados-pedido'], queryFn: pedidosService.getEstados })
  const { data: historial = [] } = useQuery({
    queryKey: ['historial', modalHistorial.cliente?.id],
    queryFn:  () => pedidosService.getAll().then(d => d.filter(p => p.cliente_id_ref === modalHistorial.cliente?.id)),
    enabled:  !!modalHistorial.cliente?.id,
  })

  const clienteSelId = form.tipo_cliente === 'registrado' ? form.cliente_id : null
  const { data: direcciones = [] } = useQuery({
    queryKey: ['dirs-dom', clienteSelId],
    queryFn:  () => pedidosService.getDirs(clienteSelId),
    enabled:  !!clienteSelId,
  })

  // ── Sub-hooks ──
  const carrito = useCarritoProductos({ productos, getBarcode: pedidosService.getBarcode })
  const tarifasHook = useTarifas()
  const domHook = useDomicilios({
    modalDetallePedidoId: modalDetalle.pedido?.id,
    clienteDetallId: modalDetalle.pedido?.cliente_id_ref,
  })

  // ── Helpers carrito adaptados ──
  const buscarProducto  = texto => carrito.buscarProducto(texto, setForm)
  const buscarPorCodigo = cod   => carrito.buscarPorCodigo(cod, prod => carrito.agregarProducto(prod, form, setForm))
  const agregarProducto = prod  => carrito.agregarProducto(prod, form, setForm)
  const quitarProducto  = idx   => carrito.quitarProducto(idx, setForm)

  const clientesFiltrados = clientes.filter(c =>
    !clienteBusqueda || `${c.nombre} ${c.apellido}`.toLowerCase().includes(clienteBusqueda.toLowerCase())
  ).slice(0, 6)

  const totalPedido = form.productos.reduce((s, p) => s + p.precio_unitario * p.cantidad, 0)
  const setF = (campo, val) => setForm(prev => ({ ...prev, [campo]: val }))

  // ── Mutations ──
  const crearPedido = useMutation({
    mutationFn: async data => {
      const res = await pedidosService.create({
        cliente_id: data.cliente_id, cliente_nombre: data.cliente_nombre,
        tipo_venta: data.tipo_venta, notas: data.notas, productos: data.productos,
      })
      const pedido_id = res.data.pedido_id || res.data.datos?.id
      if (data.tipo_venta === 'domicilio' && pedido_id) {
        const tarifa = tarifasHook.tarifas.find(t => t.id === +data.dom_tarifa_id)
        await pedidosService.crearDomicilio({
          pedido_id,
          direccion_id:     data.dom_tipo_dir === 'registrada' && data.dom_direccion_id ? +data.dom_direccion_id : null,
          direccion_manual: data.dom_tipo_dir === 'manual' ? data.dom_direccion_manual : null,
          tarifa_id:        data.dom_tarifa_id ? +data.dom_tarifa_id : null,
          tarifa_aplicada:  tarifa?.tarifa || 0,
        })
      }
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries(['pedidos']); qc.invalidateQueries(['domicilios']); qc.invalidateQueries(['productos'])
      setModalNuevo(false); setForm(formVacio)
      carrito.setProdBusqueda(''); setClienteBusqueda('')
      toast.success('Pedido creado correctamente')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error al crear el pedido'),
  })

  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado_id }) => pedidosService.cambiarEstado(id, { estado_id }),
    onSuccess: () => { qc.invalidateQueries(['pedidos']); toast.success('Estado actualizado') },
  })

  const anular = useMutation({
    mutationFn: id => {
      const e = estados.find(e => e.nombre?.toLowerCase().includes('anula'))
      return pedidosService.cambiarEstado(id, { estado_id: e?.id || 3 })
    },
    onSuccess: () => {
      qc.invalidateQueries(['pedidos'])
      setModalDetalle({ abierto: false, pedido: null })
      toast.success('Pedido anulado')
    },
  })

  // ── Handlers ──
  const handleCrear = e => {
    e.preventDefault()
    if (form.tipo_cliente === 'registrado' && !form.cliente_id)             { toast.error('Selecciona un cliente'); return }
    if (form.tipo_cliente === 'manual' && !form.cliente_nombre.trim())       { toast.error('Ingresa el nombre del cliente'); return }
    if (!form.productos.length)                                               { toast.error('Agrega al menos un producto'); return }
    if (form.tipo_venta === 'domicilio') {
      if (form.dom_tipo_dir === 'registrada' && !form.dom_direccion_id && direcciones.length > 0) { toast.error('Selecciona una dirección'); return }
      if (form.dom_tipo_dir === 'manual' && !form.dom_direccion_manual.trim())                    { toast.error('Ingresa la dirección del domicilio'); return }
    }
    crearPedido.mutate({
      cliente_id: form.tipo_cliente === 'registrado' ? form.cliente_id : null,
      cliente_nombre: form.tipo_cliente === 'manual' ? form.cliente_nombre : null,
      tipo_venta: form.tipo_venta, notas: form.notas, productos: form.productos,
      dom_tipo_dir: form.dom_tipo_dir, dom_direccion_id: form.dom_direccion_id,
      dom_direccion_manual: form.dom_direccion_manual, dom_tarifa_id: form.dom_tarifa_id,
    })
  }

  const puedeAnular = pedido => {
    if (!pedido) return false
    const anulado = estados.find(e => e.nombre?.toLowerCase().includes('anula'))
    if (pedido.estado_id === anulado?.id) return false
    return (new Date() - new Date(pedido.fecha_pedido)) / (1000 * 60 * 60) <= configCancelacion.horas
  }

  // ── Filtros ──
  const pedidosFiltrados = pedidos.filter(p => {
    if (filtroEstado    && p.estado_id !== +filtroEstado) return false
    if (filtroDesde     && new Date(p.fecha_pedido) < new Date(filtroDesde)) return false
    if (filtroHasta     && new Date(p.fecha_pedido) > new Date(filtroHasta)) return false
    if (filtroBusqueda  && !`${p.id} ${p.cliente}`.toLowerCase().includes(filtroBusqueda.toLowerCase())) return false
    return true
  })

  return {
    // datos
    pedidosFiltrados, clientes, productos, estados, historial, direcciones,
    clientesFiltrados,
    // form
    form, setF, setForm,
    // carrito
    prodBusqueda:      carrito.prodBusqueda,
    prodsFiltrados:    carrito.prodsFiltrados,
    setProdBusqueda:   carrito.setProdBusqueda,
    setProdsFiltrados: carrito.setProdsFiltrados,
    buscarProducto, buscarPorCodigo, agregarProducto, quitarProducto,
    clienteBusqueda, setClienteBusqueda,
    totalPedido, barcodeRef,
    // modales
    modalNuevo, setModalNuevo,
    modalDetalle, setModalDetalle,
    modalHistorial, setModalHistorial,
    modalConfig, setModalConfig,
    // filtros pedidos
    filtroEstado, setFiltroEstado,
    filtroDesde, setFiltroDesde,
    filtroHasta, setFiltroHasta,
    filtroBusqueda, setFiltroBusqueda,
    // config
    configCancelacion, setConfigCancelacion,
    // helpers
    puedeAnular, handleCrear,
    // mutations
    cambiarEstado, anular,
    // domicilios (spread del sub-hook)
    ...domHook,
    // tarifas (spread del sub-hook)
    ...tarifasHook,
    // loading
    creando:         crearPedido.isPending,
    anulando:        anular.isPending,
    // tabs
    tabActivo, setTabActivo,
  }
}