import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordenesService } from '../services/ordenesService'
import toast from 'react-hot-toast'
 
const ESTADOS_ORDEN = [
  { key: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { key: 'recibido',  label: 'Recibido',  color: 'green'  },
  { key: 'anulado',   label: 'Anulado',   color: 'red'    },
]
 
export function useOrdenes() {
  const qc = useQueryClient()
  const [modalNuevo, setModalNuevo]     = useState(false)
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, orden: null })
  const [filtroEstado, setFiltroEstado] = useState('')
  const [form, setForm]             = useState({ proveedor_id: '', productos: [] })
  const [itemForm, setItemForm]     = useState({ producto_id: '', costo_unitario: '', cantidad: 1 })
  const [prodBusqueda, setProdBusqueda]         = useState('')
  const [prodsFiltrados, setProdsFiltrados]     = useState([])
  const [provBusqueda, setProvBusqueda]         = useState('')
  const [provsFiltrados, setProvsFiltrados]     = useState([])
  const [provSeleccionado, setProvSeleccionado] = useState(null)
 
  const { data: ordenes = [] }    = useQuery({ queryKey: ['ordenes'],     queryFn: ordenesService.getAll })
  const { data: proveedores = [] }= useQuery({ queryKey: ['proveedores'], queryFn: ordenesService.getProveedores })
  const { data: productos = [] }  = useQuery({ queryKey: ['productos'],   queryFn: ordenesService.getProductos })
  const { data: estadosBD = [] }  = useQuery({ queryKey: ['estados-compra'], queryFn: ordenesService.getEstados })
 
  const getEstadoId = key => {
    const mapa = { pendiente: ['pendiente'], recibido: ['recibi','aproba','completad'], anulado: ['anula','cancel'] }
    return estadosBD.find(e => mapa[key]?.some(k => e.nombre?.toLowerCase().includes(k)))?.id
  }
 
  const crear = useMutation({
    mutationFn: ordenesService.create,
    onSuccess: () => { qc.invalidateQueries(['ordenes']); setModalNuevo(false); setForm({ proveedor_id:'', productos:[] }); setProvBusqueda(''); setProvSeleccionado(null); toast.success('Orden creada') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })
  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado_id }) => ordenesService.cambiarEstado(id, { estado_id }),
    onSuccess: () => { qc.invalidateQueries(['ordenes']); qc.invalidateQueries(['productos']); toast.success('Estado actualizado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })
 
  const buscarProveedor = texto => {
    setProvBusqueda(texto); setForm(p => ({ ...p, proveedor_id: '' })); setProvSeleccionado(null)
    if (!texto) { setProvsFiltrados([]); return }
    setProvsFiltrados(proveedores.filter(p => p.nombre.toLowerCase().includes(texto.toLowerCase())).slice(0, 6))
  }
  const buscarProducto = texto => {
    setProdBusqueda(texto)
    if (!texto) { setProdsFiltrados([]); return }
    const t = texto.toLowerCase()
    setProdsFiltrados(productos.filter(p => p.nombre.toLowerCase().includes(t) || (p.codigo_barras && p.codigo_barras.includes(t))).slice(0, 8))
  }
  const buscarPorCodigo = async cod => {
    try {
      const { data } = await ordenesService.getBarcode(cod)
      if (data.ok) { setItemForm(p => ({ ...p, producto_id: data.datos.id, costo_unitario: data.datos.precio })); setProdBusqueda(data.datos.nombre); toast.success('Encontrado: ' + data.datos.nombre) }
      else toast.error('Producto no encontrado')
    } catch { toast.error('Producto no encontrado') }
  }
  const agregarItem = () => {
    if (!itemForm.producto_id) { toast.error('Selecciona un producto'); return }
    if (!itemForm.costo_unitario || +itemForm.costo_unitario <= 0) { toast.error('Ingresa el costo'); return }
    const prod = productos.find(p => p.id === +itemForm.producto_id)
    if (form.productos.find(p => p.producto_id === +itemForm.producto_id)) { toast.error('Producto ya agregado'); return }
    setForm(p => ({ ...p, productos: [...p.productos, { producto_id: +itemForm.producto_id, nombre: prod?.nombre, costo_unitario: +itemForm.costo_unitario, cantidad: +itemForm.cantidad }] }))
    setItemForm({ producto_id: '', costo_unitario: '', cantidad: 1 })
    setProdBusqueda(''); setProdsFiltrados([])
  }
  const quitarItem = idx => setForm(p => ({ ...p, productos: p.productos.filter((_, i) => i !== idx) }))
  const totalOrden = form.productos.reduce((s, p) => s + p.costo_unitario * p.cantidad, 0)
 
  const handleCrear = e => {
    e.preventDefault()
    if (!form.proveedor_id) { toast.error('Selecciona un proveedor'); return }
    if (!form.productos.length) { toast.error('Agrega al menos un producto'); return }
    crear.mutate(form)
  }
 
  const getKeyEstado = nombre => {
    if (!nombre) return 'pendiente'
    const n = nombre.toLowerCase()
    if (n.includes('recibi') || n.includes('aproba') || n.includes('complet')) return 'recibido'
    if (n.includes('anula') || n.includes('cancel')) return 'anulado'
    return 'pendiente'
  }
 
  const ordenesFiltradas = ordenes.filter(o => {
    if (!filtroEstado) return true
    return getKeyEstado(o.estado) === filtroEstado
  })
 
  return {
    ordenesFiltradas, proveedores, productos, estadosBD,
    modalNuevo, modalDetalle, filtroEstado,
    setModalNuevo, setModalDetalle, setFiltroEstado,
    form, setForm, itemForm, setItemForm,
    prodBusqueda, prodsFiltrados, provBusqueda, provsFiltrados, provSeleccionado,
    buscarProveedor, buscarProducto, buscarPorCodigo, agregarItem, quitarItem,
    setProvSeleccionado, setProvBusqueda, setProdBusqueda,
    totalOrden, handleCrear, cambiarEstado,
    ESTADOS_ORDEN, getEstadoId, getKeyEstado,
    creando: crear.isPending,
  }
}
