import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordenesService } from '../services/ordenesService'
import { useAuth } from '@shared/contexts/AuthContext'
import toast from 'react-hot-toast'
 
const ESTADOS_ORDEN = [
  { key: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { key: 'pagada',    label: 'Pagada',    color: 'green'  },
  { key: 'vencida',   label: 'Vencida',   color: 'red'    },
  { key: 'anulado',   label: 'Anulado',   color: 'gray'   },
]
 
const formVacio = {
  proveedor_id: '', productos: [],
  fecha_compra: new Date().toISOString().split('T')[0],
  metodo_pago: 'Efectivo',
  estado: 'pendiente',
  fecha_limite_pago: '',
  notas: '',
}
 
export function useOrdenes() {
  const qc = useQueryClient()
  const { usuario } = useAuth()
 
  const [modalNuevo, setModalNuevo]     = useState(false)
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, orden: null })
  const [filtroEstado, setFiltroEstado]         = useState('')
  const [filtroProveedor, setFiltroProveedor]   = useState('')
  const [form, setForm]             = useState(formVacio)
  const [itemForm, setItemForm]     = useState({ producto_id: '', costo_unitario: '', cantidad: 1 })
  const [facturaFile, setFacturaFile]           = useState(null)
  const [facturaPreview, setFacturaPreview]     = useState('')
  const [prodBusqueda, setProdBusqueda]         = useState('')
  const [prodsFiltrados, setProdsFiltrados]     = useState([])
  const [provBusqueda, setProvBusqueda]         = useState('')
  const [provsFiltrados, setProvsFiltrados]     = useState([])
  const [provSeleccionado, setProvSeleccionado] = useState(null)
 
  const { data: ordenes = [] }     = useQuery({ queryKey: ['ordenes'],        queryFn: ordenesService.getAll })
  const { data: proveedores = [] } = useQuery({ queryKey: ['proveedores'],    queryFn: ordenesService.getProveedores })
  const { data: productos = [] }   = useQuery({ queryKey: ['productos'],      queryFn: ordenesService.getProductos })
  const { data: estadosBD = [] }   = useQuery({ queryKey: ['estados-compra'], queryFn: ordenesService.getEstados })
 
  const getKeyEstado = nombre => {
    if (!nombre) return 'pendiente'
    const n = nombre.toLowerCase()
    if (n.includes('paga') || n.includes('complet') || n.includes('recibi')) return 'pagada'
    if (n.includes('venci')) return 'vencida'
    if (n.includes('anula') || n.includes('cancel')) return 'anulado'
    return 'pendiente'
  }
 
  // detectar órdenes vencidas automáticamente
  const ordenesConEstado = ordenes.map(o => {
    if (getKeyEstado(o.estado) === 'pendiente' && o.fecha_limite_pago) {
      if (new Date(o.fecha_limite_pago) < new Date()) return { ...o, _vencida: true }
    }
    return o
  })
 
  const getEstadoId = key => {
    const mapa = { pendiente: ['pendiente'], pagada: ['paga','complet','recibi'], vencida: ['venci'], anulado: ['anula','cancel'] }
    return estadosBD.find(e => mapa[key]?.some(k => e.nombre?.toLowerCase().includes(k)))?.id
  }
 
  const crear = useMutation({
    mutationFn: async data => {
      const formData = new FormData()
      formData.append('proveedor_id',       data.proveedor_id)
      formData.append('fecha_compra',       data.fecha_compra)
      formData.append('metodo_pago',        data.metodo_pago)
      formData.append('estado',             data.estado)
      formData.append('fecha_limite_pago',  data.fecha_limite_pago || '')
      formData.append('notas',              data.notas || '')
      formData.append('registrado_por',     usuario?.id || '')
      formData.append('productos',          JSON.stringify(data.productos))
      if (facturaFile) formData.append('factura', facturaFile)
      return ordenesService.create(formData)
    },
    onSuccess: () => {
      qc.invalidateQueries(['ordenes'])
      setModalNuevo(false)
      setForm(formVacio)
      setProvBusqueda(''); setProvSeleccionado(null)
      setFacturaFile(null); setFacturaPreview('')
      toast.success('Orden creada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })
 
  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado_id }) => ordenesService.cambiarEstado(id, { estado_id }),
    onSuccess: () => { qc.invalidateQueries(['ordenes']); qc.invalidateQueries(['productos']); toast.success('Estado actualizado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })
 
  const handleFacturaChange = e => {
    const file = e.target.files[0]
    if (!file) return
    setFacturaFile(file)
    setFacturaPreview(file.name)
  }
 
  const buscarProveedor = texto => {
    setProvBusqueda(texto); setForm(p => ({ ...p, proveedor_id: '' })); setProvSeleccionado(null)
    if (!texto) { setProvsFiltrados([]); return }
    setProvsFiltrados(proveedores.filter(p => p.nombre.toLowerCase().includes(texto.toLowerCase())).slice(0, 6))
  }
  const buscarProducto = texto => {
    setProdBusqueda(texto)
    if (!texto) { setProdsFiltrados([]); return }
    const t = texto.toLowerCase()
    setProdsFiltrados(productos.filter(p =>
      p.nombre.toLowerCase().includes(t) || (p.codigo_barras && p.codigo_barras.includes(t))
    ).slice(0, 8))
  }
  const buscarPorCodigo = async cod => {
    try {
      const { data } = await ordenesService.getBarcode(cod)
      if (data.ok) { setItemForm(p => ({ ...p, producto_id: data.datos.id, costo_unitario: data.datos.precio })); setProdBusqueda(data.datos.nombre) }
      else toast.error('Producto no encontrado')
    } catch { toast.error('Producto no encontrado') }
  }
  const agregarItem = () => {
    if (!itemForm.producto_id)                         { toast.error('Selecciona un producto'); return }
    if (!itemForm.costo_unitario || +itemForm.costo_unitario <= 0) { toast.error('Ingresa el costo'); return }
    const prod = productos.find(p => p.id === +itemForm.producto_id)
    if (form.productos.find(p => p.producto_id === +itemForm.producto_id)) { toast.error('Producto ya agregado'); return }
    setForm(p => ({ ...p, productos: [...p.productos, {
      producto_id: +itemForm.producto_id, nombre: prod?.nombre,
      costo_unitario: +itemForm.costo_unitario, cantidad: +itemForm.cantidad,
    }]}))
    setItemForm({ producto_id: '', costo_unitario: '', cantidad: 1 })
    setProdBusqueda(''); setProdsFiltrados([])
  }
  const quitarItem = idx => setForm(p => ({ ...p, productos: p.productos.filter((_, i) => i !== idx) }))
  const totalOrden = form.productos.reduce((s, p) => s + p.costo_unitario * p.cantidad, 0)
 
  const handleCrear = e => {
    e.preventDefault()
    if (!form.proveedor_id)      { toast.error('Selecciona un proveedor'); return }
    if (!form.fecha_compra)      { toast.error('Ingresa la fecha de compra'); return }
    if (!form.productos.length)  { toast.error('Agrega al menos un producto'); return }
    crear.mutate(form)
  }
 
  const ordenesFiltradas = ordenesConEstado.filter(o => {
    if (filtroEstado && getKeyEstado(o.estado) !== filtroEstado && !(filtroEstado === 'vencida' && o._vencida)) return false
    if (filtroProveedor && o.proveedor_id !== +filtroProveedor) return false
    return true
  })
 
  // notificaciones de facturas vencidas
  const ordenesVencidas = ordenesConEstado.filter(o => o._vencida).length
 
  return {
    ordenesFiltradas, proveedores, productos, estadosBD, ordenesVencidas,
    modalNuevo, modalDetalle, filtroEstado, filtroProveedor,
    setModalNuevo, setModalDetalle, setFiltroEstado, setFiltroProveedor,
    form, setForm, itemForm, setItemForm,
    facturaPreview, handleFacturaChange,
    prodBusqueda, prodsFiltrados, provBusqueda, provsFiltrados, provSeleccionado,
    buscarProveedor, buscarProducto, buscarPorCodigo, agregarItem, quitarItem,
    setProvSeleccionado, setProvBusqueda, setProdBusqueda,
    totalOrden, handleCrear, cambiarEstado,
    ESTADOS_ORDEN, getEstadoId, getKeyEstado,
    creando: crear.isPending,
  }
}
 
