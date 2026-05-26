import { Plus, Edit2, Eye, Trash2 } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import EstadoToggle from '@shared/components/EstadoToggle'
import { useCategorias } from '../hooks/useCategorias'
import CategoriaForm     from '../components/CategoriaForm'
import CategoriaDetalle  from '../components/CategoriaDetalle'
import CategoriaEliminar from '../components/CategoriaEliminar'
import { formatFecha } from '@shared/utils/validaciones'
 
export default function Categorias() {
  const {
    categorias,
    form, errores, handleChange, handleSubmit,
    modal, modalDetalle, modalEliminar,
    setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal,
    toggleEstado, eliminar,
    guardando, eliminando,
  } = useCategorias()
 
  const columnas = [
    { key: 'nombre',      label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción', render: r => r.descripcion || '—' },
    { key: 'created_at',  label: 'Creada',      render: r => formatFecha(r.created_at) },
    { key: 'estado',      label: 'Estado',
      render: r => (
        <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>
          {r.estado ? 'Activa' : 'Inactiva'}
        </span>
      )
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
 
      <Tabla
        columnas={columnas}
        datos={categorias}
        acciones={fila => (<>
          <button
            onClick={() => setModalDetalle({ abierto: true, item: fila })}
            className="btn-ghost" title="Ver detalle">
            <Eye size={14} />
          </button>
          <button
            onClick={() => abrirModal(fila)}
            className="btn-ghost" title="Editar">
            <Edit2 size={14} />
          </button>
          <EstadoToggle activo={fila.estado} onChange={() => toggleEstado.mutate(fila.id)} cargando={toggleEstado.isPending} />
          <button
            onClick={() => setModalEliminar({ abierto: true, item: fila })}
            className="btn-ghost hover:text-red-400" title="Eliminar">
            <Trash2 size={14} />
          </button>
        </>)}
      />
 
      <CategoriaForm
        modal={modal}
        form={form}
        errores={errores}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        cerrarModal={cerrarModal}
        guardando={guardando}
      />
 
      <CategoriaDetalle
        modalDetalle={modalDetalle}
        setModalDetalle={setModalDetalle}
        abrirModal={abrirModal}
        toggleEstado={toggleEstado}
      />
 
      <CategoriaEliminar
        modalEliminar={modalEliminar}
        setModalEliminar={setModalEliminar}
        eliminar={eliminar}
        eliminando={eliminando}
      />
    </div>
  )
}
