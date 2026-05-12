import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/services/api'
import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
import toast from 'react-hot-toast'
import { Plus, Eye, Download, Trash2, Search, Scan, CheckCircle, Clock, XCircle } from 'lucide-react'
import { formatPrecio, formatFecha } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
 
const ESTADOS_ORDEN = [
  { key: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { key: 'recibido',  label: 'Recibido',  color: 'green'  },
  { key: 'anulado',   label: 'Anulado',   color: 'red'    },
]
 
export default function OrdCompra() {
  const qc = useQueryClient()
  const [modalNuevo, setModalNuevo]     = useState(false)
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, orden: null })
  const [filtroEstado, setFiltroEstado] = useState('')
  const [form, setForm]         = useState({ proveedor_id: '', productos: [] })
  const [itemForm, setItemForm] = useState({ producto_id: '', costo_unitario: '', cantidad: 1 })
  const [prodBusqueda, setProdBusqueda]           = useState('')
  const [prodsFiltrados, setProdsFiltrados]       = useState([])
  const [provBusqueda, setProvBusqueda]           = useState('')
  const [provsFiltrados, setProvsFiltrados]       = useState([])
  const [provSeleccionado, setProvSeleccionado]   = useState(null)
 
  const { data: ordenes = [] }    = useQuery({ queryKey: ['ordenes'],    queryFn: () => api.get('/ordenes').then(r => r.data.datos) })
  const { data: proveedores = [] }= useQuery({ queryKey: ['proveedores'],queryFn: () => api.get('/proveedores').then(r => r.data.datos.filter(p => p.estado)) })
  const { data: productos = [] }  = useQuery({ queryKey: ['productos'],  queryFn: () => api.get('/productos').then(r => r.data.datos.filter(p => p.estado)) })
  const { data: estadosBD = [] }  = useQuery({ queryKey: ['estados-compra'], queryFn: () => api.get('/estados?tipo=compra').then(r => r.data.datos) })
 
  // mapear estados de BD a los 3 permitidos
  const getEstadoId = (key) => {
    const mapa = { pendiente: ['pendiente'], recibido: ['recibi', 'aproba', 'completad'], anulado: ['anula', 'cancel'] }
    return estadosBD.find(e => mapa[key]?.some(k => e.nombre?.toLowerCase().includes(k)))?.id
  }
 
  const crear = useMutation({
    mutationFn: data => api.post('/ordenes', data),
    onSuccess: () => {
      qc.invalidateQueries(['ordenes'])
      setModalNuevo(false)
      setForm({ proveedor_id: '', productos: [] })
      setProvBusqueda(''); setProvSeleccionado(null)
      toast.success('orden creada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado_id }) => api.patch(`/ordenes/${id}/estado`, { estado_id }),
    onSuccess: () => {
      qc.invalidateQueries(['ordenes']); qc.invalidateQueries(['productos'])
      toast.success('estado actualizado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  // buscador proveedor
  const buscarProveedor = texto => {
    setProvBusqueda(texto)
    if (!texto) { setProvsFiltrados([]); return }
    setProvsFiltrados(proveedores.filter(p => p.nombre.toLowerCase().includes(texto.toLowerCase())).slice(0, 6))
  }
 
  // buscador producto
  const buscarProducto = texto => {
    setProdBusqueda(texto)
    if (!texto) { setProdsFiltrados([]); return }
    const t = texto.toLowerCase()
    setProdsFiltrados(productos.filter(p =>
      p.nombre.toLowerCase().includes(t) || (p.codigo_barras && p.codigo_barras.includes(t))
    ).slice(0, 8))
  }
 
  const buscarPorCodigo = async codigo => {
    if (!codigo) return
    try {
      const { data } = await api.get(`/productos/barcode/${codigo}`)
      if (data.ok) {
        setItemForm({ producto_id: data.datos.id, costo_unitario: data.datos.precio, cantidad: 1 })
        setProdBusqueda(data.datos.nombre)
        toast.success(`encontrado: ${data.datos.nombre}`)
      } else toast.error('producto no encontrado')
    } catch { toast.error('producto no encontrado') }
  }
 
  const agregarItem = () => {
    if (!itemForm.producto_id) { toast.error('selecciona un producto'); return }
    if (!itemForm.costo_unitario || +itemForm.costo_unitario <= 0) { toast.error('ingresa el costo'); return }
    const prod = productos.find(p => p.id === +itemForm.producto_id)
    if (form.productos.find(p => p.producto_id === +itemForm.producto_id)) { toast.error('producto ya agregado'); return }
    setForm({ ...form, productos: [...form.productos, {
      producto_id: +itemForm.producto_id,
      nombre: prod?.nombre,
      costo_unitario: +itemForm.costo_unitario,
      cantidad: +itemForm.cantidad
    }]})
    setItemForm({ producto_id: '', costo_unitario: '', cantidad: 1 })
    setProdBusqueda(''); setProdsFiltrados([])
  }
 
  const quitarItem = idx => setForm({ ...form, productos: form.productos.filter((_, i) => i !== idx) })
  const totalOrden = form.productos.reduce((s, p) => s + p.costo_unitario * p.cantidad, 0)
 
  const handleCrear = e => {
    e.preventDefault()
    if (!form.proveedor_id) { toast.error('selecciona un proveedor'); return }
    if (!form.productos.length) { toast.error('agrega al menos un producto'); return }
    crear.mutate(form)
  }
 
  const getBadgeEstado = nombre => {
    if (!nombre) return 'badge-pendiente'
    const n = nombre.toLowerCase()
    if (n.includes('anula') || n.includes('cancel')) return 'badge-anulado'
    if (n.includes('recibi') || n.includes('aproba') || n.includes('complet')) return 'badge-activo'
    return 'badge-pendiente'
  }
 
  const getIconEstado = nombre => {
    if (!nombre) return <Clock size={13} className="text-yellow-400" />
    const n = nombre.toLowerCase()
    if (n.includes('recibi') || n.includes('aproba')) return <CheckCircle size={13} className="text-green-400" />
    if (n.includes('anula')) return <XCircle size={13} className="text-red-400" />
    return <Clock size={13} className="text-yellow-400" />
  }
 
  const ordenesFiltradas = ordenes.filter(o => {
    if (!filtroEstado) return true
    const n = o.estado?.toLowerCase() || ''
    if (filtroEstado === 'pendiente') return n.includes('pendiente')
    if (filtroEstado === 'recibido')  return n.includes('recibi') || n.includes('aproba') || n.includes('complet')
    if (filtroEstado === 'anulado')   return n.includes('anula') || n.includes('cancel')
    return true
  })
 
  const columnas = [
    { key: 'id',        label: '#' },
    { key: 'proveedor', label: 'Proveedor' },
    { key: 'total',     label: 'Total', render: r => formatPrecio(r.total) },
    { key: 'estado',    label: 'Estado',
      render: r => (
        <div className="flex items-center gap-1.5">
          {getIconEstado(r.estado)}
          <span className={getBadgeEstado(r.estado)}>{r.estado || '-'}</span>
        </div>
      )
    },
    { key: 'created_at', label: 'Fecha', render: r => formatFecha(r.created_at) },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">órdenes de compra</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarPDF('/reportes/ordenes', 'reporte-ordenes.pdf')} className="btn-outline">
            <Download size={14} /> reporte</button>
          <button onClick={() => setModalNuevo(true)} className="btn-primary"><Plus size={14} /> nueva orden</button>
        </div>
      </div>
 
      {/* filtro estado */}
      <div className="flex gap-2 mb-4">
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="campo-input w-44 text-xs">
          <option value="">todos los estados</option>
          {ESTADOS_ORDEN.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
        </select>
        {filtroEstado && <button onClick={() => setFiltroEstado('')} className="btn-ghost text-xs text-red-400">limpiar</button>}
      </div>
 
      <Tabla columnas={columnas} datos={ordenesFiltradas} sinBusqueda
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, orden: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => descargarPDF(`/reportes/ordenes/${fila.id}`, `orden-${fila.id}.pdf`)} className="btn-ghost"><Download size={14} /></button>
        </>)}
      />
 
      {/* ───── MODAL NUEVA ORDEN ───── */}
      <Modal abierto={modalNuevo}
        onCerrar={() => { setModalNuevo(false); setForm({ proveedor_id: '', productos: [] }); setProvBusqueda(''); setProvSeleccionado(null) }}
        titulo="nueva orden de compra" ancho="max-w-2xl">
        <form onSubmit={handleCrear} className="space-y-3">
 
          {/* buscador proveedor */}
          <div>
            <label className="campo-label">proveedor *</label>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input value={provSeleccionado ? provSeleccionado.nombre : provBusqueda}
                onChange={e => { buscarProveedor(e.target.value); setForm({ ...form, proveedor_id: '' }); setProvSeleccionado(null) }}
                className="campo-input pl-8 text-xs" placeholder="buscar proveedor por nombre..." />
              {provSeleccionado && (
                <button type="button" onClick={() => { setProvSeleccionado(null); setProvBusqueda(''); setForm({ ...form, proveedor_id: '' }) }}
                  className="absolute right-2 top-2 text-gray-400 hover:text-red-400 text-xs">✕</button>
              )}
              {provBusqueda && !provSeleccionado && provsFiltrados.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 bg-light-card dark:bg-dark-card
                  border border-gray-200 dark:border-dark-border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                  {provsFiltrados.map(p => (
                    <button key={p.id} type="button"
                      onClick={() => { setForm({ ...form, proveedor_id: p.id }); setProvSeleccionado(p); setProvBusqueda(''); setProvsFiltrados([]) }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 text-light-text dark:text-dark-text">
                      {p.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {form.proveedor_id && (
              <p className="text-xs text-primary mt-1">✓ proveedor: {provSeleccionado?.nombre}</p>
            )}
          </div>
 
          {/* buscador productos */}
          <div className="p-3 rounded-xl border border-gray-200 dark:border-dark-border space-y-3">
            <p className="text-xs font-semibold">agregar productos</p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input value={prodBusqueda} onChange={e => buscarProducto(e.target.value)}
                  className="campo-input pl-8 text-xs" placeholder="buscar por nombre o código..." />
                {prodsFiltrados.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 bg-light-card dark:bg-dark-card
                    border border-gray-200 dark:border-dark-border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {prodsFiltrados.map(p => (
                      <button key={p.id} type="button"
                        onClick={() => { setItemForm({ ...itemForm, producto_id: p.id, costo_unitario: p.precio }); setProdBusqueda(p.nombre); setProdsFiltrados([]) }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 flex justify-between text-light-text dark:text-dark-text">
                        <div>
                          <span>{p.nombre}</span>
                          {p.codigo_barras && <span className="text-gray-400 font-mono ml-2">{p.codigo_barras}</span>}
                        </div>
                        <span className="text-primary">stock: {p.stock}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <input placeholder="cód. barras" className="campo-input w-28 text-xs pr-7"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); buscarPorCodigo(e.target.value); e.target.value = '' }}} />
                <Scan size={12} className="absolute right-2 top-2.5 text-gray-400" />
              </div>
            </div>
 
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="campo-label">costo unitario</label>
                <input type="number" step="0.01" value={itemForm.costo_unitario}
                  onChange={e => setItemForm({ ...itemForm, costo_unitario: e.target.value })}
                  className="campo-input text-xs" placeholder="0.00" />
              </div>
              <div>
                <label className="campo-label">cantidad</label>
                <input type="number" min="1" value={itemForm.cantidad}
                  onChange={e => setItemForm({ ...itemForm, cantidad: e.target.value })}
                  className="campo-input text-xs" />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={agregarItem} className="btn-primary w-full justify-center text-xs">agregar</button>
              </div>
            </div>
 
            {form.productos.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {form.productos.map((p, i) => (
                  <div key={i} className="flex justify-between items-center text-xs p-2 rounded bg-light-bg dark:bg-dark-bg">
                    <span className="flex-1 truncate">{p.nombre}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-gray-400">{p.cantidad}×{formatPrecio(p.costo_unitario)}</span>
                      <span className="text-primary font-medium">{formatPrecio(p.costo_unitario * p.cantidad)}</span>
                      <button type="button" onClick={() => quitarItem(i)} className="text-red-400"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-bold pt-1 border-t border-gray-200 dark:border-dark-border">
                  <span>total</span><span className="text-primary">{formatPrecio(totalOrden)}</span>
                </div>
              </div>
            )}
          </div>
 
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button type="button"
              onClick={() => { setModalNuevo(false); setForm({ proveedor_id: '', productos: [] }); setProvBusqueda(''); setProvSeleccionado(null) }}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">cancelar</button>
            <button type="submit" disabled={crear.isPending} className="btn-primary">
              {crear.isPending ? 'creando...' : 'crear orden'}
            </button>
          </div>
        </form>
      </Modal>
 
      {/* ───── MODAL DETALLE ───── */}
      <Modal abierto={modalDetalle.abierto} onCerrar={() => setModalDetalle({ abierto: false, orden: null })}
        titulo={`orden #${modalDetalle.orden?.id}`} ancho="max-w-lg">
        {modalDetalle.orden && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><p className="campo-label">proveedor</p><p className="font-medium">{modalDetalle.orden.proveedor}</p></div>
              <div><p className="campo-label">estado</p>
                <div className="flex items-center gap-1">{getIconEstado(modalDetalle.orden.estado)}
                  <span className={getBadgeEstado(modalDetalle.orden.estado)}>{modalDetalle.orden.estado}</span></div></div>
              <div><p className="campo-label">total</p>
                <p className="text-primary font-bold text-sm">{formatPrecio(modalDetalle.orden.total)}</p></div>
              <div><p className="campo-label">fecha</p><p>{formatFecha(modalDetalle.orden.created_at)}</p></div>
            </div>
 
            {/* botones cambiar estado — solo los 3 permitidos */}
            <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
              <p className="campo-label mb-2">cambiar estado</p>
              <div className="flex gap-2 flex-wrap">
                {ESTADOS_ORDEN.map(({ key, label, color }) => {
                  const estado_id = getEstadoId(key)
                  if (!estado_id) return null
                  const esActual = (() => {
                    const n = modalDetalle.orden.estado?.toLowerCase() || ''
                    if (key === 'pendiente') return n.includes('pendiente')
                    if (key === 'recibido')  return n.includes('recibi') || n.includes('aproba')
                    if (key === 'anulado')   return n.includes('anula')
                    return false
                  })()
                  return (
                    <button key={key} type="button"
                      onClick={() => cambiarEstado.mutate({ id: modalDetalle.orden.id, estado_id })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                        esActual
                          ? color === 'green' ? 'bg-green-500/20 border-green-500 text-green-500'
                            : color === 'red' ? 'bg-red-500/20 border-red-400 text-red-400'
                            : 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                          : 'border-gray-200 dark:border-dark-border text-gray-500 hover:border-primary/40'
                      }`}>
                      {key === 'recibido' && <CheckCircle size={11} />}
                      {key === 'anulado'  && <XCircle size={11} />}
                      {key === 'pendiente'&& <Clock size={11} />}
                      {label}
                    </button>
                  )
                })}
              </div>
              {ESTADOS_ORDEN.some(e => e.key === 'recibido' && getEstadoId('recibido')) && (
                <p className="text-xs text-primary mt-2 italic">
                  ⚠ al marcar como recibido, el stock se actualizará automáticamente.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
