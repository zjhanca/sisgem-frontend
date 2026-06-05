import Modal from '@shared/components/Modal'

export default function CategoriaForm({
  modal, form, errores,
  handleChange, handleSubmit,
  cerrarModal, guardando
}) {
  return (
    <Modal
      abierto={modal.abierto}
      onCerrar={cerrarModal}
      titulo={modal.item ? 'Editar Categoría' : 'Nueva Categoría'}>
      <form onSubmit={handleSubmit} className="space-y-3">

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="campo-label">Nombre *</label>
            <input
              value={form.nombre}
              onChange={e => handleChange('nombre', e.target.value)}
              className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`}
              placeholder="Nombre de la categoría"
              maxLength={100}
            />
            {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
          </div>

          <div>
            <label className="campo-label">Margen de ganancia (%) *</label>
            <input
              type="number" min="0" max="500" step="0.5"
              value={form.margen ?? ''}
              onChange={e => handleChange('margen', e.target.value)}
              className={`campo-input ${errores.margen ? 'border-red-400' : ''}`}
              placeholder="Ej: 45"
            />
            {errores.margen
              ? <p className="campo-error">{errores.margen}</p>
              : <p className="text-xs text-gray-400 mt-1">Precio = costo × (1 + margen / 100)</p>
            }
          </div>
        </div>

        <div>
          <label className="campo-label">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={e => handleChange('descripcion', e.target.value)}
            rows={3}
            className="campo-input resize-none"
            placeholder="Descripción de la categoría"
            maxLength={500}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
          <button
            type="button"
            onClick={cerrarModal}
            className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border
              text-gray-500 rounded-lg hover:border-primary/40">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="btn-primary">
            {guardando ? 'Guardando...' : 'Aceptar'}
          </button>
        </div>

      </form>
    </Modal>
  )
}