import { useState } from 'react'
import { Plus, Edit2, Eye, Trash2, Lock } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import { useRoles } from '../hooks/useRoles'
import RolForm         from '../components/RolForm'
import RolDetalle      from '../components/RolDetalle'
import RolEliminar     from '../components/RolEliminar'
import RolConfirmEstado from '../components/Rolconfirmestado'

function SwitchEstado({ activo, onClick, labelActivo = 'Activo', labelInactivo = 'Inactivo' }) {
  return (
    <button type="button" onClick={e => { e.stopPropagation(); onClick() }}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium transition-colors cursor-pointer w-24 justify-center ${
        activo ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20' : 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200'
      }`}>
      <span className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors shrink-0 ${activo ? 'bg-primary' : 'bg-gray-300'}`}>
        <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform ${activo ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
      </span>
      {activo ? labelActivo : labelInactivo}
    </button>
  )
}

export default function Roles() {
  const {
    roles, todosPermisos, gruposPermisos,
    form, setForm, errores, tab, setTab,
    permisosSeleccionados,
    modal, modalDetalle, modalEliminar,
    setModalDetalle, setModalEliminar,
    esProtegido, abrirModal, cerrarModal, handleSubmit, handleNombreChange,
    toggleEstado, eliminar, togglePermiso, toggleModulo,
    seleccionarTodos, limpiarTodos, guardando, eliminando,
  } = useRoles()

  const [confirmToggle, setConfirmToggle] = useState(null)

  const columnas = [
    { key: 'nombre',         label: 'Rol' },
    { key: 'descripcion',    label: 'Descripción', render: r => r.descripcion || '—' },
    { key: 'total_usuarios', label: 'Usuarios',    render: r => <span className="badge-proceso">{r.total_usuarios}</span> },
    { key: 'estado', label: 'Estado',
      render: r => esProtegido(r.id)
        ? <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium w-24 justify-center bg-gray-100 border-gray-200 text-gray-400">
            <span className="relative inline-flex h-4 w-7 items-center rounded-full bg-gray-200 shrink-0">
              <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform ${r.estado ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
            </span>
            {r.estado ? 'Activo' : 'Inactivo'}
          </span>
        : <SwitchEstado activo={r.estado} labelActivo="Activo" labelInactivo="Inactivo"
            onClick={() => setConfirmToggle({ id: r.id, nombre: r.nombre, estadoActual: r.estado })} />
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Roles y Permisos</h1>
        <button onClick={() => abrirModal()} className="btn-primary"><Plus size={14} /> Nuevo Rol</button>
      </div>

      <Tabla columnas={columnas} datos={roles}
        acciones={fila => (
          esProtegido(fila.id) ? (
            <span className="flex items-center gap-1 text-xs text-gray-400 px-2"><Lock size={11} /> Protegido</span>
          ) : (<>
            <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost"><Eye size={14} /></button>
            <button onClick={() => abrirModal(fila)} className="btn-ghost"><Edit2 size={14} /></button>
            <button onClick={() => setModalEliminar({ abierto: true, item: fila })} className="btn-ghost hover:text-red-400"><Trash2 size={14} /></button>
          </>)
        )}
      />

      <RolForm modal={modal} form={form} setForm={setForm} errores={errores} tab={tab} setTab={setTab}
        permisosSeleccionados={permisosSeleccionados} gruposPermisos={gruposPermisos} todosPermisos={todosPermisos}
        handleSubmit={handleSubmit} cerrarModal={cerrarModal} guardando={guardando}
        handleNombreChange={handleNombreChange}
        togglePermiso={togglePermiso} toggleModulo={toggleModulo}
        seleccionarTodos={seleccionarTodos} limpiarTodos={limpiarTodos} />
      <RolDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle} abrirModal={abrirModal} esProtegido={esProtegido} />
      <RolEliminar modalEliminar={modalEliminar} setModalEliminar={setModalEliminar} eliminar={eliminar} eliminando={eliminando} />
      <RolConfirmEstado confirmToggle={confirmToggle} setConfirmToggle={setConfirmToggle} toggleEstado={toggleEstado} />
    </div>
  )
}