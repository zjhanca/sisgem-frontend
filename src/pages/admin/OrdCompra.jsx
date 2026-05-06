import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import Tabla from '../../components/Tabla'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { Plus, Eye, Download, Trash2, CheckCircle, Search, Scan } from 'lucide-react'
import { formatPrecio, formatFecha } from '../../utils/validaciones'
import { descargarPDF } from '../../utils/reportes'
 
const formVacio = { proveedor_id: '', productos: [] }
 
export default function OrdCompra() {
  const qc = useQueryClient()
  const [modalNuevo, setModalNuevo]     = useState(false)
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, orden: null })
  const [form, setForm]       = useState(formVacio)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [prodBusqueda, setProdBusqueda] = useState('')
  const [prodsFiltrados, setProdsFiltrados] = useState([])
  const [itemForm, setItemForm] = useState({ producto_id: '', costo_unitario: '', cantidad: 1 })
 
  const { data: ordenes = [] } = useQuery({ queryKey: ['ordenes'], queryFn: () => api.get('/ordenes').then(r => r.data.datos) })
  const { data: proveedores = [] } = useQuery({ queryKey: ['proveedores'], queryFn: () => api.get('/proveedores').then(r => r.data.datos.filter(p => p.estado)) })
  const { data: productos = [] } = useQuery({ queryKey: ['productos'], queryFn: () => api.get('/productos').then(r => r.data.datos.filter(p => p.estado)) })
  const { data: estados = [] } = useQuery({ queryKey: ['estados-compra'], queryFn: () => api.get('/estados?tipo=compra').then(r => r.data.datos) })
 
  const crear = useMutation({
    mutationFn: data => api.post('/ordenes', data),
    onSuccess: () => { qc.invalidateQueries(['ordenes']); setModalNuevo(false); setForm(formVacio); toast.success('orden creada') },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado_id }) => api.patch(`/ordenes/${id}/estado`, { estado_id }),
    onSuccess: () => { qc.invalidateQueries(['ordenes']); qc.invalidateQueries(['productos']); toast.success('estado actualizado — stock actualizado si se aprobo') },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const buscarProducto = texto => {
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
        toast.success(`encontrado: ${data.datos.nombre}`)
      } else toast.error('producto no encontrado')
    } catch { toast.error('producto no encontrado') }
  }
 
  const agregarItem = () => {
    if (!itemForm.producto_id) { toast.error('selecciona un producto'); return }
    if (!itemForm.costo_unitario || +itemForm.costo_unitario <= 0) { toast.error('ingresa el costo'); return }
    const prod = productos.find(p => p.id === +itemForm.producto_id)
    const existe = form.productos.find(p => p.producto_id === +itemForm.producto_id)
    if (existe) { toast.error('producto ya agregado'); return }
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
 
  const getBadge = nombre => {
    if (!nombre) return 'badge-pendiente'
    const n = nombre.toLowerCase()
    if (n.includes('anula') || n.includes('cancel')) return 'badge-anulado'
    if (n.includes('aproba') || n.includes('recibi')) return 'badge-activo'
    if (n.includes('proceso') || n.includes('enviado')) return 'badge-proceso'
    return 'badge-pendiente'
  }
 
  const ordenesFiltradas = ordenes.filter(o => !filtroEstado || o.estado_id === +filtroEstado)
 
  const columnas = [
    { key: 'id',         label: '#' },
    { key: 'proveedor',  label: 'Proveedor' },
    { key: 'total',      label: 'Total', render: r => formatPrecio(r.total) },
    { key: 'estado',     label: 'Estado', render: r => <span className={getBadge(r.estado)}>{r.estado || '-'}</span> },
    { key: 'created_at', label: 'Fecha', render: r => formatFecha(r.created_at) },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">ordenes de compra</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarPDF('/reportes/ordenes', 'reporte-ordenes.pdf')} className="btn-outline">
            <Download size={14} /> reporte</button>
          <button onClick={() => setModalNuevo(true)} className="btn-primary"><Plus size={14} /> nueva orden</button>
        </div>
      </div>
 
      <div className="flex gap-2 mb-4">
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="campo-input w-44 text-xs">
          <option value="">todos los estados</option>
          {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
        {filtroEstado && <button onClick={() => setFiltroEstado('')} className="btn-ghost text-xs text-red-400">limpiar</button>}
      </div>
 
      <Tabla columnas={columnas} datos={ordenesFiltradas} sinBusqueda
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, orden: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => descargarPDF(`/reportes/ordenes/${fila.id}`, `orden-${fila.id}.pdf`)} className="btn-ghost"><Download size={14} /></button>
        </>)}
      />
 
      {/* MODAL NUEVA ORDEN */}
      <Modal abierto={modalNuevo} onCerrar={() => setModalNuevo(false)} titulo="nueva orden de compra" ancho="max-w-2xl">
        <form onSubmit={handleCrear} className="space-y-3">
          <div>
            <label className="campo-label">proveedor *</label>
            <select value={form.proveedor_id} onChange={e => setForm({ ...form, proveedor_id: e.target.value })} className="campo-input">
              <option value="">seleccionar proveedor...</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
 
          <div className="p-3 rounded-xl border border-gray-200 dark:border-dark-border space-y-3">
            <p className="text-xs font-semibold">agregar productos</p>
 
            {/* buscador */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input value={prodBusqueda}
                  onChange={e => { setProdBusqueda(e.target.value); buscarProducto(e.target.value) }}
                  className="campo-input pl-8 text-xs" placeholder="buscar producto por nombre..." />
                {prodsFiltrados.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 bg-light-card dark:bg-dark-card
                    border border-gray-200 dark:border-dark-border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {prodsFiltrados.map(p => (
                      <button key={p.id} type="button"
                        onClick={() => { setItemForm({ ...itemForm, producto_id: p.id, costo_unitario: p.precio }); setProdBusqueda(p.nombre); setProdsFiltrados([]) }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 flex justify-between">
                        <span>{p.nombre}</span>
                        <span className="text-primary">{formatPrecio(p.precio)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <input placeholder="cod. barras" className="campo-input w-28 text-xs pr-7"
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
                <button type="button" onClick={agregarItem} className="btn-primary w-full justify-center text-xs">
                  agregar
                </button>
              </div>
            </div>
 
            {form.productos.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {form.productos.map((p, i) => (
                  <div key={i} className="flex justify-between items-center text-xs p-2 rounded bg-light-bg dark:bg-dark-bg">
                    <span className="flex-1 truncate">{p.nombre}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-gray-400">{p.cantidad}x{formatPrecio(p.costo_unitario)}</span>
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
            <button type="button" onClick={() => setModalNuevo(false)}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">cancelar</button>
            <button type="submit" disabled={crear.isPending} className="btn-primary">
              {crear.isPending ? 'creando...' : 'crear orden'}
            </button>
          </div>
        </form>
      </Modal>
 
      {/* MODAL DETALLE */}
      <Modal abierto={modalDetalle.abierto} onCerrar={() => setModalDetalle({ abierto: false, orden: null })}
        titulo={`orden #${modalDetalle.orden?.id}`} ancho="max-w-lg">
        {modalDetalle.orden && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><p className="campo-label">proveedor</p><p className="font-medium">{modalDetalle.orden.proveedor}</p></div>
              <div><p className="campo-label">estado</p>
                <span className={getBadge(modalDetalle.orden.estado)}>{modalDetalle.orden.estado}</span></div>
              <div><p className="campo-label">total</p>
                <p className="text-primary font-bold text-sm">{formatPrecio(modalDetalle.orden.total)}</p></div>
              <div><p className="campo-label">fecha</p><p>{formatFecha(modalDetalle.orden.created_at)}</p></div>
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
              <p className="campo-label mb-2">cambiar estado</p>
              <div className="flex flex-wrap gap-2">
                {estados.map(e => (
                  <button key={e.id} type="button"
                    onClick={() => cambiarEstado.mutate({ id: modalDetalle.orden.id, estado_id: e.id })}
                    className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                      modalDetalle.orden.estado_id === e.id
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'border-gray-200 dark:border-dark-border text-gray-500 hover:border-primary/40'
                    }`}>
                    {(e.nombre?.toLowerCase().includes('aproba') || e.nombre?.toLowerCase().includes('recibi')) && <CheckCircle size={11} />}
                    {e.nombre}
                  </button>
                ))}
              </div>
              {estados.some(e => e.nombre?.toLowerCase().includes('aproba') || e.nombre?.toLowerCase().includes('recibi')) && (
                <p className="text-xs text-primary mt-2 italic">
                  ⚠ Al aprobar/recibir, el stock de los productos se actualizara automaticamente.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
