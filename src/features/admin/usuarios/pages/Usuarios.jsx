import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/services/api'
import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
import toast from 'react-hot-toast'
import { Plus, Edit2, ToggleLeft, ToggleRight, Eye, Trash2 } from 'lucide-react'
 
const formVacio = {
  nombre: '', apellido: '', email: '', password: '',
  telefono: '', rol_id: '', tipo_documento: 'CC', numero_documento: ''
}
 
export default function Usuarios() {
  const qc = useQueryClient()
  const [modal, setModal]               = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]   = useState(formVacio)
  const [errores, setErrores] = useState({})
 
  const { data: usuarios = [] } = useQuery({
    queryKey: ['usuarios'],
    queryFn: () => api.get('/usuarios').then(r => r.data.datos)
  })
  const { data: roles = [] } = useQuery({
    queryKey: ['roles'],
    queryFn: () => api.get('/roles').then(r => r.data.datos.filter(r => r.estado))
  })
 
  const guardar = useMutation({
    mutationFn: data => modal.item
      ? api.put(`/usuarios/${modal.item.id}`, data)
      : api.post('/usuarios', data),
    onSuccess: () => { qc.invalidateQueries(['usuarios']); cerrarModal(); 	oast.success('Usuario guardado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const toggleEstado = useMutation({
    mutationFn: id => api.patch(`/usuarios/${id}/estado`),
    onSuccess: () => { qc.invalidateQueries(['usuarios']); 	oast.success('Estado actualizado') }
  })
 
  const eliminar = useMutation({
    mutationFn: id => api.delete(`/usuarios/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['usuarios'])
      setModalEliminar({ abierto: false, item: null })
      	oast.success('Usuario eliminado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error al eliminar')
  })
 
  const abrirModal = (item = null) => {
    setForm(item ? {
      nombre: item.nombre, apellido: item.apellido,
      email: item.email, password: '', telefono: item.telefono || '',
      rol_id: item.rol_id,
      tipo_documento: item.tipo_documento || 'CC',
      numero_documento: item.numero_documento || ''
    } : formVacio)
    setErrores({})
    setModal({ abierto: true, item })
  }
 
  const cerrarModal = () => setModal({ abierto: false, item: null })
 
  const validar = () => {
    const e = {}
    if (!form.nombre.trim())   e.nombre   = 'el nombre es obligatorio'
    if (!form.apellido.trim()) e.apellido = 'el apellido es obligatorio'
    if (!form.email.trim())    e.email    = 'el correo es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'correo invalido'
    if (!modal.item && !form.password) e.password = 'la contrasena es obligatoria'
    if (!modal.item && form.password && form.password.length < 6) e.password = 'minimo 6 caracteres'
    if (!form.rol_id) e.rol_id = 'selecciona un rol'
    return e
  }
 
  const handleSubmit = e => {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length) { setErrores(e2); return }
    const data = { ...form }
    if (modal.item && !data.password) delete data.password
    guardar.mutate(data)
  }
 
  const columnas = [
    { key: 'nombre',   label: 'Nombre', render: r => `${r.nombre} ${r.apellido}` },
    { key: 'numero_documento', label: 'Documento',
      render: r => r.numero_documento ? `${r.tipo_documento}: ${r.numero_documento}` : '-' },
    { key: 'email',    label: 'Correo' },
    { key: 'rol',      label: 'Rol' },
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
        <h1 className="page-title">Usuarios</h1>
        <button onClick={() => abrirModal()} className="btn-primary"><Plus size={14} /> Nuevo</button>
      </div>
 
      <Tabla columnas={columnas} datos={usuarios}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })}
            className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost"><Edit2 size={14} /></button>
          <button onClick={() => toggleEstado.mutate(fila.id)}
            className={`btn-ghost ${fila.estado ? 'hover:text-red-400' : 'hover:text-green-400'}`}>
            {fila.estado ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })}
            className="btn-ghost hover:text-red-400"><Trash2 size={14} /></button>
        </>)}
      />
 
      <Modal abierto={modal.abierto} onCerrar={cerrarModal}
        titulo={modal.item ? 'editar usuario' : 'nuevo usuario'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="campo-label">nombre *</label>
              <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`} />
              {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
            </div>
            <div>
              <label className="campo-label">apellido *</label>
              <input value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })}
                className={`campo-input ${errores.apellido ? 'border-red-400' : ''}`} />
              {errores.apellido && <p className="campo-error">{errores.apellido}</p>}
            </div>
            <div>
              <label className="campo-label">tipo documento</label>
              <select value={form.tipo_documento}
                onChange={e => setForm({ ...form, tipo_documento: e.target.value })}
                className="campo-input">
                <option value="CC">Cedula (CC)</option>
                <option value="CE">Cedula extranjeria (CE)</option>
                <option value="TI">Tarjeta identidad (TI)</option>
                <option value="PA">Pasaporte (PA)</option>
              </select>
            </div>
            <div>
              <label className="campo-label">numero documento</label>
              <input value={form.numero_documento}
                onChange={e => setForm({ ...form, numero_documento: e.target.value })}
                className="campo-input" placeholder="Ej: 1234567890" />
            </div>
            <div className="col-span-2">
              <label className="campo-label">correo *</label>
              <input type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={`campo-input ${errores.email ? 'border-red-400' : ''}`} />
              {errores.email && <p className="campo-error">{errores.email}</p>}
            </div>
            <div>
              <label className="campo-label">{modal.item ? 'nueva contrasena' : 'contrasena *'}</label>
              <input type="password" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                className={`campo-input ${errores.password ? 'border-red-400' : ''}`}
                placeholder={modal.item ? 'dejar vacio para no cambiar' : 'minimo 6 caracteres'} />
              {errores.password && <p className="campo-error">{errores.password}</p>}
            </div>
            <div>
              <label className="campo-label">telefono</label>
              <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}
                className="campo-input" placeholder="Ej: 3001234567" />
            </div>
            <div className="col-span-2">
              <label className="campo-label">rol *</label>
              <select value={form.rol_id} onChange={e => setForm({ ...form, rol_id: e.target.value })}
                className={`campo-input ${errores.rol_id ? 'border-red-400' : ''}`}>
                <option value="">seleccionar rol...</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              {errores.rol_id && <p className="campo-error">{errores.rol_id}</p>}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button type="button" onClick={cerrarModal}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border
                text-gray-500 dark:text-dark-text/60 rounded-lg">Cancelar</button>
            <button type="submit" disabled={guardar.isPending} className="btn-primary">
              {guardar.isPending ? 'Guardando...' : 'Aceptar'}</button>
          </div>
        </form>
      </Modal>
 
      <Modal abierto={modalDetalle.abierto}
        onCerrar={() => setModalDetalle({ abierto: false, item: null })}
        titulo="detalles del usuario">
        {modalDetalle.item && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="campo-label">nombre</p>
                <p className="font-medium">{modalDetalle.item.nombre} {modalDetalle.item.apellido}</p></div>
              <div><p className="campo-label">estado</p>
                <span className={modalDetalle.item.estado ? 'badge-activo' : 'badge-inactivo'}>
                  {modalDetalle.item.estado ? 'activo' : 'inactivo'}</span></div>
              <div><p className="campo-label">documento</p>
                <p>{modalDetalle.item.tipo_documento}: {modalDetalle.item.numero_documento || '-'}</p></div>
              <div><p className="campo-label">rol</p><p>{modalDetalle.item.rol}</p></div>
              <div className="col-span-2"><p className="campo-label">correo</p>
                <p>{modalDetalle.item.email}</p></div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
              <button onClick={() => { setModalDetalle({ abierto: false, item: null }); abrirModal(modalDetalle.item) }}
                className="btn-outline text-xs"><Edit2 size={12} /> Editar</button>
            </div>
          </div>
        )}
      </Modal>
 
      <Modal abierto={modalEliminar.abierto}
        onCerrar={() => setModalEliminar({ abierto: false, item: null })}
        titulo="confirmar eliminacion" ancho="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm">estas seguro que deseas eliminar el usuario
            <span className="font-medium text-primary"> {modalEliminar.item?.nombre} {modalEliminar.item?.apellido}</span>?
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => setModalEliminar({ abierto: false, item: null })}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border
                text-gray-500 rounded-lg">Cancelar</button>
            <button onClick={() => eliminar.mutate(modalEliminar.item.id)}
              disabled={eliminar.isPending}
              className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50">
              {eliminar.isPending ? 'Eliminando...' : 'Eliminar'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
