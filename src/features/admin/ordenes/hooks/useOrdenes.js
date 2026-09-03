import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordenesService } from '../services/ordenesService'
import { useAuth } from '@shared/contexts/AuthContext'
import { descargarPDF, descargarExcel } from '@shared/utils/reportes'
import toast from 'react-hot-toast'

// Sin estado pendiente — las órdenes siempre se crean como completadas
const ESTADOS_ORDEN = [
  { key: 'activo',  label: 'Completado', color: 'blue' },
  { key: 'anulado', label: 'Anulado',    color: 'gray' },
]

const formVacio = {
  proveedor_id: '', productos: [],
  fecha_compra: new Date().toISOString().split('T')[0],
  metodo_pago: 'Efectivo',
  estado: 'activo', // siempre completado al crear
  fecha_limite_pago: '',
  notas: '',
}

const itemVacio = { producto_id: '', costo_unitario: '', precio_venta: '', cantidad: 1 }

export function useOrdenes() {
  const qc = useQueryClient()
  const { usuario } = useAuth()

  const [modalNuevo, setModalNuevo]           = useState(false)
  const [modalEditar, setModalEditar]         = useState({ abierto: false, orden: null })
  const [modalDetalle, setModalDetalle]       = useState({ abierto: false, orden: null })
  const [modalAnular, setModalAnular]         = useState({ abierto: false, orden: null })
  const [filtroEstado, setFiltroEstado]       = useState('')
  const [filtroProveedor, setFiltroProveedor] = useState('')
  const [form, setForm]             = useState(formVacio)
  const [formEditar, setFormEditar] = useState({})
  const [itemForm, setItemForm]     = useState(itemVacio)
  const [itemEditando, setItemEditando]       = useState(null)
  const [facturaFile, setFacturaFile]         = useState(null)
  const [facturaPreview, setFacturaPreview]   = useState('')
  const [prodBusqueda, setProdBusqueda]       = useState('')
  const [prodsFiltrados, setProdsFiltrados]   = useState([])
  const [provBusqueda, setProvBusqueda]       = useState('')
  const [provsFiltrados, setProvsFiltrados]   = useState([])
  const [provSeleccionado, setProvSeleccionado] = useState(null)

  const { data: ordenes = [] }     = useQuery({ queryKey: ['ordenes'],        queryFn: ordenesService.getAll })
  const { data: proveedores = [] } = useQuery({ queryKey: ['proveedores'],    queryFn: ordenesService.getProveedores })
  const { data: productos = [] }   = useQuery({ queryKey: ['productos'],      queryFn: ordenesService.getProductos })
  const { data: estadosBD = [] }   = useQuery({ queryKey: ['estados-compra'], queryFn: ordenesService.getEstados })

  const getKeyEstado = nombre => {
    if (!nombre) return 'activo'
    const n = nombre.toLowerCase()
    if (n.includes('anula') || n.includes('cancel')) return 'anulado'
    // pendiente ahora también se muestra como activo/completado
    return 'activo'
  }

  const ordenesConEstado = ordenes.map(o => ({ ...o }))

  const getEstadoId = key => {
    const mapa = {
      activo:  ['activo', 'complet', 'transito', 'recibi', 'pendiente'],
      anulado: ['anulado', 'anula', 'cancel'],
    }
    return estadosBD.find(e => mapa[key]?.some(k => e.nombre?.toLowerCase().includes(k)))?.id
  }

  const abrirEditar = orden => {
    setFormEditar({
      fecha_compra:      orden.fecha_compra?.split('T')[0] || '',
      metodo_pago:       orden.metodo_pago || 'Efectivo',
      fecha_limite_pago: orden.fecha_limite_pago?.split('T')[0] || '',
      notas:             orden.notas || '',
    })
    setModalEditar({ abierto: true, orden })
  }

  const crear = useMutation({
    mutationFn: async data => {
      const formData = new FormData()
      formData.append('proveedor_id',      data.proveedor_id)
      formData.append('fecha_compra',      data.fecha_compra)
      formData.append('metodo_pago',       data.metodo_pago)
      formData.append('estado',            'activo') // siempre completado
      formData.append('fecha_limite_pago', data.fecha_limite_pago || '')
      formData.append('notas',             data.notas || '')
      formData.append('registrado_por',    usuario?.id || '')
      formData.append('productos',         JSON.stringify(data.productos))
      if (facturaFile) formData.append('factura', facturaFile)
      return ordenesService.create(formData)
    },
    onSuccess: () => {
      qc.invalidateQueries(['ordenes'])
      setModalNuevo(false)
      setForm(formVacio)
      setProvBusqueda(''); setProvSeleccionado(null)
      setFacturaFile(null); setFacturaPreview('')
      setItemForm(itemVacio); setItemEditando(null)
      toast.success('Compra registrada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })

  const editar = useMutation({
    mutationFn: ({ id, data }) => ordenesService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries(['ordenes'])
      setModalEditar({ abierto: false, orden: null })
      toast.success('Compra actualizada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error al actualizar'),
  })

  const anular = useMutation({
    mutationFn: id => ordenesService.anular(id),
    onSuccess: () => {
      qc.invalidateQueries(['ordenes'])
      setModalAnular({ abierto: false, orden: null })
      setModalDetalle({ abierto: false, orden: null })
      toast.success('Compra anulada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'No se puede anular'),
  })

  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado_id }) => ordenesService.cambiarEstado(id, { estado_id }),
    onSuccess: () => {
      qc.invalidateQueries(['ordenes'])
      qc.invalidateQueries(['productos'])
      toast.success('Estado actualizado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })

  const handleFacturaChange = e => {
    const file = e.target.files[0]
    if (!file) return
    setFacturaFile(file)
    setFacturaPreview(file.name)
  }

  const buscarProveedor = texto => {
    setProvBusqueda(texto)
    setForm(p => ({ ...p, proveedor_id: '' }))
    setProvSeleccionado(null)
    const t = texto.toLowerCase()
    setProvsFiltrados(proveedores.filter(p => !t || p.nombre.toLowerCase().includes(t)))
  }

  const buscarProducto = texto => {
    setProdBusqueda(texto)
    if (!texto) { setProdsFiltrados([]); return }
    const t = texto.toLowerCase()
    setProdsFiltrados(productos.filter(p =>
      p.nombre.toLowerCase().includes(t) ||
      (p.codigo_barras && p.codigo_barras.includes(t))
    ).slice(0, 8))
  }

  const buscarPorCodigo = async cod => {
    try {
      const { data } = await ordenesService.getBarcode(cod)
      if (data.ok) {
        setItemForm(p => ({
          ...p,
          producto_id:    data.datos.id,
          costo_unitario: '',
          precio_venta:   data.datos.precio || '',
        }))
        setProdBusqueda(data.datos.nombre)
      } else toast.error('Producto no encontrado')
    } catch { toast.error('Producto no encontrado') }
  }

  const validarItem = (item, ignorarIdx = null) => {
    if (!item.producto_id)
      { toast.error('Selecciona un producto'); return false }
    if (!item.costo_unitario || +item.costo_unitario <= 0)
      { toast.error('Ingresa el costo unitario'); return false }
    if (!item.precio_venta || +item.precio_venta <= 0)
      { toast.error('Ingresa el precio de venta'); return false }
    if (+item.precio_venta < +item.costo_unitario)
      { toast.error('El precio de venta no puede ser menor al costo'); return false }
    const prod = productos.find(p => p.id === +item.producto_id)
    const precioActual = prod?.precio ? +prod.precio : 0
    if (precioActual > 0 && +item.precio_venta < precioActual) {
      toast.error(`El precio de venta no puede bajar del actual ($${precioActual.toLocaleString('es-CO')})`)
      return false
    }
    const duplicado = form.productos.find((p, i) => p.producto_id === +item.producto_id && i !== ignorarIdx)
    if (duplicado) { toast.error('Producto ya agregado'); return false }
    return true
  }

  const agregarItem = () => {
    if (!validarItem(itemForm)) return
    const prod = productos.find(p => p.id === +itemForm.producto_id)
    setForm(p => ({ ...p, productos: [...p.productos, {
      producto_id:    +itemForm.producto_id,
      nombre:         prod?.nombre,
      costo_unitario: +itemForm.costo_unitario,
      precio_venta:   +itemForm.precio_venta,
      cantidad:       +itemForm.cantidad,
    }]}))
    setItemForm(itemVacio)
    setProdBusqueda('')
    setProdsFiltrados([])
  }

  const iniciarEdicionItem = idx => {
    const item = form.productos[idx]
    if (!item) return
    setItemEditando(idx)
    setItemForm({
      producto_id:    item.producto_id,
      costo_unitario: item.costo_unitario,
      precio_venta:   item.precio_venta,
      cantidad:       item.cantidad,
    })
    const prod = productos.find(p => p.id === item.producto_id)
    setProdBusqueda(prod?.nombre || '')
  }

  const guardarEdicionItem = () => {
    if (!validarItem(itemForm, itemEditando)) return
    setForm(p => ({
      ...p,
      productos: p.productos.map((item, i) =>
        i === itemEditando
          ? {
              ...item,
              costo_unitario: +itemForm.costo_unitario,
              precio_venta:   +itemForm.precio_venta,
              cantidad:       +itemForm.cantidad,
            }
          : item
      )
    }))
    setItemForm(itemVacio)
    setItemEditando(null)
    setProdBusqueda('')
    setProdsFiltrados([])
  }

  const cancelarEdicionItem = () => {
    setItemEditando(null)
    setItemForm(itemVacio)
    setProdBusqueda('')
    setProdsFiltrados([])
  }

  const quitarItem = idx => {
    if (itemEditando === idx) cancelarEdicionItem()
    setForm(p => ({ ...p, productos: p.productos.filter((_, i) => i !== idx) }))
  }

  const totalOrden = form.productos.reduce((s, p) => s + p.costo_unitario * p.cantidad, 0)

  const handleCrear = e => {
    e.preventDefault()
    if (!form.proveedor_id)     { toast.error('Selecciona un proveedor'); return }
    if (!form.fecha_compra)     { toast.error('Ingresa la fecha de compra'); return }
    if (form.fecha_compra > new Date().toISOString().split('T')[0])
      { toast.error('La fecha de compra no puede ser futura'); return }
    if (!form.productos.length) { toast.error('Agrega al menos un producto'); return }
    crear.mutate(form)
  }

  const handleEditar = e => {
    e.preventDefault()
    if (!formEditar.fecha_compra) { toast.error('Ingresa la fecha de compra'); return }
    if (formEditar.fecha_compra > new Date().toISOString().split('T')[0])
      { toast.error('La fecha de compra no puede ser futura'); return }
    editar.mutate({ id: modalEditar.orden.id, data: formEditar })
  }

  const ordenesFiltradas = ordenesConEstado.filter(o => {
    // filtroEstado solo puede ser 'activo' o 'anulado' ahora
    if (filtroEstado && getKeyEstado(o.estado) !== filtroEstado) return false
    if (filtroProveedor && o.proveedor_id !== +filtroProveedor) return false
    return true
  })

  const ordenesVencidas = 0 // ya no hay vencidas sin estado pendiente

  const descargarReporte = async ({ tipo, formato = 'pdf', desde, hasta } = {}) => {
    const nombres = { normal: 'general', rango: 'personalizado' }
    const ext = formato === 'excel' ? 'xlsx' : 'pdf'
    const params = new URLSearchParams({ formato })
    if (tipo === 'rango') {
      if (desde) params.set('desde', desde)
      if (hasta) params.set('hasta', hasta)
    }
    const url = `/reportes/ordenes?${params.toString()}`
    const nombreArchivo = `reporte-ordenes-${nombres[tipo] || tipo}.${ext}`
    if (formato === 'excel') await descargarExcel(url, nombreArchivo)
    else await descargarPDF(url, nombreArchivo)
  }

  return {
    ordenesFiltradas, proveedores, productos, estadosBD, ordenesVencidas,
    modalNuevo, modalDetalle, modalEditar, modalAnular,
    filtroEstado, filtroProveedor,
    setModalNuevo, setModalDetalle, setModalEditar, setModalAnular,
    setFiltroEstado, setFiltroProveedor,
    form, setForm, formEditar, setFormEditar, itemForm, setItemForm,
    facturaPreview, handleFacturaChange,
    prodBusqueda, prodsFiltrados, provBusqueda, provsFiltrados, provSeleccionado,
    buscarProveedor, buscarProducto, buscarPorCodigo,
    agregarItem, quitarItem,
    itemEditando, iniciarEdicionItem, guardarEdicionItem, cancelarEdicionItem,
    setProvSeleccionado, setProvBusqueda, setProdBusqueda, setProdsFiltrados,
    totalOrden, handleCrear, handleEditar, abrirEditar,
    cambiarEstado, anular, descargarReporte,
    ESTADOS_ORDEN, getEstadoId, getKeyEstado,
    creando: crear.isPending, editando: editar.isPending, anulando: anular.isPending,
  }
}