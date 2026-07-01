import { useState } from 'react'
import { Plus, Edit2, Eye, Trash2 } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import { useCategorias } from '../hooks/useCategorias'
import CategoriaForm          from '../components/CategoriaForm'
import CategoriaDetalle       from '../components/CategoriaDetalle'
import CategoriaEliminar      from '../components/CategoriaEliminar'
import CategoriaConfirmEstado from '../components/Categoriaconfirmestado'
import { formatFecha } from '@shared/utils/validaciones'

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

export default function Categorias() {
  const {
    categorias, form, errores, handleChange, handleSubmit,
    modal, modalDetalle, modalEliminar,
    setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal,
    toggleEstado, eliminar, actualizarMargen,
    guardando, eliminando,
  } = useCategorias()

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
          <Plus size={14} /> Nueva
        </button>
      </div>

      <Tabla columnas={columnas} datos={categorias}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost" title="Ver detalle"><Eye size={14} /></button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost" title="Editar"><Edit2 size={14} /></button>
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
      <CategoriaConfirmEstado confirmToggle={confirmToggle} setConfirmToggle={setConfirmToggle}
        toggleEstado={toggleEstado} />
    </div>
  )
}