import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import Tabla from '../../components/Tabla'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { Plus, Eye, Download, Ban, Edit2 } from 'lucide-react'
import { descargarPDF } from '../../utils/reportes'
import { formatPrecio, formatFechaHora } from '../../utils/validaciones'
 
const formVacio = { pedido_id: '', monto: '', metodo: 'efectivo', tipo: 'pago' }
 
export default function Pagos() {
  const qc = useQueryClient()
  const [modal, setModal]               = useState(false)
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, item: null })
  const [modalEditar, setModalEditar]   = useState({ abierto: false, item: null })
  const [modalAnular, setModalAnular]   = useState({ abierto: false, item: null })
  const [form, setForm]                 = useState(formVacio)
  const [formEdit, setFormEdit]         = useState({ monto: '', metodo: '', estado_id: '' })
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado]     = useState('')
  const [filtroTipo, setFiltroTipo]         = useState('todos')
 
  const { data: pagos = [] } = useQuery({
    queryKey: ['pagos'],
    queryFn: () => api.get('/pagos').then(r => r.data.datos)
  })
  const { data: abonos = [] } = useQuery({
    queryKey: ['abonos'],
    queryFn: () => api.get('/abonos').then(r => r.data.datos)
  })
  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-select'],
    queryFn: () => api.get('/pedidos').then(r => r.data.datos.filter(p => p.estado_id !== 3))
  })
  const { data: estados = [] } = useQuery({
    queryKey: ['estados-pago'],
    queryFn: () => api.get('/estados?tipo=pago').then(r => r.data.datos)
  })
 
  const guardar = useMutation({
    mutationFn: data => data.tipo === 'abono'
      ? api.post('/abonos', data)
      : api.post('/pagos', data),
    onSuccess: () => {
      qc.invalidateQueries(['pagos'])
      qc.invalidateQueries(['abonos'])
      setModal(false)
      setForm(formVacio)
      toast.success('registro guardado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const actualizar = useMutation({
    mutationFn: ({ id, tipo, data }) => tipo === 'abono'
      ? api.put(`/abonos/${id}`, data)
      : api.put(`/pagos/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries(['pagos'])
      qc.invalidateQueries(['abonos'])
      setModalEditar({ abierto: false, item: null })
      toast.success('actualizado correctamente')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const cambiarEstado = useMutation({
    mutationFn: ({ id, tipo, estado_id }) => tipo === 'abono'
      ? api.patch(`/abonos/${id}/estado`, { estado_id })
      : api.patch(`/pagos/${id}/estado`, { estado_id }),
    onSuccess: () => {
      qc.invalidateQueries(['pagos'])
      qc.invalidateQueries(['abonos'])
      toast.success('estado actualizado')
    }
  })
 
  const anular = useMutation({
    mutationFn: ({ id, tipo }) => tipo === 'abono'
      ? api.patch(`/abonos/${id}/estado`, { estado_id: 8 })
      : api.patch(`/pagos/${id}/estado`, { estado_id: 8 }),
    onSuccess: () => {
      qc.invalidateQueries(['pagos'])
      qc.invalidateQueries(['abonos'])
      setModalAnular({ abierto: false, item: null })
      toast.success('anulado correctamente')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error al anular')
  })
 
  const handleSubmit = e => {
    e.preventDefault()
    if (!form.pedido_id)              { toast.error('selecciona un pedido'); return }
    if (!form.monto || +form.monto <= 0) { toast.error('monto invalido'); return }
    guardar.mutate(form)
  }
 
  const handleActualizar = e => {
    e.preventDefault()
    if (!formEdit.monto || +formEdit.monto <= 0) { toast.error('monto invalido'); return }
    actualizar.mutate({
      id: modalEditar.item.id,
      tipo: modalEditar.item.tipo,
      data: formEdit
    })
  }
 
  // combinar pagos y abonos
  const todos = [
    ...pagos.map(p => ({ ...p, tipo: 'pago' })),
    ...abonos.map(a => ({ ...a, tipo: 'abono' }))
  ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
 
  const filtrados = todos.filter(item => {
    if (filtroTipo !== 'todos' && item.tipo !== filtroTipo) return false
    if (filtroEstado && item.estado_id !== +filtroEstado) return false
    if (filtroBusqueda && !`${item.id} ${item.pedido_id} ${item.metodo}`
      .toLowerCase().includes(filtroBusqueda.toLowerCase())) return false
    return true
  })
 
  const columnas = [
    { key: 'id',        label: '#' },
    { key: 'tipo',      label: 'Tipo',
      render: r => (
        <span className={`badge ${r.tipo === 'abono'
          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
          : 'bg-primary/20 text-green-700 dark:text-primary'}`}>
          {r.tipo}
        </span>
      )
    },
    { key: 'pedido_id', label: 'Pedido #' },
    { key: 'monto',     label: 'Monto', render: r => formatPrecio(r.monto) },
    { key: 'metodo',    label: 'Metodo' },
    { key: 'estado',    label: 'Estado',
      render: r => (
        <span className={r.estado_id === 8 ? 'badge-anulado' :
          r.estado_id === 5 || r.estado_id === 6 ? 'badge-activo' : 'badge-pendiente'}>
          {r.estado || 'pendiente'}
        </span>
      )
    },
    { key: 'fecha', label: 'Fecha', render: r => formatFechaHora(r.fecha) },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">pagos y abonos</h1>
        <div className="flex gap-2">
          <button
            onClick={() => descargarPDF('/reportes/pagos', 'reporte-pagos.pdf')}
            className="btn-outline">
            <Download size={14} /> reporte
          </button>
          <button onClick={() => setModal(true)} className="btn-primary">
            <Plus size={14} /> registrar
          </button>
        </div>
      </div>
 
      {/* filtros */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input value={filtroBusqueda}
          onChange={e => setFiltroBusqueda(e.target.value)}
          placeholder="buscar por pedido o metodo..."
          className="campo-input w-48 text-xs" />
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
          className="campo-input w-32 text-xs">
          <option value="todos">todos</option>
          <option value="pago">pagos</option>
          <option value="abono">abonos</option>
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          className="campo-input w-36 text-xs">
          <option value="">todos los estados</option>
          {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
        {(filtroEstado || filtroBusqueda || filtroTipo !== 'todos') && (
          <button onClick={() => { setFiltroEstado(''); setFiltroBusqueda(''); setFiltroTipo('todos') }}
            className="btn-ghost text-xs text-red-400">
            limpiar
          </button>
        )}
      </div>
 
      <Tabla columnas={columnas} datos={filtrados} sinBusqueda
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })}
            className="btn-ghost" title="ver detalles">
            <Eye size={14} />
          </button>
          {fila.estado_id !== 8 && (<>
            <button onClick={() => {
              setFormEdit({ monto: fila.monto, metodo: fila.metodo, estado_id: fila.estado_id })
              setModalEditar({ abierto: true, item: fila })
            }} className="btn-ghost" title="editar">
              <Edit2 size={14} />
            </button>
            <button onClick={() => setModalAnular({ abierto: true, item: fila })}
              className="btn-ghost hover:text-red-400" title="anular">
              <Ban size={14} />
            </button>
          </>)}
        </>)}
      />
 
      {/* modal registrar */}
      <Modal abierto={modal} onCerrar={() => setModal(false)}
        titulo="registrar pago / abono">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="campo-label">tipo *</label>
              <div className="flex gap-2">
                {['pago', 'abono'].map(t => (
                  <button key={t} type="button"
                    onClick={() => setForm({ ...form, tipo: t })}
                    className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
                      form.tipo === t
                        ? 'bg-primary text-dark-bg border-primary'
                        : 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-text/60'
                    }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-2">
              <label className="campo-label">pedido *</label>
              <select value={form.pedido_id}
                onChange={e => setForm({ ...form, pedido_id: e.target.value })}
                className="campo-input">
                <option value="">seleccionar pedido...</option>
                {pedidos.map(p => (
                  <option key={p.id} value={p.id}>
                    #{p.id} - {p.cliente} - {formatPrecio(p.total)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="campo-label">monto *</label>
              <input type="number" step="0.01" value={form.monto}
                onChange={e => setForm({ ...form, monto: e.target.value })}
                className="campo-input" placeholder="0.00" />
            </div>
            <div>
              <label className="campo-label">metodo</label>
              <select value={form.metodo}
                onChange={e => setForm({ ...form, metodo: e.target.value })}
                className="campo-input">
                <option value="efectivo">efectivo</option>
                <option value="transferencia">transferencia</option>
                <option value="tarjeta">tarjeta</option>
                <option value="nequi">nequi</option>
                <option value="daviplata">daviplata</option>
              </select>
            </div>
            {form.tipo === 'abono' && (
              <div className="col-span-2">
                <label className="campo-label">comprobante</label>
                <input value={form.comprobante || ''}
                  onChange={e => setForm({ ...form, comprobante: e.target.value })}
                  className="campo-input" placeholder="numero o referencia del comprobante" />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button type="button" onClick={() => setModal(false)}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border
                text-gray-500 dark:text-dark-text/60 rounded-lg hover:border-primary/40">
              cancelar
            </button>
            <button type="submit" disabled={guardar.isPending} className="btn-primary">
              {guardar.isPending ? 'guardando...' : 'registrar'}
            </button>
          </div>
        </form>
      </Modal>
 
      {/* modal detalles */}
      <Modal abierto={modalDetalle.abierto}
        onCerrar={() => setModalDetalle({ abierto: false, item: null })}
        titulo={`detalle ${modalDetalle.item?.tipo} #${modalDetalle.item?.id}`}>
        {modalDetalle.item && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="campo-label">tipo</p>
                <span className={`badge ${modalDetalle.item.tipo === 'abono'
                  ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                  : 'bg-primary/20 text-green-700 dark:text-primary'}`}>
                  {modalDetalle.item.tipo}
                </span>
              </div>
              <div>
                <p className="campo-label">estado</p>
                <span className={modalDetalle.item.estado_id === 8 ? 'badge-anulado' :
                  modalDetalle.item.estado_id === 5 || modalDetalle.item.estado_id === 6
                    ? 'badge-activo' : 'badge-pendiente'}>
                  {modalDetalle.item.estado || 'pendiente'}
                </span>
              </div>
              <div>
                <p className="campo-label">pedido</p>
                <p className="text-light-text dark:text-dark-text">
                  #{modalDetalle.item.pedido_id}
                </p>
              </div>
              <div>
                <p className="campo-label">monto</p>
                <p className="text-primary font-semibold">
                  {formatPrecio(modalDetalle.item.monto)}
                </p>
              </div>
              <div>
                <p className="campo-label">metodo</p>
                <p className="text-light-text dark:text-dark-text">
                  {modalDetalle.item.metodo}
                </p>
              </div>
              <div>
                <p className="campo-label">fecha</p>
                <p className="text-light-text dark:text-dark-text">
                  {formatFechaHora(modalDetalle.item.fecha)}
                </p>
              </div>
              {modalDetalle.item.comprobante && (
                <div className="col-span-2">
                  <p className="campo-label">comprobante</p>
                  <p className="text-light-text dark:text-dark-text">
                    {modalDetalle.item.comprobante}
                  </p>
                </div>
              )}
            </div>
            {modalDetalle.item.estado_id !== 8 && (
              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
                <div className="flex-1">
                  <select
                    onChange={e => cambiarEstado.mutate({
                      id: modalDetalle.item.id,
                      tipo: modalDetalle.item.tipo,
                      estado_id: +e.target.value
                    })}
                    defaultValue=""
                    className="campo-input text-xs">
                    <option value="" disabled>cambiar estado...</option>
                    {estados.map(e => (
                      <option key={e.id} value={e.id}>{e.nombre}</option>
                    ))}
                  </select>
                </div>
                <button onClick={() => {
                  setModalDetalle({ abierto: false, item: null })
                  setModalAnular({ abierto: true, item: modalDetalle.item })
                }} className="px-3 py-1.5 text-xs border border-red-400/40 text-red-400
                  rounded-lg hover:bg-red-400/10 transition-colors">
                  anular
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
 
      {/* modal editar */}
      <Modal abierto={modalEditar.abierto}
        onCerrar={() => setModalEditar({ abierto: false, item: null })}
        titulo={`editar ${modalEditar.item?.tipo} #${modalEditar.item?.id}`}>
        <form onSubmit={handleActualizar} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="campo-label">monto *</label>
              <input type="number" step="0.01" value={formEdit.monto}
                onChange={e => setFormEdit({ ...formEdit, monto: e.target.value })}
                className="campo-input" />
            </div>
            <div>
              <label className="campo-label">metodo</label>
              <select value={formEdit.metodo}
                onChange={e => setFormEdit({ ...formEdit, metodo: e.target.value })}
                className="campo-input">
                <option value="efectivo">efectivo</option>
                <option value="transferencia">transferencia</option>
                <option value="tarjeta">tarjeta</option>
                <option value="nequi">nequi</option>
                <option value="daviplata">daviplata</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="campo-label">estado</label>
              <select value={formEdit.estado_id}
                onChange={e => setFormEdit({ ...formEdit, estado_id: e.target.value })}
                className="campo-input">
                {estados.map(e => (
                  <option key={e.id} value={e.id}>{e.nombre}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button type="button" onClick={() => setModalEditar({ abierto: false, item: null })}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border
                text-gray-500 dark:text-dark-text/60 rounded-lg hover:border-primary/40">
              cancelar
            </button>
            <button type="submit" disabled={actualizar.isPending} className="btn-primary">
              {actualizar.isPending ? 'guardando...' : 'guardar'}
            </button>
          </div>
        </form>
      </Modal>
 
      {/* modal confirmar anular */}
      <Modal abierto={modalAnular.abierto}
        onCerrar={() => setModalAnular({ abierto: false, item: null })}
        titulo="confirmar anulacion" ancho="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-light-text dark:text-dark-text">
            estas seguro que deseas anular el {modalAnular.item?.tipo}
            <span className="font-medium text-primary"> #{modalAnular.item?.id}</span> por
            <span className="font-medium text-primary"> {formatPrecio(modalAnular.item?.monto)}</span>?
            esta accion no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => setModalAnular({ abierto: false, item: null })}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border
                text-gray-500 dark:text-dark-text/60 rounded-lg hover:border-primary/40">
              cancelar
            </button>
            <button onClick={() => anular.mutate({ id: modalAnular.item.id, tipo: modalAnular.item.tipo })}
              disabled={anular.isPending}
              className="px-4 py-1.5 text-sm bg-red-500 hover:bg-red-600
                text-white rounded-lg transition-colors disabled:opacity-50">
              {anular.isPending ? 'anulando...' : 'anular'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
