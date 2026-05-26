import { Plus, Edit2, Eye, Trash2, Lock } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import EstadoToggle from '@shared/components/EstadoToggle'
import { useRoles } from '../hooks/useRoles'
import RolForm     from '../components/RolForm'
import RolDetalle  from '../components/RolDetalle'
import RolEliminar from '../components/RolEliminar'

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

  const columnas = [
    { key: 'nombre',         label: 'Rol' },
    { key: 'descripcion',    label: 'Descripción', render: r => r.descripcion || '—' },
    { key: 'total_usuarios', label: 'Usuarios',    render: r => <span className="badge-proceso">{r.total_usuarios}</span> },
    { key: 'estado', label: 'Estado',
      render: r => <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>{r.estado ? 'Activo' : 'Inactivo'}</span>
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
            <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost" title="Ver detalle"><Eye size={14} /></button>
            <button onClick={() => abrirModal(fila)} className="btn-ghost" title="Editar"><Edit2 size={14} /></button>
            <EstadoToggle
              activo={fila.estado}
              onChange={() => toggleEstado.mutate(fila.id)}
              cargando={toggleEstado.isPending}
            />
            <button onClick={() => setModalEliminar({ abierto: true, item: fila })} className="btn-ghost hover:text-red-400" title="Eliminar">
              <Trash2 size={14} />
            </button>
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
    </div>
  )
}