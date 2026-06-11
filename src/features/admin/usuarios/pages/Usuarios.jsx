import { useState } from 'react'
import { Plus, Edit2, Eye, Trash2 } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
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

  const [confirmToggle, setConfirmToggle] = useState(null)

  const columnas = [
    { key: 'nombre',   label: 'Nombre', render: r => `${r.nombre} ${r.apellido}` },
    { key: 'numero_documento', label: 'Documento',
      render: r => r.numero_documento ? `${r.tipo_documento}: ${r.numero_documento}` : '—' },
    { key: 'email',  label: 'Correo' },
    { key: 'rol',    label: 'Rol' },
    { key: 'estado', label: 'Estado',
      render: r => (
        <span className="inline-block w-16 text-center">
          <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>
            {r.estado ? 'Activo' : 'Inactivo'}
          </span>
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
          <button onClick={() => abrirModal(fila)} className="btn-ghost" title="Editar">
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => setConfirmToggle({ id: fila.id, nombre: `${fila.nombre} ${fila.apellido}`, estadoActual: fila.estado })}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 shrink-0 ${fila.estado ? 'bg-primary' : 'bg-gray-300'}`}
            title={fila.estado ? 'Desactivar' : 'Activar'}>
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${fila.estado ? 'translate-x-4' : 'translate-x-1'}`} />
          </button>
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

      {/* modal confirmación toggle */}
      <Modal abierto={!!confirmToggle} onCerrar={() => setConfirmToggle(null)}
        titulo={confirmToggle?.estadoActual ? 'Desactivar Usuario' : 'Activar Usuario'} ancho="max-w-sm">
        {confirmToggle && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              ¿Estás seguro que deseas <span className="font-semibold text-light-text">{confirmToggle.estadoActual ? 'desactivar' : 'activar'}</span> al usuario{' '}
              <span className="font-semibold text-primary">{confirmToggle.nombre}</span>?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button onClick={() => setConfirmToggle(null)}
                className="px-4 py-1.5 text-sm border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50">
                No, cancelar
              </button>
              <button
                onClick={() => { toggleEstado.mutate(confirmToggle.id); setConfirmToggle(null) }}
                className={`px-4 py-1.5 text-sm rounded-lg text-white ${confirmToggle.estadoActual ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-mid'}`}>
                Sí, {confirmToggle.estadoActual ? 'desactivar' : 'activar'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}