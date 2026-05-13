import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/services/api'
import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
import toast from 'react-hot-toast'
import { Plus, Edit2, ToggleLeft, ToggleRight, Eye, Trash2, Shield, Lock } from 'lucide-react'
 
const formVacio = { nombre: '', descripcion: '' }
 
const agruparPermisos = permisos => permisos.reduce((acc, p) => {
  if (!acc[p.modulo]) acc[p.modulo] = []
  acc[p.modulo].push(p)
  return acc
}, {})
 
export default function Roles() {
  const qc = useQueryClient()
  const [modal, setModal]               = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]     = useState(formVacio)
  const [errores, setErrores] = useState({})
  // tab del modal: 'info' | 'permisos'
  const [tab, setTab]       = useState('info')
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([])
 
  const { data: roles = [] }         = useQuery({ queryKey: ['roles'],    queryFn: () => api.get('/roles').then(r => r.data.datos) })
  const { data: todosPermisos = [] } = useQuery({ queryKey: ['permisos'], queryFn: () => api.get('/roles/permisos').then(r => r.data.datos) })
 
  // al abrir modal de edición, cargar permisos actuales
  const abrirModal = async (item = null) => {
    setForm(item ? { nombre: item.nombre, descripcion: item.descripcion || '' } : formVacio)
    setTab('info')
    setErrores({})
    if (item) {
      try {
        const { data } = await api.get(`/roles/${item.id}`)
        setPermisosSeleccionados(data.datos.permisos?.map(p => p.id) || [])
      } catch { setPermisosSeleccionados([]) }
    } else {
      setPermisosSeleccionados([])
    }
    setModal({ abierto: true, item })
  }
  const cerrarModal = () => { setModal({ abierto: false, item: null }); setTab('info') }
 
  const guardar = useMutation({
    mutationFn: async data => {
      let res
      if (modal.item) {
        res = await api.put(`/roles/${modal.item.id}`, { nombre: data.nombre, descripcion: data.descripcion })
        // actualizar permisos
        await api.post(`/roles/${modal.item.id}/permisos`, { permiso_ids: permisosSeleccionados })
      } else {
        res = await api.post('/roles', { nombre: data.nombre, descripcion: data.descripcion })
        // asignar permisos al nuevo rol
        if (permisosSeleccionados.length > 0) {
          await api.post(`/roles/${res.data.datos.id}/permisos`, { permiso_ids: permisosSeleccionados })
        }
      }
      return res.data
    },
    onSuccess: () => { qc.invalidateQueries(['roles']); cerrarModal(); 	oast.success('Rol guardado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const toggleEstado = useMutation({
    mutationFn: id => api.patch(`/roles/${id}/estado`),
    onSuccess: () => { qc.invalidateQueries(['roles']); 	oast.success('Estado actualizado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'no se puede modificar')
  })
 
  const eliminar = useMutation({
    mutationFn: id => api.delete(`/roles/${id}`),
    onSuccess: () => { qc.invalidateQueries(['roles']); setModalEliminar({ abierto: false, item: null }); 	oast.success('Rol eliminado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'no se puede eliminar')
  })
 
  const handleSubmit = e => {
    e.preventDefault()
    if (!form.nombre.trim()) { setErrores({ nombre: 'el nombre es obligatorio' }); return }
    guardar.mutate(form)
  }
 
  const togglePermiso = id =>
    setPermisosSeleccionados(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id])
 
  const toggleModulo = perms => {
    const ids = perms.map(p => p.id)
    const todos = ids.every(id => permisosSeleccionados.includes(id))
    setPermisosSeleccionados(prev => todos ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])])
  }
 
  const seleccionarTodos = () => setPermisosSeleccionados(todosPermisos.map(p => p.id))
  const limpiarTodos = () => setPermisosSeleccionados([])
 
  const gruposPermisos = agruparPermisos(todosPermisos)
  const esAdmin = id => +id === 1
 
  const columnas = [
    { key: 'nombre',         label: 'Rol' },
    { key: 'descripcion',    label: 'Descripción', render: r => r.descripcion || '-' },
    { key: 'total_usuarios', label: 'Usuarios',
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
        acciones={fila => (
          esAdmin(fila.id) ? (
            <span className="flex items-center gap-1 text-xs text-gray-400 px-2">
              <Lock size={11} /> protegido
            </span>
          ) : (<>
            <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost"><Eye size={14} /></button>
            <button onClick={() => abrirModal(fila)} className="btn-ghost"><Edit2 size={14} /></button>
            <button onClick={() => toggleEstado.mutate(fila.id)}
              className={`btn-ghost ${fila.estado ? 'hover:text-red-400' : 'hover:text-green-400'}`}>
              {fila.estado ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
            </button>
            <button onClick={() => setModalEliminar({ abierto: true, item: fila })}
              className="btn-ghost hover:text-red-400"><Trash2 size={14} /></button>
          </>)
        )}
      />
 
      {/* ───── MODAL CREAR/EDITAR con 2 tabs ───── */}
      <Modal abierto={modal.abierto} onCerrar={cerrarModal}
        titulo={modal.item ? `editar rol — ${modal.item.nombre}` : 'nuevo rol'} ancho="max-w-2xl">
 
        {/* tabs */}
        <div className="flex gap-1 mb-4 p-1 bg-light-bg dark:bg-dark-bg rounded-xl">
          {[{ id: 'info', label: 'Información', icon: Edit2 }, { id: 'permisos', label: 'Permisos', icon: Shield }].map(t => (
            <button key={t.id} type="button" onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 flex-1 justify-center py-2 rounded-lg text-xs font-medium transition-all ${
                tab === t.id
                  ? 'bg-primary text-dark-bg shadow-sm'
                  : 'text-gray-500 dark:text-dark-text/60 hover:text-primary'
              }`}>
              <t.icon size={13} /> {t.label}
              {t.id === 'permisos' && permisosSeleccionados.length > 0 && (
                <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${tab === 'permisos' ? 'bg-dark-bg/20' : 'bg-primary/20 text-primary'}`}>
                  {permisosSeleccionados.length}
                </span>
              )}
            </button>
          ))}
        </div>
 
        <form onSubmit={handleSubmit}>
 
          {/* tab info */}
          {tab === 'info' && (
            <div className="space-y-3">
              <div>
                <label className="campo-label">nombre del rol *</label>
                <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`} placeholder="nombre del rol" />
                {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
              </div>
              <div>
                <label className="campo-label">descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  rows={2} className="campo-input resize-none" placeholder="descripción del rol..." />
              </div>
              {!modal.item && (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-xs text-blue-600 dark:text-blue-400">
                  💡 puedes asignar permisos ahora en la pestaña "permisos" o hacerlo después.
                </div>
              )}
            </div>
          )}
 
          {/* tab permisos */}
          {tab === 'permisos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500 dark:text-dark-text/60">
                  {permisosSeleccionados.length} de {todosPermisos.length} permisos seleccionados
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={seleccionarTodos}
                    className="text-xs text-primary hover:underline">seleccionar todos</button>
                  <span className="text-gray-300">|</span>
                  <button type="button" onClick={limpiarTodos}
                    className="text-xs text-gray-400 hover:underline">limpiar</button>
                </div>
              </div>
 
              <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                {Object.entries(gruposPermisos).map(([modulo, perms]) => {
                  const todosSelec = perms.every(p => permisosSeleccionados.includes(p.id))
                  return (
                    <div key={modulo} className="border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-light-bg dark:bg-dark-bg">
                        <span className="text-xs font-semibold text-light-text dark:text-dark-text capitalize">{modulo}</span>
                        <button type="button" onClick={() => toggleModulo(perms)}
                          className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                            todosSelec
                              ? 'bg-primary text-dark-bg border-primary'
                              : 'border-gray-200 dark:border-dark-border text-gray-500 hover:border-primary/40'
                          }`}>
                          {todosSelec ? 'quitar todos' : 'todos'}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-px bg-gray-100 dark:bg-dark-border">
                        {perms.map(p => (
                          <label key={p.id}
                            className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer
                              bg-light-card dark:bg-dark-card hover:bg-primary/5 transition-colors">
                            <input type="checkbox"
                              checked={permisosSeleccionados.includes(p.id)}
                              onChange={() => togglePermiso(p.id)}
                              className="accent-primary shrink-0" />
                            <div>
                              <span className="text-light-text dark:text-dark-text">{p.nombre.replace(/_/g, ' ')}</span>
                              {p.descripcion && <p className="text-gray-400 text-xs mt-0.5">{p.descripcion}</p>}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
 
          <div className="flex justify-end gap-2 pt-3 mt-3 border-t border-gray-200 dark:border-dark-border">
            <button type="button" onClick={cerrarModal}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
            <button type="submit" disabled={guardar.isPending} className="btn-primary">
              {guardar.isPending ? 'Guardando...' : 'Aceptar'}
            </button>
          </div>
        </form>
      </Modal>
 
      {/* ───── MODAL DETALLE ───── */}
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
              {modalDetalle.item.descripcion && (
                <div className="col-span-2"><p className="campo-label">descripción</p>
                  <p className="text-xs text-gray-500">{modalDetalle.item.descripcion}</p></div>
              )}
            </div>
            {!esAdmin(modalDetalle.item.id) && (
              <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
                <button onClick={() => { setModalDetalle({ abierto: false, item: null }); abrirModal(modalDetalle.item) }}
                  className="btn-outline text-xs"><Edit2 size={12} /> editar</button>
                <button onClick={() => { setModalDetalle({ abierto: false, item: null }); abrirModal(modalDetalle.item).then(() => setTab('permisos')) }}
                  className="btn-outline text-xs"><Shield size={12} /> permisos</button>
              </div>
            )}
          </div>
        )}
      </Modal>
 
      {/* ───── MODAL ELIMINAR ───── */}
      <Modal abierto={modalEliminar.abierto} onCerrar={() => setModalEliminar({ abierto: false, item: null })}
        titulo="confirmar eliminación" ancho="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm">¿eliminar el rol
            <span className="font-medium text-primary"> {modalEliminar.item?.nombre}</span>?
            No se puede si tiene usuarios asignados.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => setModalEliminar({ abierto: false, item: null })}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
            <button onClick={() => eliminar.mutate(modalEliminar.item.id)} disabled={eliminar.isPending}
              className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50">
              {eliminar.isPending ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
