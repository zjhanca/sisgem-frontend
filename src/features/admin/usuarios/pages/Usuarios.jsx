import { Plus, Edit2, ToggleLeft, ToggleRight, Eye, Trash2 } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import { useUsuarios } from '../hooks/useUsuarios'
import UsuarioForm    from '../components/UsuarioForm'
import UsuarioDetalle from '../components/UsuarioDetalle'
import UsuarioEliminar from '../components/UsuarioEliminar'
 
export default function Usuarios() {
  const {
    usuarios, roles, form, errores,
    modal, modalDetalle, modalEliminar,
    setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal, handleChange, handleSubmit,
    toggleEstado, eliminar, guardando, eliminando,
  } = useUsuarios()
 
  const columnas = [
    { key: 'nombre',   label: 'Nombre', render: r => `${r.nombre} ${r.apellido}` },
    { key: 'numero_documento', label: 'Documento',
      render: r => r.numero_documento ? `${r.tipo_documento}: ${r.numero_documento}` : '—' },
    { key: 'email',  label: 'Correo' },
    { key: 'rol',    label: 'Rol' },
    { key: 'estado', label: 'Estado',
      render: r => <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>{r.estado ? 'Activo' : 'Inactivo'}</span>
    },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Usuarios</h1>
        <button onClick={() => abrirModal()} className="btn-primary"><Plus size={14} /> Nuevo Usuario</button>
      </div>
 
      <Tabla columnas={columnas} datos={usuarios}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost"><Edit2 size={14} /></button>
          <button onClick={() => toggleEstado.mutate(fila.id)}
            className={`btn-ghost ${fila.estado ? 'hover:text-red-400' : 'hover:text-green-400'}`}>
            {fila.estado ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })} className="btn-ghost hover:text-red-400"><Trash2 size={14} /></button>
        </>)}
      />
 
      <UsuarioForm modal={modal} form={form} errores={errores} roles={roles}
        handleChange={handleChange} handleSubmit={handleSubmit} cerrarModal={cerrarModal} guardando={guardando} />
      <UsuarioDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle} abrirModal={abrirModal} />
      <UsuarioEliminar modalEliminar={modalEliminar} setModalEliminar={setModalEliminar} eliminar={eliminar} eliminando={eliminando} />
    </div>
  )
}
