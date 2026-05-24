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
              className={`campo-input ${errores.numero_documento ? 'border-red-400' : ''}`}
              placeholder="Solo números" inputMode="numeric" maxLength={15} />
            {errores.numero_documento && <p className="campo-error">{errores.numero_documento}</p>}
          </div>
          <div>
            <label className="campo-label">Correo</label>
            <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)}
              className={`campo-input ${errores.email ? 'border-red-400' : ''}`} placeholder="correo@ejemplo.com" />
            {errores.email && <p className="campo-error">{errores.email}</p>}
          </div>
          <div>
            <label className="campo-label">Teléfono (10 dígitos)</label>
            <input value={form.telefono} onChange={e => handleChange('telefono', e.target.value)}
              className={`campo-input ${errores.telefono ? 'border-red-400' : ''}`}
              placeholder="Ej: 3001234567" inputMode="numeric" maxLength={10} />
            {errores.telefono && <p className="campo-error">{errores.telefono}</p>}
          </div>
        </div>
 
        {/* sección fiado */}
        <div className="p-3 rounded-xl border border-gray-200 dark:border-dark-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-light-text dark:text-dark-text">Habilitar Fiado</p>
              <p className="text-xs text-gray-400">Permite que este cliente compre fiado</p>
            </div>
            <button
              type="button"
              onClick={() => handleChange('permite_fiado', !form.permite_fiado)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                form.permite_fiado ? 'bg-primary' : 'bg-gray-300 dark:bg-dark-border'
              }`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                form.permite_fiado ? 'translate-x-4' : 'translate-x-1'
              }`} />
            </button>
          </div>
          {form.permite_fiado && (
            <div>
              <label className="campo-label">Límite de Fiado (opcional)</label>
              <input
                type="number" step="0.01" value={form.limite_fiado}
                onChange={e => handleChange('limite_fiado', e.target.value)}
                className="campo-input" placeholder="Ej: 100000 — dejar vacío para sin límite" />
              <p className="text-xs text-gray-400 mt-1">Si no se establece, no habrá límite de fiado.</p>
            </div>
          )}
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
 
