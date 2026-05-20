import Modal from '@shared/components/Modal'
 
export default function ClienteForm({ modal, form, errores, handleChange, handleSubmit, cerrarModal, guardando }) {
  return (
    <Modal abierto={modal.abierto} onCerrar={cerrarModal}
      titulo={modal.item ? 'Editar Cliente' : 'Nuevo Cliente'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="campo-label">Nombre *</label>
            <input value={form.nombre} onChange={e => handleChange('nombre', e.target.value)}
              className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`} />
            {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
          </div>
          <div>
            <label className="campo-label">Apellido *</label>
            <input value={form.apellido} onChange={e => handleChange('apellido', e.target.value)}
              className={`campo-input ${errores.apellido ? 'border-red-400' : ''}`} />
            {errores.apellido && <p className="campo-error">{errores.apellido}</p>}
          </div>
          <div>
            <label className="campo-label">Tipo Documento</label>
            <select value={form.tipo_documento} onChange={e => handleChange('tipo_documento', e.target.value)} className="campo-input">
              <option value="CC">Cédula (CC)</option>
              <option value="CE">Cédula Extranjería (CE)</option>
              <option value="TI">Tarjeta Identidad (TI)</option>
              <option value="PA">Pasaporte (PA)</option>
              <option value="NIT">NIT</option>
            </select>
          </div>
          <div>
            <label className="campo-label">Número Documento</label>
            <input value={form.numero_documento} onChange={e => handleChange('numero_documento', e.target.value)}
              className="campo-input" placeholder="Ej: 1234567890" />
          </div>
          <div>
            <label className="campo-label">Correo</label>
            <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)}
              className={`campo-input ${errores.email ? 'border-red-400' : ''}`} placeholder="correo@ejemplo.com" />
            {errores.email && <p className="campo-error">{errores.email}</p>}
          </div>
          <div>
            <label className="campo-label">Teléfono</label>
            <input value={form.telefono} onChange={e => handleChange('telefono', e.target.value)}
              className="campo-input" placeholder="Ej: 3001234567" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
          <button type="button" onClick={cerrarModal}
            className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="btn-primary">
            {guardando ? 'Guardando...' : 'Aceptar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
