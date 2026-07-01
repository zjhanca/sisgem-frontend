import { useState } from 'react'
import { Plus, Edit2, Eye, Trash2, Download } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import { useProveedores } from '../hooks/useProveedores'
import ProveedorForm            from '../components/ProveedorForm'
import ProveedorDetalle         from '../components/ProveedorDetalle'
import ProveedorEliminar        from '../components/ProveedorEliminar'
import ProveedorConfirmEstado   from '../components/Proveedorconfirmestado'
import ProveedorConfirmDescarga from '../components/Proveedorconfirmdescarga'

function SwitchEstado({ activo, onClick, labelActivo = 'Activo', labelInactivo = 'Inactivo' }) {
  return (
    <button type="button" onClick={e => { e.stopPropagation(); onClick() }}
      className={`inline-flex items-center h-6 rounded-full px-1 transition-colors duration-200 cursor-pointer w-24 relative ${
        activo ? 'bg-primary' : 'bg-gray-300'
      }`}>
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

export default function Proveedores() {
  const {
    proveedores, form, errores,
    modal, modalDetalle, modalEliminar,
    setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal, handleChange, handleSubmit,
    toggleEstado, eliminar, guardando, eliminando, verificando,
  } = useProveedores()

  const [confirmToggle, setConfirmToggle] = useState(null)
  const [confirmDescarga, setConfirmDescarga] = useState(false)

  const columnas = [
    { key: 'nombre',         label: 'Nombre' },
    { key: 'tipo_documento', label: 'Tipo Doc' },
    { key: 'documento',      label: 'Documento' },
    { key: 'telefono',       label: 'Teléfono', render: r => r.telefono || '—' },
    { key: 'email',          label: 'Correo',   render: r => r.email    || '—' },
    { key: 'estado', label: 'Estado',
      render: r => <SwitchEstado activo={r.estado} labelActivo="Activo" labelInactivo="Inactivo"
        onClick={() => setConfirmToggle({ id: r.id, nombre: r.nombre, estadoActual: r.estado })} />
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Proveedores</h1>
        <div className="flex gap-2">
          <button onClick={() => setConfirmDescarga(true)} className="btn-outline">
            <Download size={14} /> Reporte
          </button>
          <button onClick={() => abrirModal()} className="btn-primary"><Plus size={14} /> Nuevo </button>
        </div>
      </div>

      <Tabla columnas={columnas} datos={proveedores}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost"><Edit2 size={14} /></button>
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })} className="btn-ghost hover:text-red-400"><Trash2 size={14} /></button>
        </>)}
      />

      <ProveedorForm modal={modal} form={form} errores={errores}
        handleChange={handleChange} handleSubmit={handleSubmit} cerrarModal={cerrarModal}
        guardando={guardando} verificando={verificando} />
      <ProveedorDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle}
        abrirModal={abrirModal} toggleEstado={toggleEstado} />
      <ProveedorEliminar modalEliminar={modalEliminar} setModalEliminar={setModalEliminar}
        eliminar={eliminar} eliminando={eliminando} />
      <ProveedorConfirmEstado confirmToggle={confirmToggle} setConfirmToggle={setConfirmToggle} toggleEstado={toggleEstado} />
      <ProveedorConfirmDescarga abierto={confirmDescarga} setAbierto={setConfirmDescarga} />
    </div>
  )
}