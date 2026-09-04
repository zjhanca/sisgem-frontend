import Modal from '@shared/components/Modal'
import ZonaImagen from '@shared/components/ZonaImagen'

export default function CategoriaForm({ modal, form, errores, handleChange, handleSubmit, cerrarModal, guardando }) {
  return (
    <Modal abierto={modal.abierto} onCerrar={cerrarModal} bloquearCierre
      titulo={modal.item ? 'Editar Categoría' : 'Nueva Categoría'}>
      <form onSubmit={handleSubmit} className="space-y-3">

        <div>
          <label className="campo-label">Nombre *</label>
          <input value={form.nombre} onChange={e => handleChange('nombre', e.target.value)}
            className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`}
            placeholder="Nombre de la categoría" maxLength={100} />
          {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
        </div>

        <div>
          <label className="campo-label">Ícono de categoría</label>
          <ZonaImagen
            valor={form.icono}
            onChange={val => handleChange('icono', val)}
            placeholder="O pegar URL del ícono..."
            circular
          />
        </div>

        <div>
          <label className="campo-label">Descripción</label>
          <textarea value={form.descripcion} onChange={e => handleChange('descripcion', e.target.value)}
            rows={2} className="campo-input resize-none" placeholder="Descripción de la categoría" maxLength={200} />
          <p className="campo-hint text-right">{(form.descripcion || '').length}/200</p>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button type="submit" disabled={guardando} className="btn-primary disabled:opacity-50">
            {guardando ? 'Guardando...' : 'Aceptar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}