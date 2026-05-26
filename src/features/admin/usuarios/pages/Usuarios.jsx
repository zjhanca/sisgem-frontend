import { Plus, Edit2, Eye, Trash2 } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import EstadoToggle from '@shared/components/EstadoToggle'
import { useUsuarios } from '../hooks/useUsuarios'
import UsuarioForm     from '../components/UsuarioForm'
import UsuarioDetalle  from '../components/UsuarioDetalle'
import UsuarioEliminar from '../components/UsuarioEliminar'
 
export default function Usuarios() {
  const {
    usuarios, roles, form, errores,
    modal, modalDetalle, modalEliminar,
    setModalDetalle, setModalEliminar,
    filtroRol, setFiltroRol, filtroEstado, setFiltroEstado,
    abrirModal, cerrarModal, handleChange, handleSubmit,
    toggleEstado, eliminar, guardando, eliminando, verificando,
  } = useUsuarios()
 
  const columnas = [
    { key: 'nombre',   label: 'Nombre', render: r => `${r.nombre} ${r.apellido}` },
    { key: 'numero_documento', label: 'Documento',
      render: r => r.numero_documento ? `${r.tipo_documento}: ${r.numero_documento}` : '—' },
    { key: 'email',  label: 'Correo' },
    { key: 'rol',    label: 'Rol' },
    { key: 'estado', label: 'Estado',
      render: r => (
        <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>
          {r.estado ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Usuarios</h1>
        <button onClick={() => abrirModal()} className="btn-primary"><Plus size={14} /> Nuevo Usuario</button>
      </div>
 
      {/* filtros */}
      <div className="flex gap-2 mb-4 flex-wrap items-end">
        <div>
          <p className="campo-label mb-0.5">Rol</p>
          <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)} className="campo-input w-40 text-xs">
            <option value="">Todos los roles</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
        </div>
        <div>
          <p className="campo-label mb-0.5">Estado</p>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="campo-input w-36 text-xs">
            <option value="">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
        {(filtroRol || filtroEstado) && (
          <button onClick={() => { setFiltroRol(''); setFiltroEstado('') }}
            className="btn-ghost text-xs text-red-400 self-end">
            Limpiar
          </button>
        )}
      </div>
 
      <Tabla columnas={columnas} datos={usuarios}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost" title="Ver detalle">
            <Eye size={14} />
          </button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost" title="Editar">
            <Edit2 size={14} />
          </button>
          <EstadoToggle
            activo={fila.estado}
            onChange={() => toggleEstado.mutate(fila.id)}
            cargando={toggleEstado.isPending}
          />
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })}
            className="btn-ghost hover:text-red-400" title="Eliminar">
            <Trash2 size={14} />
          </button>
        </>)}
      />
 
      <UsuarioForm verificando={verificando} modal={modal} form={form} errores={errores} roles={roles}
        handleChange={handleChange} handleSubmit={handleSubmit}
        cerrarModal={cerrarModal} guardando={guardando} />
      <UsuarioDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle} abrirModal={abrirModal} />
      <UsuarioEliminar modalEliminar={modalEliminar} setModalEliminar={setModalEliminar} eliminar={eliminar} eliminando={eliminando} />
    </div>
  )
}
