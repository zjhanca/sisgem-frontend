import Modal from '@shared/components/Modal'
 
export default function ProveedorForm({ modal, form, errores, handleChange, handleSubmit, cerrarModal, guardando }) {
  return (
    <Modal abierto={modal.abierto} onCerrar={cerrarModal}
      titulo={modal.item ? 'Editar Proveedor' : 'Nuevo Proveedor'} ancho="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="campo-label">Tipo Persona</label>
            <select value={form.tipo_persona} onChange={e => handleChange('tipo_persona', e.target.value)} className="campo-input">
              <option value="juridica">Jurídica</option>
              <option value="natural">Natural</option>
            </select>
          </div>
          <div>
            <label className="campo-label">Tipo Documento</label>
            <select value={form.tipo_documento} onChange={e => handleChange('tipo_documento', e.target.value)} className="campo-input">
              <option value="NIT">NIT</option>
              <option value="CC">Cédula</option>
              <option value="CE">Cédula Extranjería</option>
            </select>
          </div>
          <div>
            <label className="campo-label">Documento *</label>
            <input value={form.documento} onChange={e => handleChange('documento', e.target.value)}
              className={`campo-input ${errores.documento ? 'border-red-400' : ''}`} placeholder="Ej: 900123456" />
            {errores.documento && <p className="campo-error">{errores.documento}</p>}
          </div>
          <div>
            <label className="campo-label">Contacto</label>
            <input value={form.contacto} onChange={e => handleChange('contacto', e.target.value)}
              className="campo-input" placeholder="Nombre del contacto" />
          </div>
          <div className="col-span-2">
            <label className="campo-label">Razón Social *</label>
            <input value={form.nombre} onChange={e => handleChange('nombre', e.target.value)}
              className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`} placeholder="Nombre o razón social" />
            {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
          </div>
          <div>
            <label className="campo-label">Teléfono</label>
            <input value={form.telefono} onChange={e => handleChange('telefono', e.target.value)}
              className="campo-input" placeholder="Ej: 3001234567" />
          </div>
          <div>
            <label className="campo-label">Correo</label>
            <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)}
              className="campo-input" placeholder="correo@ejemplo.com" />
          </div>
          <div className="col-span-2">
            <label className="campo-label">Dirección</label>
            <input value={form.direccion} onChange={e => handleChange('direccion', e.target.value)}
              className="campo-input" placeholder="Dirección del proveedor" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
          <button type="button" onClick={cerrarModal} className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
          <button type="submit" disabled={guardando} className="btn-primary">{guardando ? 'Guardando...' : 'Aceptar'}</button>
        </div>
      </form>
    </Modal>
  )
}
