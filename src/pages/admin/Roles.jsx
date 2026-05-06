import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import Tabla from '../../components/Tabla'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { Plus, Edit2, ToggleLeft, ToggleRight, Eye, Trash2, Shield, Lock } from 'lucide-react'
 
const formVacio = { nombre: '', descripcion: '' }
 
// Agrupar permisos por modulo
const agruparPermisos = permisos => permisos.reduce((acc, p) => {
  if (!acc[p.modulo]) acc[p.modulo] = []
  acc[p.modulo].push(p)
  return acc
}, {})
 
export default function Roles() {
  const qc = useQueryClient()
  const [modal, setModal]               = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, item: null })
  const [modalPermisos, setModalPermisos] = useState({ abierto: false, rol: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]     = useState(formVacio)
  const [errores, setErrores] = useState({})
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([])
 
  const { data: roles = [] } = useQuery({ queryKey: ['roles'], queryFn: () => api.get('/roles').then(r => r.data.datos) })
  const { data: todosPermisos = [] } = useQuery({ queryKey: ['permisos'], queryFn: () => api.get('/roles/permisos').then(r => r.data.datos) })
 
  const guardar = useMutation({
    mutationFn: data => modal.item ? api.put(`/roles/${modal.item.id}`, data) : api.post('/roles', data),
    onSuccess: () => { qc.invalidateQueries(['roles']); cerrarModal(); toast.success('rol guardado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const toggleEstado = useMutation({
    mutationFn: id => api.patch(`/roles/${id}/estado`),
    onSuccess: () => { qc.invalidateQueries(['roles']); toast.success('estado actualizado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'no se puede modificar')
  })
 
  const eliminar = useMutation({
    mutationFn: id => api.delete(`/roles/${id}`),
    onSuccess: () => { qc.invalidateQueries(['roles']); setModalEliminar({ abierto: false, item: null }); toast.success('rol eliminado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'no se puede eliminar')
  })
 
  const guardarPermisos = useMutation({
    mutationFn: ({ id, permiso_ids }) => api.post(`/roles/${id}/permisos`, { permiso_ids }),
    onSuccess: () => { qc.invalidateQueries(['roles']); setModalPermisos({ abierto: false, rol: null }); toast.success('permisos actualizados') },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const { data: rolDetalle } = useQuery({
    queryKey: ['rol-detalle', modalPermisos.rol?.id],
    queryFn: () => api.get(`/roles/${modalPermisos.rol?.id}`).then(r => r.data.datos),
    enabled: !!modalPermisos.rol?.id,
    onSuccess: data => setPermisosSeleccionados(data.permisos?.map(p => p.id) || [])
  })
 
  const abrirModal = (item = null) => {
    setForm(item ? { nombre: item.nombre, descripcion: item.descripcion || '' } : formVacio)
    setErrores({})
    setModal({ abierto: true, item })
  }
  const cerrarModal = () => setModal({ abierto: false, item: null })
 
  const abrirPermisos = async (rol) => {
    setModalPermisos({ abierto: true, rol })
    // cargar permisos actuales del rol
    try {
      const { data } = await api.get(`/roles/${rol.id}`)
      setPermisosSeleccionados(data.datos.permisos?.map(p => p.id) || [])
    } catch { setPermisosSeleccionados([]) }
  }
 
  const togglePermiso = (id) => {
    setPermisosSeleccionados(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }
 
  const toggleModulo = (perms) => {
    const ids = perms.map(p => p.id)
    const todosSeleccionados = ids.every(id => permisosSeleccionados.includes(id))
    if (todosSeleccionados) {
      setPermisosSeleccionados(prev => prev.filter(id => !ids.includes(id)))
    } else {
      setPermisosSeleccionados(prev => [...new Set([...prev, ...ids])])
    }
  }
 
  const handleSubmit = e => {
    e.preventDefault()
    if (!form.nombre.trim()) { setErrores({ nombre: 'el nombre es obligatorio' }); return }
    guardar.mutate(form)
  }
 
  const gruposPermisos = agruparPermisos(todosPermisos)
 
  const columnas = [
    { key: 'nombre',          label: 'Rol' },
    { key: 'descripcion',     label: 'Descripcion', render: r => r.descripcion || '-' },
    { key: 'total_usuarios',  label: 'Usuarios',
      render: r => <span className="badge-proceso">{r.total_usuarios}</span>
    },
    { key: 'estado', label: 'Estado',
      render: r => <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>{r.estado ? 'activo' : 'inactivo'}</span>
    },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">roles y permisos</h1>
        <button onClick={() => abrirModal()} className="btn-primary"><Plus size={14} /> nuevo rol</button>
      </div>
 
      <Tabla columnas={columnas} datos={roles}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost"><Eye size={14} /></button>
          {fila.id !== 1 ? (<>
            <button onClick={() => abrirPermisos(fila)} className="btn-ghost" title="permisos"><Shield size={14} /></button>
            <button onClick={() => abrirModal(fila)} className="btn-ghost"><Edit2 size={14} /></button>
            <button onClick={() => toggleEstado.mutate(fila.id)}
              className={`btn-ghost ${fila.estado ? 'hover:text-red-400' : 'hover:text-green-400'}`}>
              {fila.estado ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            </button>
            <button onClick={() => setModalEliminar({ abierto: true, item: fila })}
              className="btn-ghost hover:text-red-400"><Trash2 size={14} /></button>
          </>) : (
            <span className="text-xs text-gray-400 flex items-center gap-1"><Lock size={11} /> protegido</span>
          )}
        </>)}
      />
 
      {/* MODAL CREAR/EDITAR */}
      <Modal abierto={modal.abierto} onCerrar={cerrarModal}
        titulo={modal.item ? 'editar rol' : 'nuevo rol'} ancho="max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="campo-label">nombre *</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
              className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`} placeholder="nombre del rol" />
            {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
          </div>
          <div>
            <label className="campo-label">descripcion</label>
            <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
              rows={2} className="campo-input resize-none" />
          </div>
          {!modal.item && (
            <p className="text-xs text-gray-400 italic">
              El nuevo rol se creara sin permisos. Puedes asignarlos despues con el boton de escudo.
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button type="button" onClick={cerrarModal}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">cancelar</button>
            <button type="submit" disabled={guardar.isPending} className="btn-primary">
              {guardar.isPending ? 'guardando...' : 'guardar'}
            </button>
          </div>
        </form>
      </Modal>
 
      {/* MODAL PERMISOS */}
      <Modal abierto={modalPermisos.abierto} onCerrar={() => setModalPermisos({ abierto: false, rol: null })}
        titulo={`permisos — ${modalPermisos.rol?.nombre || ''}`} ancho="max-w-2xl">
        <div className="space-y-4">
          <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
            {Object.entries(gruposPermisos).map(([modulo, perms]) => {
              const todosSelec = perms.every(p => permisosSeleccionados.includes(p.id))
              return (
                <div key={modulo} className="border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
                  {/* cabecera modulo */}
                  <div className="flex items-center justify-between px-3 py-2 bg-light-bg dark:bg-dark-bg">
                    <span className="text-xs font-semibold text-light-text dark:text-dark-text capitalize">{modulo}</span>
                    <button type="button" onClick={() => toggleModulo(perms)}
                      className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                        todosSelec
                          ? 'bg-primary text-dark-bg border-primary'
                          : 'border-gray-200 dark:border-dark-border text-gray-500 hover:border-primary/40'
                      }`}>
                      {todosSelec ? 'quitar todos' : 'seleccionar todos'}
                    </button>
                  </div>
                  {/* permisos del modulo */}
                  <div className="grid grid-cols-2 gap-px bg-gray-100 dark:bg-dark-border">
                    {perms.map(p => (
                      <label key={p.id} className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer
                        bg-light-card dark:bg-dark-card hover:bg-primary/5 transition-colors">
                        <input type="checkbox"
                          checked={permisosSeleccionados.includes(p.id)}
                          onChange={() => togglePermiso(p.id)}
                          className="accent-primary" />
                        <div>
                          <span className="text-light-text dark:text-dark-text font-mono">{p.nombre}</span>
                          {p.descripcion && <p className="text-gray-400 text-xs mt-0.5">{p.descripcion}</p>}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
 
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-dark-border">
            <span className="text-xs text-gray-400">
              {permisosSeleccionados.length} de {todosPermisos.length} permisos seleccionados
            </span>
            <div className="flex gap-2">
              <button onClick={() => setModalPermisos({ abierto: false, rol: null })}
                className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">cancelar</button>
              <button onClick={() => guardarPermisos.mutate({ id: modalPermisos.rol?.id, permiso_ids: permisosSeleccionados })}
                disabled={guardarPermisos.isPending} className="btn-primary">
                {guardarPermisos.isPending ? 'guardando...' : 'guardar permisos'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
 
      {/* MODAL DETALLE */}
      <Modal abierto={modalDetalle.abierto} onCerrar={() => setModalDetalle({ abierto: false, item: null })}
        titulo="detalles del rol">
        {modalDetalle.item && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="campo-label">nombre</p><p className="font-medium">{modalDetalle.item.nombre}</p></div>
              <div><p className="campo-label">estado</p>
                <span className={modalDetalle.item.estado ? 'badge-activo' : 'badge-inactivo'}>
                  {modalDetalle.item.estado ? 'activo' : 'inactivo'}</span></div>
              <div><p className="campo-label">usuarios asignados</p>
                <span className="badge-proceso">{modalDetalle.item.total_usuarios}</span></div>
              {modalDetalle.item.id === 1 && (
                <div className="col-span-2">
                  <span className="flex items-center gap-1 text-xs text-yellow-500">
                    <Lock size={11} /> rol administrador — protegido, no puede modificarse
                  </span>
                </div>
              )}
              {modalDetalle.item.descripcion && (
                <div className="col-span-2"><p className="campo-label">descripcion</p>
                  <p className="text-xs text-gray-500">{modalDetalle.item.descripcion}</p></div>
              )}
            </div>
            {modalDetalle.item.id !== 1 && (
              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
                <button onClick={() => { setModalDetalle({ abierto: false, item: null }); abrirModal(modalDetalle.item) }}
                  className="btn-outline text-xs"><Edit2 size={12} /> editar</button>
                <button onClick={() => { setModalDetalle({ abierto: false, item: null }); abrirPermisos(modalDetalle.item) }}
                  className="btn-outline text-xs"><Shield size={12} /> permisos</button>
              </div>
            )}
          </div>
        )}
      </Modal>
 
      {/* MODAL ELIMINAR */}
      <Modal abierto={modalEliminar.abierto} onCerrar={() => setModalEliminar({ abierto: false, item: null })}
        titulo="confirmar eliminacion" ancho="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm">estas seguro de eliminar el rol
            <span className="font-medium text-primary"> {modalEliminar.item?.nombre}</span>?
            No se puede eliminar si tiene usuarios asignados.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => setModalEliminar({ abierto: false, item: null })}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">cancelar</button>
            <button onClick={() => eliminar.mutate(modalEliminar.item.id)} disabled={eliminar.isPending}
              className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50">
              {eliminar.isPending ? 'eliminando...' : 'eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
 
