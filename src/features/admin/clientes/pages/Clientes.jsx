import { useState } from 'react'
import { Plus, Edit2, Eye, Download, Trash2 } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import { useClientes } from '../hooks/useClientes'
import ClienteForm           from '../components/ClienteForm'
import ClienteDetalle        from '../components/ClienteDetalle'
import ClienteEliminar       from '../components/ClienteEliminar'
import ClienteConfirmEstado  from '../components/Clienteconfirmestado'
import ClienteConfirmDescarga from '../components/Clienteconfirmdescarga'

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

export default function Clientes() {
  const {
    clientes, historial, form, errores,
    modal, modalDetalle, filtroEstado, setFiltroEstado,
    setModalDetalle, abrirModal, cerrarModal,
    handleChange, handleSubmit, toggleEstado, guardando, verificando,
    eliminar, eliminando, modalEliminar, setModalEliminar,
  } = useClientes()

  const [confirmToggle, setConfirmToggle] = useState(null)
  const [confirmDescarga, setConfirmDescarga] = useState(false)

  const columnas = [
    { key: 'nombre', label: 'Nombre', render: r => `${r.nombre} ${r.apellido}` },
    { key: 'numero_documento', label: 'Documento',
      render: r => r.numero_documento ? `${r.tipo_documento}: ${r.numero_documento}` : '—' },
    { key: 'email',    label: 'Correo',   render: r => r.email    || '—' },
    { key: 'telefono', label: 'Teléfono', render: r => r.telefono || '—' },
    { key: 'permite_fiado', label: 'Fiado',
      render: r => (
        <span className="inline-block w-20 text-center">
          {r.permite_fiado
            ? <span className="badge-activo">Habilitado</span>
            : <span className="text-xs text-gray-400">—</span>
          }
        </span>
      )
    },
    { key: 'estado', label: 'Estado',
      render: r => <SwitchEstado activo={r.estado} labelActivo="Activo" labelInactivo="Inactivo"
        onClick={() => setConfirmToggle({ id: r.id, nombre: `${r.nombre} ${r.apellido}`, estadoActual: r.estado })} />
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Clientes</h1>
        <div className="flex gap-2">
          <button onClick={() => setConfirmDescarga(true)} className="btn-outline">
            <Download size={14} /> Reporte
          </button>
          <button onClick={() => abrirModal()} className="btn-primary">
            <Plus size={14} /> Nuevo Cliente
          </button>
        </div>
      </div>

      <Tabla columnas={columnas} datos={clientes}
        filtros={<>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="campo-input w-36 text-xs">
            <option value="">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
          {filtroEstado && (
            <button onClick={() => setFiltroEstado('')} className="btn-ghost text-xs text-red-400">Limpiar</button>
          )}
        </>}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost" title="Ver detalle">
            <Eye size={14} />
          </button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost" title="Editar">
            <Edit2 size={14} />
          </button>
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })} className="btn-ghost hover:text-red-400" title="Eliminar">
            <Trash2 size={14} />
          </button>
        </>)}
      />

      <ClienteForm verificando={verificando} modal={modal} form={form} errores={errores}
        handleChange={handleChange} handleSubmit={handleSubmit}
        cerrarModal={cerrarModal} guardando={guardando} />
      <ClienteDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle}
        abrirModal={abrirModal} historial={historial} />
      <ClienteEliminar modalEliminar={modalEliminar} setModalEliminar={setModalEliminar}
        eliminar={eliminar} eliminando={eliminando} />
      <ClienteConfirmEstado confirmToggle={confirmToggle} setConfirmToggle={setConfirmToggle}
        toggleEstado={toggleEstado} />
      <ClienteConfirmDescarga abierto={confirmDescarga} setAbierto={setConfirmDescarga} />
    </div>
  )
}