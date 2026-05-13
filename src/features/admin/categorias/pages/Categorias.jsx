import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/services/api'
import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
import toast from 'react-hot-toast'
import { Plus, Edit2, ToggleLeft, ToggleRight, Eye, Trash2 } from 'lucide-react'
import { formatFecha } from '@shared/utils/validaciones'
 
const formVacio = { nombre: '', descripcion: '' }
 
const validarForm = form => {
  const e = {}
  if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
  else if (form.nombre.trim().length < 2) e.nombre = 'Mínimo 2 caracteres'
  else if (form.nombre.trim().length > 100) e.nombre = 'Máximo 100 caracteres'
  return e
}
 
export default function Categorias() {
  const qc = useQueryClient()
  const [modal, setModal] = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm] = useState(formVacio)
  const [errores, setErrores] = useState({})
 
  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => api.get('/categorias').then(r => r.data.datos)
  })
 
  const guardar = useMutation({
    mutationFn: data => modal.item ? api.put(`/categorias/${modal.item.id}`, data) : api.post('/categorias', data),
    onSuccess: () => { qc.invalidateQueries(['categorias']); cerrarModal(); toast.success('Categoría guardada') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error al guardar')
  })
 
  const toggleEstado = useMutation({
    mutationFn: id => api.patch(`/categorias/${id}/estado`),
    onSuccess: () => { qc.invalidateQueries(['categorias']); toast.success('Estado actualizado') }
  })
 
  const eliminar = useMutation({
    mutationFn: id => api.delete(`/categorias/${id}`),
    onSuccess: () => { qc.invalidateQueries(['categorias']); setModalEliminar({ abierto: false, item: null }); toast.success('Categoría eliminada') },
    onError: err => toast.error(err.response?.data?.mensaje || 'No se puede eliminar')
  })
 
  const abrirModal = (item = null) => {
    setForm(item ? { nombre: item.nombre, descripcion: item.descripcion || '' } : formVacio)
    setErrores({})
    setModal({ abierto: true, item })
  }
  const cerrarModal = () => { setModal({ abierto: false, item: null }); setErrores({}) }
 
  const handleChange = (campo, valor) => {
    const nuevo = { ...form, [campo]: valor }
    setForm(nuevo)
    const e = validarForm(nuevo)
    setErrores(prev => ({ ...prev, [campo]: e[campo] || '' }))
  }
 
  const handleSubmit = e => {
    e.preventDefault()
    const e2 = validarForm(form)
    if (Object.keys(e2).length) { setErrores(e2); return }
    guardar.mutate(form)
  }
 
  const columnas = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción', render: r => r.descripcion || '—' },
    { key: 'created_at', label: 'Creada', render: r => formatFecha(r.created_at) },
    { key: 'estado', label: 'Estado', render: r => <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>{r.estado ? 'Activa' : 'Inactiva'}</span> },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Categorías</h1>
        <button onClick={() => abrirModal()} className="btn-primary"><Plus size={14} /> Nueva Categoría</button>
      </div>
 
      <Tabla columnas={columnas} datos={categorias}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost" title="Ver"><Eye size={14} /></button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost" title="Editar"><Edit2 size={14} /></button>
          <button onClick={() => toggleEstado.mutate(fila.id)} className={`btn-ghost ${fila.estado ? 'hover:text-red-400' : 'hover:text-green-400'}`}>
            {fila.estado ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })} className="btn-ghost hover:text-red-400"><Trash2 size={14} /></button>
        </>)}
      />
 
      <Modal abierto={modal.abierto} onCerrar={cerrarModal} titulo={modal.item ? 'Editar Categoría' : 'Nueva Categoría'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="campo-label">Nombre *</label>
            <input value={form.nombre} onChange={e => handleChange('nombre', e.target.value)}
              className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`} placeholder="Nombre de la categoría" maxLength={100} />
            {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
          </div>
          <div>
            <label className="campo-label">Descripción</label>
            <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
              rows={3} className="campo-input resize-none" placeholder="Descripción de la categoría" maxLength={500} />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button type="button" onClick={cerrarModal} className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
            <button type="submit" disabled={guardar.isPending} className="btn-primary">{guardar.isPending ? 'Guardando...' : 'Aceptar'}</button>
          </div>
        </form>
      </Modal>
 
      <Modal abierto={modalDetalle.abierto} onCerrar={() => setModalDetalle({ abierto: false, item: null })} titulo="Detalle de Categoría">
        {modalDetalle.item && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="campo-label">Nombre</p><p className="font-medium">{modalDetalle.item.nombre}</p></div>
              <div><p className="campo-label">Estado</p><span className={modalDetalle.item.estado ? 'badge-activo' : 'badge-inactivo'}>{modalDetalle.item.estado ? 'Activa' : 'Inactiva'}</span></div>
              <div className="col-span-2"><p className="campo-label">Descripción</p><p>{modalDetalle.item.descripcion || '—'}</p></div>
              <div><p className="campo-label">Fecha de Creación</p><p>{formatFecha(modalDetalle.item.created_at)}</p></div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
              <button onClick={() => { setModalDetalle({ abierto: false, item: null }); abrirModal(modalDetalle.item) }} className="btn-outline text-xs"><Edit2 size={12} /> Editar</button>
            </div>
          </div>
        )}
      </Modal>
 
      <Modal abierto={modalEliminar.abierto} onCerrar={() => setModalEliminar({ abierto: false, item: null })} titulo="Confirmar Eliminación" ancho="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm">¿Está seguro que desea eliminar la categoría <span className="font-medium text-primary">{modalEliminar.item?.nombre}</span>?</p>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => setModalEliminar({ abierto: false, item: null })} className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
            <button onClick={() => eliminar.mutate(modalEliminar.item.id)} disabled={eliminar.isPending} className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50">{eliminar.isPending ? 'Eliminando...' : 'Aceptar'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
 
