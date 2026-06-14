import { useState } from 'react'
import { Plus, Edit2, Eye, Trash2, Percent } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
import { useCategorias } from '../hooks/useCategorias'
import CategoriaForm     from '../components/CategoriaForm'
import CategoriaDetalle  from '../components/CategoriaDetalle'
import CategoriaEliminar from '../components/CategoriaEliminar'
import CategoriaMargen   from '../components/CategoriaMargen'
import { formatFecha } from '@shared/utils/validaciones'

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


export default function Categorias() {
  const {
    categorias, form, errores, handleChange, handleSubmit,
    modal, modalDetalle, modalEliminar,
    setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal,
    toggleEstado, eliminar, actualizarMargen,
    guardando, eliminando,
  } = useCategorias()

  const [modalMargen, setModalMargen]     = useState({ abierto: false, item: null })
  const [confirmToggle, setConfirmToggle] = useState(null)

  const columnas = [
    { key: 'nombre',      label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción', render: r => r.descripcion || '—' },
    { key: 'margen',      label: 'Margen %', render: r => `${r.margen ?? 45}%` },
    { key: 'created_at',  label: 'Creada', render: r => formatFecha(r.created_at) },
        { key: 'estado', label: 'Estado',
      render: r => <SwitchEstado activo={r.estado} labelActivo="Activa" labelInactivo="Inactiva"
        onClick={() => setConfirmToggle({ id: r.id, nombre: r.nombre, estadoActual: r.estado })} />
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Categorías</h1>
        <button onClick={() => abrirModal()} className="btn-primary">
          <Plus size={14} /> Nueva Categoría
        </button>
      </div>

      <Tabla columnas={columnas} datos={categorias}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost" title="Ver detalle"><Eye size={14} /></button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost" title="Editar"><Edit2 size={14} /></button>
          <button onClick={() => setModalMargen({ abierto: true, item: fila })} className="btn-ghost" title="Cambiar margen"><Percent size={14} /></button>
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })} className="btn-ghost hover:text-red-400" title="Eliminar"><Trash2 size={14} /></button>
        </>)}
      />

      <CategoriaForm modal={modal} form={form} errores={errores}
        handleChange={handleChange} handleSubmit={handleSubmit}
        cerrarModal={cerrarModal} guardando={guardando} />
      <CategoriaDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle}
        abrirModal={abrirModal} toggleEstado={toggleEstado} />
      <CategoriaEliminar modalEliminar={modalEliminar} setModalEliminar={setModalEliminar}
        eliminar={eliminar} eliminando={eliminando} />
      <CategoriaMargen modalMargen={modalMargen} setModalMargen={setModalMargen}
        actualizarMargen={actualizarMargen} />

      {/* confirm toggle */}
      <Modal abierto={!!confirmToggle} onCerrar={() => setConfirmToggle(null)} bloquearCierre
        titulo={confirmToggle?.estadoActual ? 'Desactivar Categoría' : 'Activar Categoría'} ancho="max-w-sm">
        {confirmToggle && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              ¿Estás seguro que deseas <span className="font-semibold text-light-text">{confirmToggle.estadoActual ? 'desactivar' : 'activar'}</span> la categoría{' '}
              <span className="font-semibold text-primary">{confirmToggle.nombre}</span>?
            </p>
            <div className="flex justify-end pt-2 border-t border-gray-100">
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