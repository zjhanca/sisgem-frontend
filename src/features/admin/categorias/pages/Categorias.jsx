import { useState } from 'react'
import { Plus, Edit2, Eye, Trash2, Percent } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
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
    actualizarMargen,
    guardando, eliminando,
  } = useCategorias()

  const [modalMargen, setModalMargen] = useState({ abierto: false, item: null })
  const [margenInput, setMargenInput] = useState('')

  const abrirMargen = item => {
    setMargenInput(item.margen ?? 45)
    setModalMargen({ abierto: true, item })
  }

  const columnas = [
    { key: 'nombre',      label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción', render: r => r.descripcion || '—' },
    { key: 'margen',      label: 'Margen %', render: r => `${r.margen ?? 45}%` },
    { key: 'created_at',  label: 'Creada', render: r => formatFecha(r.created_at) },
    { key: 'estado', label: 'Estado',
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
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost" title="Ver detalle">
            <Eye size={14} />
          </button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost" title="Editar">
            <Edit2 size={14} />
          </button>
          <button onClick={() => abrirMargen(fila)} className="btn-ghost" title="Cambiar margen">
            <Percent size={14} />
          </button>
          <EstadoToggle activo={fila.estado} onChange={() => toggleEstado.mutate(fila.id)} cargando={toggleEstado.isPending} />
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })} className="btn-ghost hover:text-red-400" title="Eliminar">
            <Trash2 size={14} />
          </button>
        </>)}
      />

      <CategoriaForm
        modal={modal} form={form} errores={errores}
        handleChange={handleChange} handleSubmit={handleSubmit}
        cerrarModal={cerrarModal} guardando={guardando}
      />
      <CategoriaDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle} abrirModal={abrirModal} toggleEstado={toggleEstado} />
      <CategoriaEliminar modalEliminar={modalEliminar} setModalEliminar={setModalEliminar} eliminar={eliminar} eliminando={eliminando} />

      {/* modal margen */}
      <Modal abierto={modalMargen.abierto} onCerrar={() => setModalMargen({ abierto: false, item: null })}
        titulo={`Margen — ${modalMargen.item?.nombre}`} ancho="max-w-xs">
        <div className="space-y-4">
          <p className="text-xs text-gray-400">
            El margen se aplica al costo unitario al completar una orden de compra.<br/>
            Precio venta = costo × (1 + margen / 100)
          </p>
          <div>
            <label className="campo-label">Margen (%)</label>
            <input type="number" min="0" max="500" step="0.5"
              value={margenInput}
              onChange={e => setMargenInput(e.target.value)}
              className="campo-input" placeholder="45" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => setModalMargen({ abierto: false, item: null })}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">
              Cancelar
            </button>
            <button
              onClick={() => {
                actualizarMargen.mutate(
                  { id: modalMargen.item.id, margen: +margenInput },
                  { onSuccess: () => setModalMargen({ abierto: false, item: null }) }
                )
              }}
              disabled={actualizarMargen.isPending}
              className="btn-primary disabled:opacity-50">
              {actualizarMargen.isPending ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}