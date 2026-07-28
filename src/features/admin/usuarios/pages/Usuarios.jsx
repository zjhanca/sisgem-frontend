import { useState } from 'react'
import { Plus, Edit2, Eye, Trash2 } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import { useUsuarios } from '../hooks/useUsuarios'
import UsuarioForm          from '../components/UsuarioForm'
import UsuarioDetalle       from '../components/UsuarioDetalle'
import UsuarioEliminar      from '../components/UsuarioEliminar'
import UsuarioConfirmEstado from '../components/Usuarioconfirmestado'

function SwitchEstado({ activo, onClick, labelActivo = 'Activo', labelInactivo = 'Inactivo', disabled = false }) {
  return (
    <button type="button" disabled={disabled}
      onClick={e => { e.stopPropagation(); if (!disabled) onClick() }}
      title={disabled ? 'No se puede desactivar al administrador' : undefined}
      className={`inline-flex items-center h-6 rounded-full px-1 transition-colors duration-200 w-24 relative ${
        activo ? 'bg-primary' : 'bg-gray-300'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
      <span className={`absolute inline-block w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${
        activo ? 'left-1' : 'left-[calc(100%-1.25rem)]'
      }`} />
      <span className={`w-full text-center text-xs font-semibold transition-all duration-200 ${
        activo ? 'pl-5 text-white' : 'pr-5 text-white/80'
      }`}>
        {activo ? labelActivo : labelInactivo}
      </span>
    </button>
  )
}

const esAdmin = usuario => usuario?.rol?.toLowerCase().includes('admin')

export default function Usuarios() {
  const {
    usuarios, roles, form, errores,
    modal, modalDetalle, modalEliminar,
    setModalDetalle, setModalEliminar,
    filtroRol, setFiltroRol, filtroEstado, setFiltroEstado,
    abrirModal, cerrarModal, handleChange, handleSubmit,
    toggleEstado, eliminar, guardando, eliminando, verificando,
  } = useUsuarios()

  const [confirmToggle, setConfirmToggle] = useState(null)

  const columnas = [
    { key: 'nombre',   label: 'Nombre', render: r => `${r.nombre} ${r.apellido}` },
    { key: 'numero_documento', label: 'Documento',
      render: r => r.numero_documento ? `${r.tipo_documento}: ${r.numero_documento}` : '—' },
    { key: 'email',  label: 'Correo' },
    { key: 'rol',    label: 'Rol' },
    { key: 'estado', label: 'Estado',
      render: r => <SwitchEstado activo={r.estado} labelActivo="Activo" labelInactivo="Inactivo"
        disabled={esAdmin(r)}
        onClick={() => setConfirmToggle({ id: r.id, nombre: `${r.nombre} ${r.apellido}`, estadoActual: r.estado })} />
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Usuarios</h1>
        <button onClick={() => abrirModal()} className="btn-primary"><Plus size={14} /> Nuevo </button>
      </div>

      <Tabla columnas={columnas} datos={usuarios}
        filtros={<>
          <select value={filtroRol} onChange={e => setFiltroRol(e.target.value)} className="campo-input w-40 text-xs">
            <option value="">Todos los roles</option>
            {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="campo-input w-36 text-xs">
            <option value="">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
          {(filtroRol || filtroEstado) && (
            <button onClick={() => { setFiltroRol(''); setFiltroEstado('') }}
              className="btn-ghost text-xs text-red-400">Limpiar</button>
          )}
        </>}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost" title="Ver detalle">
            <Eye size={14} />
          </button>
          <button onClick={() => abrirModal(fila)} disabled={esAdmin(fila)}
            className={`btn-ghost ${esAdmin(fila) ? 'opacity-30 cursor-not-allowed' : ''}`}
            title={esAdmin(fila) ? 'No se puede editar al administrador' : 'Editar'}>
            <Edit2 size={14} />
          </button>
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })} disabled={esAdmin(fila)}
            className={`btn-ghost ${esAdmin(fila) ? 'opacity-30 cursor-not-allowed' : 'hover:text-red-400'}`}
            title={esAdmin(fila) ? 'No se puede eliminar al administrador' : 'Eliminar'}>
            <Trash2 size={14} />
          </button>
        </>)}
      />

      <UsuarioForm verificando={verificando} modal={modal} form={form} errores={errores} roles={roles}
        handleChange={handleChange} handleSubmit={handleSubmit}
        cerrarModal={cerrarModal} guardando={guardando} />
      <UsuarioDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle} abrirModal={abrirModal} />
      <UsuarioEliminar modalEliminar={modalEliminar} setModalEliminar={setModalEliminar} eliminar={eliminar} eliminando={eliminando} />
      <UsuarioConfirmEstado confirmToggle={confirmToggle} setConfirmToggle={setConfirmToggle} toggleEstado={toggleEstado} />
    </div>
  )
}