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
  const [form, setForm] = useState({ tipo_cliente: 'registrado', cliente_id: '', cliente_nombre: '', productos: [] })
  const [prodBusqueda, setProdBusqueda]       = useState('')
  const [prodsFiltrados, setProdsFiltrados]   = useState([])
  const [clienteBusqueda, setClienteBusqueda] = useState('')

  const { data: ventas = [] }    = useQuery({ queryKey: ['pedidos'],        queryFn: ventasService.getAll })
  const { data: clientes = [] }  = useQuery({ queryKey: ['clientes'],       queryFn: ventasService.getClientes })
  const { data: productos = [] } = useQuery({ queryKey: ['productos'],      queryFn: ventasService.getProductos })
  const { data: estados = [] }   = useQuery({ queryKey: ['estados-pedido'], queryFn: ventasService.getEstados })

  const estadoPagado = estados.find(e => e.nombre?.toLowerCase().includes('paga') || e.nombre?.toLowerCase().includes('complet'))

  // obtener stock real de un producto por su id
  const getStock = producto_id => productos.find(p => p.id === producto_id)?.stock ?? Infinity

  const crearVenta = useMutation({
    mutationFn: async data => {
      const res = await ventasService.create({ ...data, tipo_venta: 'mostrador' })
      const pedido_id = res.data.pedido_id
      if (estadoPagado) await ventasService.cambiarEstado(pedido_id, { estado_id: estadoPagado.id })
      await ventasService.registrarPago({ pedido_id, monto: data._total, metodo: 'efectivo' })
      return res.data
    },
    onSuccess: () => {
      qc.invalidateQueries(['pedidos']); qc.invalidateQueries(['productos']); qc.invalidateQueries(['pagos'])
      setModalNuevo(false); setForm({ tipo_cliente: 'registrado', cliente_id: '', cliente_nombre: '', productos: [] })
      setProdBusqueda(''); setClienteBusqueda('')
      toast.success('Venta registrada y marcada como pagada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })

  const anular = useMutation({
    mutationFn: id => {
      const e = estados.find(e => e.nombre?.toLowerCase().includes('anula'))
      return ventasService.cambiarEstado(id, { estado_id: e?.id || 3 })
    },
    onSuccess: () => { qc.invalidateQueries(['pedidos']); setModalAnular({ abierto: false, venta: null }); toast.success('Venta anulada') },
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

  const agregarProducto = prod => {
    const stock = prod.stock ?? getStock(prod.id)
    const existe = form.productos.find(p => p.producto_id === prod.id)
    if (existe) {
      if (existe.cantidad >= stock) {
        toast.error(`Stock insuficiente — solo hay ${stock} unidades`)
        return
      }
      setForm(f => ({ ...f, productos: f.productos.map(p =>
        p.producto_id === prod.id ? { ...p, cantidad: p.cantidad + 1 } : p
      )}))
    } else {
      if (stock < 1) { toast.error('Sin stock disponible'); return }
      setForm(f => ({ ...f, productos: [...f.productos, {
        producto_id: prod.id,
        cantidad: 1,
        precio_unitario: parseFloat(prod.precio),
        nombre: prod.nombre,
        stock, // guardamos el stock para validar en el form
      }]}))
    }
    setProdBusqueda(''); setProdsFiltrados([])
  }

  // cambia cantidad con validación de stock y mínimo 1
  const cambiarCantidad = (idx, nuevaCantidad) => {
    const prod = form.productos[idx]
    const stock = prod.stock ?? getStock(prod.producto_id)
    const cant = Math.max(1, Math.min(+nuevaCantidad || 1, stock))
    if (+nuevaCantidad > stock) toast.error(`Stock insuficiente — máximo ${stock} unidades`)
    setForm(f => ({ ...f, productos: f.productos.map((p, i) =>
      i === idx ? { ...p, cantidad: cant } : p
    )}))
  }

  const quitarProducto = idx => setForm(f => ({ ...f, productos: f.productos.filter((_, i) => i !== idx) }))
  const totalVenta = form.productos.reduce((s, p) => s + p.precio_unitario * p.cantidad, 0)

  const handleCrear = e => {
    e.preventDefault()
    if (form.tipo_cliente === 'registrado' && !form.cliente_id) { toast.error('Selecciona un cliente'); return }
    if (form.tipo_cliente === 'manual' && !form.cliente_nombre.trim()) { toast.error('Ingresa el nombre del cliente'); return }
    if (!form.productos.length) { toast.error('Agrega al menos un producto'); return }
    // validación final de stock
    for (const p of form.productos) {
      const stock = p.stock ?? getStock(p.producto_id)
      if (p.cantidad > stock) { toast.error(`${p.nombre}: solo hay ${stock} unidades en stock`); return }
    }
    crearVenta.mutate({
      cliente_id:    form.tipo_cliente === 'registrado' ? form.cliente_id    : null,
      cliente_nombre:form.tipo_cliente === 'manual'     ? form.cliente_nombre : null,
      productos: form.productos, _total: totalVenta,
    })
  }

  const getBadge = n => { if (!n) return 'badge-pendiente'; const l=n.toLowerCase(); if(l.includes('anula')) return 'badge-anulado'; if(l.includes('entrega')||l.includes('paga')||l.includes('complet')) return 'badge-activo'; return 'badge-pendiente' }

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
    totalVenta, handleCrear, anular, cambiarEstado, getBadge,
    creando: crearVenta.isPending, anulando: anular.isPending,
  }
}