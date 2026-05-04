import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import Tabla from '../../components/Tabla'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { Plus, Eye, Download, Trash2, Ban } from 'lucide-react'
import { descargarPDF } from '../../utils/reportes'
import { formatPrecio, formatFecha } from '../../utils/validaciones'
 
export default function OrdCompra() {
  const qc = useQueryClient()
  const [modal, setModal]           = useState(false)
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, orden: null })
  const [modalEditar, setModalEditar]   = useState({ abierto: false, orden: null })
  const [modalAnular, setModalAnular]   = useState({ abierto: false, orden: null })
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado]     = useState('')
  const [form, setForm]     = useState({ proveedor_id: '', productos: [] })
  const [formEdit, setFormEdit] = useState({ estado_id: '' })
  const [prodSel, setProdSel] = useState({ producto_id: '', cantidad: 1, costo_unitario: '' })
 
  const { data: ordenes = [] } = useQuery({
    queryKey: ['ordenes'],
    queryFn: () => api.get('/ordenes').then(r => r.data.datos)
  })
  const { data: proveedores = [] } = useQuery({
    queryKey: ['proveedores'],
    queryFn: () => api.get('/proveedores').then(r => r.data.datos.filter(p => p.estado))
  })
  const { data: productos = [] } = useQuery({
    queryKey: ['productos'],
    queryFn: () => api.get('/productos').then(r => r.data.datos.filter(p => p.estado))
  })
  const { data: estados = [] } = useQuery({
    queryKey: ['estados-compra'],
    queryFn: () => api.get('/estados?tipo=compra').then(r => r.data.datos)
  })
 
  const crear = useMutation({
    mutationFn: data => api.post('/ordenes', data),
    onSuccess: () => {
      qc.invalidateQueries(['ordenes'])
      setModal(false)
      setForm({ proveedor_id: '', productos: [] })
      toast.success('orden de compra creada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado_id }) => api.patch(`/ordenes/${id}/estado`, { estado_id }),
    onSuccess: () => {
      qc.invalidateQueries(['ordenes'])
      setModalEditar({ abierto: false, orden: null })
      toast.success('estado actualizado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const anular = useMutation({
    mutationFn: id => api.patch(`/ordenes/${id}/estado`, { estado_id: 12 }),
    onSuccess: () => {
      qc.invalidateQueries(['ordenes'])
      setModalAnular({ abierto: false, orden: null })
      toast.success('orden anulada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error al anular')
  })
 
  const agregarProducto = () => {
    if (!prodSel.producto_id || !prodSel.costo_unitario) {
      toast.error('completa producto y costo'); return
    }
    const prod = productos.find(p => p.id === +prodSel.producto_id)
    const existe = form.productos.find(p => p.producto_id === +prodSel.producto_id)
    if (existe) {
      setForm({ ...form, productos: form.productos.map(p =>
        p.producto_id === +prodSel.producto_id
          ? { ...p, cantidad: p.cantidad + +prodSel.cantidad } : p
      )})
    } else {
      setForm({ ...form, productos: [...form.productos, {
        producto_id: +prodSel.producto_id,
        cantidad: +prodSel.cantidad,
        costo_unitario: +prodSel.costo_unitario,
        nombre: prod?.nombre
      }]})
    }
    setProdSel({ producto_id: '', cantidad: 1, costo_unitario: '' })
  }
 
  const quitarProducto = idx =>
    setForm({ ...form, productos: form.productos.filter((_, i) => i !== idx) })
 
  const totalOrden = form.productos.reduce(
    (s, p) => s + p.costo_unitario * p.cantidad, 0
  )
 
  const handleCrear = e => {
    e.preventDefault()
    if (!form.proveedor_id)     { toast.error('selecciona un proveedor'); return }
    if (!form.productos.length) { toast.error('agrega al menos un producto'); return }
    crear.mutate(form)
  }
 
  const descargarReporte = () => descargarPDF('/reportes/ordenes', 'reporte-ordenes.pdf')
 
  const ordenesFiltradas = ordenes.filter(o => {
    if (filtroEstado && o.estado_id !== +filtroEstado) return false
    if (filtroBusqueda && !`${o.id} ${o.proveedor}`
      .toLowerCase().includes(filtroBusqueda.toLowerCase())) return false
    return true
  })
 
  const columnas = [
    { key: 'id',        label: '#' },
    { key: 'proveedor', label: 'Proveedor' },
    { key: 'total',     label: 'Total', render: r => formatPrecio(r.total) },
    { key: 'estado',    label: 'Estado',
      render: r => (
        <span className={r.estado_id === 12 ? 'badge-anulado' :
          r.estado_id === 11 ? 'badge-proceso' : 'badge-pendiente'}>
          {r.estado || 'pendiente'}
        </span>
      )
    },
    { key: 'fecha', label: 'Fecha', render: r => formatFecha(r.fecha) },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">ordenes de compra</h1>
        <div className="flex gap-2">
          <button onClick={descargarReporte} className="btn-outline">
            <Download size={14} /> reporte
          </button>
          <button onClick={() => setModal(true)} className="btn-primary">
            <Plus size={14} /> nueva orden
          </button>
        </div>
      </div>
 
      {/* filtros */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input value={filtroBusqueda}
          onChange={e => setFiltroBusqueda(e.target.value)}
          placeholder="buscar por proveedor o #..."
          className="campo-input w-48 text-xs" />
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          className="campo-input w-36 text-xs">
          <option value="">todos los estados</option>
          {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
        {(filtroEstado || filtroBusqueda) && (
          <button onClick={() => { setFiltroEstado(''); setFiltroBusqueda('') }}
            className="btn-ghost text-xs text-red-400">
            limpiar
          </button>
        )}
      </div>
 
      <Tabla columnas={columnas} datos={ordenesFiltradas} sinBusqueda
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, orden: fila })}
            className="btn-ghost" title="ver detalles">
            <Eye size={14} />
          </button>
          <button onClick={() => {
            setFormEdit({ estado_id: fila.estado_id })
            setModalEditar({ abierto: true, orden: fila })
          }} className="btn-ghost" title="cambiar estado">
            <Download size={14} />
          </button>
          {fila.estado_id !== 12 && (
            <button onClick={() => setModalAnular({ abierto: true, orden: fila })}
              className="btn-ghost hover:text-red-400" title="anular orden">
              <Ban size={14} />
            </button>
          )}
        </>)}
      />
 
      {/* modal nueva orden */}
      <Modal abierto={modal} onCerrar={() => setModal(false)}
        titulo="nueva orden de compra" ancho="max-w-xl">
        <form onSubmit={handleCrear} className="space-y-3">
          <div>
            <label className="campo-label">proveedor *</label>
            <select value={form.proveedor_id}
              onChange={e => setForm({ ...form, proveedor_id: e.target.value })}
              className="campo-input">
              <option value="">seleccionar...</option>
              {proveedores.map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </div>
 
          <div className="p-3 rounded-lg border border-gray-200 dark:border-dark-border space-y-2">
            <p className="text-xs font-medium text-light-text dark:text-dark-text">productos</p>
            <div className="grid grid-cols-3 gap-2">
              <select value={prodSel.producto_id}
                onChange={e => setProdSel({ ...prodSel, producto_id: e.target.value })}
                className="campo-input text-xs">
                <option value="">producto...</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
              <input type="number" min="1" value={prodSel.cantidad}
                onChange={e => setProdSel({ ...prodSel, cantidad: e.target.value })}
                className="campo-input text-xs" placeholder="cantidad" />
              <input type="number" step="0.01" value={prodSel.costo_unitario}
                onChange={e => setProdSel({ ...prodSel, costo_unitario: e.target.value })}
                className="campo-input text-xs" placeholder="costo unit" />
            </div>
            <button type="button" onClick={agregarProducto}
              className="btn-outline text-xs w-full justify-center">
              + agregar producto
            </button>
 
            {form.productos.length > 0 && (
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {form.productos.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs
                    p-2 rounded bg-light-bg dark:bg-dark-bg">
                    <span className="text-light-text dark:text-dark-text">{p.nombre}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">
                        {p.cantidad} x {formatPrecio(p.costo_unitario)}
                      </span>
                      <span className="text-primary font-medium">
                        {formatPrecio(p.costo_unitario * p.cantidad)}
                      </span>
                      <button type="button" onClick={() => quitarProducto(i)}
                        className="text-red-400 hover:text-red-300">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-medium pt-1
                  border-t border-gray-200 dark:border-dark-border">
                  <span className="text-light-text dark:text-dark-text">total</span>
                  <span className="text-primary">{formatPrecio(totalOrden)}</span>
                </div>
              </div>
            )}
          </div>
 
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button type="button" onClick={() => setModal(false)}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border
                text-gray-500 dark:text-dark-text/60 rounded-lg hover:border-primary/40">
              cancelar
            </button>
            <button type="submit" disabled={crear.isPending} className="btn-primary">
              {crear.isPending ? 'creando...' : 'crear orden'}
            </button>
          </div>
        </form>
      </Modal>
 
      {/* modal detalles */}
      <Modal abierto={modalDetalle.abierto}
        onCerrar={() => setModalDetalle({ abierto: false, orden: null })}
        titulo={`orden #${modalDetalle.orden?.id}`}>
        {modalDetalle.orden && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="campo-label">proveedor</p>
                <p className="text-light-text dark:text-dark-text font-medium">
                  {modalDetalle.orden.proveedor}
                </p>
              </div>
              <div>
                <p className="campo-label">estado</p>
                <span className={modalDetalle.orden.estado_id === 12 ? 'badge-anulado' :
                  modalDetalle.orden.estado_id === 11 ? 'badge-proceso' : 'badge-pendiente'}>
                  {modalDetalle.orden.estado || 'pendiente'}
                </span>
              </div>
              <div>
                <p className="campo-label">total</p>
                <p className="text-primary font-semibold text-sm">
                  {formatPrecio(modalDetalle.orden.total)}
                </p>
              </div>
              <div>
                <p className="campo-label">fecha</p>
                <p className="text-light-text dark:text-dark-text">
                  {formatFecha(modalDetalle.orden.fecha)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
              <button onClick={descargarReporte} className="btn-outline text-xs">
                <Download size={12} /> reporte
              </button>
              {modalDetalle.orden.estado_id !== 12 && (
                <button onClick={() => {
                  setModalDetalle({ abierto: false, orden: null })
                  setFormEdit({ estado_id: modalDetalle.orden.estado_id })
                  setModalEditar({ abierto: true, orden: modalDetalle.orden })
                }} className="btn-outline text-xs">
                  cambiar estado
                </button>
              )}
              {modalDetalle.orden.estado_id !== 12 && (
                <button onClick={() => {
                  setModalDetalle({ abierto: false, orden: null })
                  setModalAnular({ abierto: true, orden: modalDetalle.orden })
                }} className="px-3 py-1.5 text-xs border border-red-400/40 text-red-400
                  rounded-lg hover:bg-red-400/10 transition-colors">
                  anular orden
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
 
      {/* modal cambiar estado */}
      <Modal abierto={modalEditar.abierto}
        onCerrar={() => setModalEditar({ abierto: false, orden: null })}
        titulo={`cambiar estado - orden #${modalEditar.orden?.id}`}
        ancho="max-w-sm">
        <div className="space-y-4">
          <div>
            <label className="campo-label">nuevo estado</label>
            <select value={formEdit.estado_id}
              onChange={e => setFormEdit({ estado_id: e.target.value })}
              className="campo-input">
              <option value="">seleccionar...</option>
              {estados.map(e => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => setModalEditar({ abierto: false, orden: null })}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border
                text-gray-500 dark:text-dark-text/60 rounded-lg hover:border-primary/40">
              cancelar
            </button>
            <button
              onClick={() => cambiarEstado.mutate({ id: modalEditar.orden.id, estado_id: +formEdit.estado_id })}
              disabled={cambiarEstado.isPending || !formEdit.estado_id}
              className="btn-primary">
              {cambiarEstado.isPending ? 'guardando...' : 'guardar'}
            </button>
          </div>
        </div>
      </Modal>
 
      {/* modal confirmar anular */}
      <Modal abierto={modalAnular.abierto}
        onCerrar={() => setModalAnular({ abierto: false, orden: null })}
        titulo="confirmar anulacion" ancho="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-light-text dark:text-dark-text">
            estas seguro que deseas anular la orden
            <span className="font-medium text-primary"> #{modalAnular.orden?.id}</span> de
            <span className="font-medium"> {modalAnular.orden?.proveedor}</span>?
            esta accion no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => setModalAnular({ abierto: false, orden: null })}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border
                text-gray-500 dark:text-dark-text/60 rounded-lg hover:border-primary/40">
              cancelar
            </button>
            <button onClick={() => anular.mutate(modalAnular.orden.id)}
              disabled={anular.isPending}
              className="px-4 py-1.5 text-sm bg-red-500 hover:bg-red-600
                text-white rounded-lg transition-colors disabled:opacity-50">
              {anular.isPending ? 'anulando...' : 'anular orden'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
