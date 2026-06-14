import { useState } from 'react'
import { Plus, Edit2, Eye, Trash2, Download } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
import { descargarPDF } from '@shared/utils/reportes'
import { useProveedores } from '../hooks/useProveedores'
import ProveedorForm     from '../components/ProveedorForm'
import ProveedorDetalle  from '../components/ProveedorDetalle'
import ProveedorEliminar from '../components/ProveedorEliminar'

function SwitchEstado({ activo, onClick, labelActivo = 'Activo', labelInactivo = 'Inactivo' }) {
  return (
    <button type="button" onClick={e => { e.stopPropagation(); onClick() }}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium transition-colors cursor-pointer ${
        activo ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20' : 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200'
      }`}>
      <span className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors shrink-0 ${activo ? 'bg-primary' : 'bg-gray-300'}`}>
        <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform ${activo ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
      </span>
      {activo ? labelActivo : labelInactivo}
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
          <button onClick={() => descargarPDF('/reportes/proveedores', 'reporte-proveedores.pdf')} className="btn-outline">
            <Download size={14} /> Reporte
          </button>
          <button onClick={() => abrirModal()} className="btn-primary"><Plus size={14} /> Nuevo Proveedor</button>
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

      <Modal abierto={!!confirmToggle} onCerrar={() => setConfirmToggle(null)} bloquearCierre
        titulo={confirmToggle?.estadoActual ? 'Desactivar Proveedor' : 'Activar Proveedor'} ancho="max-w-sm">
        {confirmToggle && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              ¿Estás seguro que deseas <span className="font-semibold text-light-text">{confirmToggle.estadoActual ? 'desactivar' : 'activar'}</span> al proveedor{' '}
              <span className="font-semibold text-primary">{confirmToggle.nombre}</span>?
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button onClick={() => { toggleEstado.mutate(confirmToggle.id); setConfirmToggle(null) }}
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