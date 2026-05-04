import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import Tabla from '../../components/Tabla'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { Plus, Edit2, ToggleLeft, ToggleRight, Eye, MapPin, Download } from 'lucide-react'
import { formatFecha, formatPrecio } from '../../utils/validaciones'
import { descargarPDF } from '../../utils/reportes'
 
const formVacio = { nombre: '', apellido: '', email: '', telefono: '' }
const dirVacio  = { direccion: '', ciudad: '', indicaciones: '' }
 
export default function Clientes() {
  const qc = useQueryClient()
  const [modal, setModal]               = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, item: null })
  const [modalDir, setModalDir]         = useState({ abierto: false, cliente: null })
  const [form, setForm]                 = useState(formVacio)
  const [formDir, setFormDir]           = useState(dirVacio)
  const [errores, setErrores]           = useState({})
 
  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => api.get('/clientes').then(r => r.data.datos)
  })
  const { data: direcciones = [], refetch: refetchDir } = useQuery({
    queryKey: ['direcciones', modalDir.cliente?.id],
    queryFn: () => api.get(`/clientes/${modalDir.cliente?.id}/direcciones`).then(r => r.data.datos),
    enabled: !!modalDir.cliente?.id
  })
  const { data: historial = [] } = useQuery({
    queryKey: ['historial-cliente', modalDetalle.item?.id],
    queryFn: () => api.get(`/pedidos?cliente_id=${modalDetalle.item?.id}`).then(r => r.data.datos),
    enabled: !!modalDetalle.item?.id
  })
 
  const guardar = useMutation({
    mutationFn: data => modal.item
      ? api.put(`/clientes/${modal.item.id}`, data)
      : api.post('/clientes', data),
    onSuccess: () => {
      qc.invalidateQueries(['clientes'])
      cerrarModal()
      toast.success('cliente guardado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const guardarDir = useMutation({
    mutationFn: data => api.post(`/clientes/${modalDir.cliente.id}/direcciones`, data),
    onSuccess: () => {
      refetchDir()
      setFormDir(dirVacio)
      toast.success('direccion guardada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const toggleEstado = useMutation({
    mutationFn: id => api.patch(`/clientes/${id}/estado`),
    onSuccess: () => {
      qc.invalidateQueries(['clientes'])
      toast.success('estado actualizado')
    }
  })
 
  const abrirModal = (item = null) => {
    setForm(item ? {
      nombre: item.nombre, apellido: item.apellido,
      email: item.email || '', telefono: item.telefono || ''
    } : formVacio)
    setErrores({})
    setModal({ abierto: true, item })
  }
 
  const cerrarModal = () => setModal({ abierto: false, item: null })
 
  const validar = () => {
    const e = {}
    if (!form.nombre.trim())   e.nombre   = 'el nombre es obligatorio'
    if (!form.apellido.trim()) e.apellido = 'el apellido es obligatorio'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'correo invalido'
    return e
  }
 
  const handleSubmit = e => {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length) { setErrores(e2); return }
    guardar.mutate(form)
  }
 
  const handleSubmitDir = e => {
    e.preventDefault()
    if (!formDir.direccion.trim()) { toast.error('la direccion es obligatoria'); return }
    guardarDir.mutate(formDir)
  }
 
  const descargarReporte = () => descargarPDF('/reportes/clientes', 'reporte-clientes.pdf')
 
  const columnas = [
    { key: 'nombre',   label: 'Nombre',
      render: r => `${r.nombre} ${r.apellido}` },
    { key: 'email',    label: 'Correo',    render: r => r.email    || '-' },
    { key: 'telefono', label: 'Telefono',  render: r => r.telefono || '-' },
    { key: 'estado',   label: 'Estado',
      render: r => (
        <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>
          {r.estado ? 'activo' : 'inactivo'}
        </span>
      )
    },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">clientes</h1>
        <div className="flex gap-2">
          <button onClick={descargarReporte} className="btn-outline">
            <Download size={14} /> reporte
          </button>
          <button onClick={() => abrirModal()} className="btn-primary">
            <Plus size={14} /> nuevo
          </button>
        </div>
      </div>
 
      <Tabla columnas={columnas} datos={clientes}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })}
            className="btn-ghost" title="ver detalles">
            <Eye size={14} />
          </button>
          <button onClick={() => setModalDir({ abierto: true, cliente: fila })}
            className="btn-ghost" title="direcciones">
            <MapPin size={14} />
          </button>
          <button onClick={() => abrirModal(fila)}
            className="btn-ghost" title="editar">
            <Edit2 size={14} />
          </button>
          <button onClick={() => toggleEstado.mutate(fila.id)}
            className={`btn-ghost ${fila.estado ? 'hover:text-red-400' : 'hover:text-green-400'}`}
            title={fila.estado ? 'desactivar' : 'activar'}>
            {fila.estado ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
        </>)}
      />
 
      {/* modal nuevo / editar */}
      <Modal abierto={modal.abierto} onCerrar={cerrarModal}
        titulo={modal.item ? 'editar cliente' : 'nuevo cliente'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="campo-label">nombre *</label>
              <input value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`}
                placeholder="nombre" />
              {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
            </div>
            <div>
              <label className="campo-label">apellido *</label>
              <input value={form.apellido}
                onChange={e => setForm({ ...form, apellido: e.target.value })}
                className={`campo-input ${errores.apellido ? 'border-red-400' : ''}`}
                placeholder="apellido" />
              {errores.apellido && <p className="campo-error">{errores.apellido}</p>}
            </div>
            <div>
              <label className="campo-label">correo</label>
              <input type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={`campo-input ${errores.email ? 'border-red-400' : ''}`}
                placeholder="correo@ejemplo.com" />
              {errores.email && <p className="campo-error">{errores.email}</p>}
            </div>
            <div>
              <label className="campo-label">telefono</label>
              <input value={form.telefono}
                onChange={e => setForm({ ...form, telefono: e.target.value })}
                className="campo-input" placeholder="ej: 3001234567" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button type="button" onClick={cerrarModal}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border
                text-gray-500 dark:text-dark-text/60 rounded-lg hover:border-primary/40">
              cancelar
            </button>
            <button type="submit" disabled={guardar.isPending} className="btn-primary">
              {guardar.isPending ? 'guardando...' : 'guardar'}
            </button>
          </div>
        </form>
      </Modal>
 
      {/* modal detalles */}
      <Modal abierto={modalDetalle.abierto}
        onCerrar={() => setModalDetalle({ abierto: false, item: null })}
        titulo="detalles del cliente" ancho="max-w-lg">
        {modalDetalle.item && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="campo-label">nombre completo</p>
                <p className="text-light-text dark:text-dark-text font-medium">
                  {modalDetalle.item.nombre} {modalDetalle.item.apellido}
                </p>
              </div>
              <div>
                <p className="campo-label">estado</p>
                <span className={modalDetalle.item.estado ? 'badge-activo' : 'badge-inactivo'}>
                  {modalDetalle.item.estado ? 'activo' : 'inactivo'}
                </span>
              </div>
              <div>
                <p className="campo-label">correo</p>
                <p className="text-light-text dark:text-dark-text">
                  {modalDetalle.item.email || '-'}
                </p>
              </div>
              <div>
                <p className="campo-label">telefono</p>
                <p className="text-light-text dark:text-dark-text">
                  {modalDetalle.item.telefono || '-'}
                </p>
              </div>
            </div>
 
            {/* historial de pedidos */}
            <div>
              <p className="campo-label mb-2">
                historial de pedidos ({historial.length})
              </p>
              {historial.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-dark-text/40 text-center py-3">
                  sin pedidos registrados
                </p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {historial.map(p => (
                    <div key={p.id}
                      className="flex items-center justify-between text-xs p-2
                        rounded bg-light-bg dark:bg-dark-bg">
                      <div>
                        <span className="font-medium text-light-text dark:text-dark-text">
                          pedido #{p.id}
                        </span>
                        <span className="text-gray-400 dark:text-dark-text/40 ml-2">
                          {formatFecha(p.fecha_pedido)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-medium">
                          {formatPrecio(p.total)}
                        </span>
                        <span className={p.estado_id === 3 ? 'badge-anulado' :
                          p.estado_id === 2 ? 'badge-proceso' : 'badge-pendiente'}>
                          {p.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
 
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
              <button onClick={() => toggleEstado.mutate(modalDetalle.item.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  modalDetalle.item.estado
                    ? 'border-red-400/40 text-red-400 hover:bg-red-400/10'
                    : 'border-primary/40 text-primary hover:bg-primary/10'
                }`}>
                {modalDetalle.item.estado ? 'desactivar' : 'activar'}
              </button>
              <button onClick={() => {
                setModalDetalle({ abierto: false, item: null })
                abrirModal(modalDetalle.item)
              }} className="btn-outline text-xs">
                <Edit2 size={12} /> editar
              </button>
            </div>
          </div>
        )}
      </Modal>
 
      {/* modal direcciones */}
      <Modal abierto={modalDir.abierto}
        onCerrar={() => setModalDir({ abierto: false, cliente: null })}
        titulo={`direcciones - ${modalDir.cliente?.nombre || ''} ${modalDir.cliente?.apellido || ''}`}
        ancho="max-w-lg">
        <div className="space-y-4">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {direcciones.length === 0 && (
              <p className="text-xs text-gray-400 dark:text-dark-text/40 text-center py-4">
                sin direcciones registradas
              </p>
            )}
            {direcciones.map(d => (
              <div key={d.id}
                className="p-3 rounded-lg border border-gray-200 dark:border-dark-border">
                <p className="text-sm font-medium text-light-text dark:text-dark-text">
                  {d.direccion}
                </p>
                {d.ciudad && (
                  <p className="text-xs text-gray-400 dark:text-dark-text/50 mt-0.5">
                    {d.ciudad}
                  </p>
                )}
                {d.indicaciones && (
                  <p className="text-xs text-gray-400 dark:text-dark-text/40 italic mt-0.5">
                    {d.indicaciones}
                  </p>
                )}
              </div>
            ))}
          </div>
 
          <form onSubmit={handleSubmitDir}
            className="space-y-2 pt-3 border-t border-gray-200 dark:border-dark-border">
            <p className="text-xs font-medium text-light-text dark:text-dark-text">
              agregar direccion
            </p>
            <input value={formDir.direccion}
              onChange={e => setFormDir({ ...formDir, direccion: e.target.value })}
              className="campo-input" placeholder="direccion completa *" />
            <div className="grid grid-cols-2 gap-2">
              <input value={formDir.ciudad}
                onChange={e => setFormDir({ ...formDir, ciudad: e.target.value })}
                className="campo-input" placeholder="ciudad" />
              <input value={formDir.indicaciones}
                onChange={e => setFormDir({ ...formDir, indicaciones: e.target.value })}
                className="campo-input" placeholder="indicaciones" />
            </div>
            <button type="submit" disabled={guardarDir.isPending}
              className="btn-primary w-full justify-center">
              {guardarDir.isPending ? 'guardando...' : 'agregar direccion'}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  )
}
