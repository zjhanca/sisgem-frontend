import Modal from '@shared/components/Modal'
 
export default function UsuarioForm({ modal, form, errores, handleChange, handleSubmit, cerrarModal, guardando, roles }) {
  return (
    <Modal abierto={modal.abierto} onCerrar={cerrarModal}
      titulo={modal.item ? 'Editar Usuario' : 'Nuevo Usuario'}>
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
            </select>
          </div>
          <div>
            <label className="campo-label">Número Documento</label>
            <input value={form.numero_documento} onChange={e => handleChange('numero_documento', e.target.value)}
              className="campo-input" placeholder="Ej: 1234567890" />
          </div>
          <div className="col-span-2">
            <label className="campo-label">Correo *</label>
            <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)}
              className={`campo-input ${errores.email ? 'border-red-400' : ''}`} />
            {errores.email && <p className="campo-error">{errores.email}</p>}
          </div>
          <div>
            <label className="campo-label">{modal.item ? 'Nueva Contraseña' : 'Contraseña *'}</label>
            <input type="password" value={form.password} onChange={e => handleChange('password', e.target.value)}
              className={`campo-input ${errores.password ? 'border-red-400' : ''}`}
              placeholder={modal.item ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'} />
            {errores.password && <p className="campo-error">{errores.password}</p>}
          </div>
          <div>
            <label className="campo-label">Teléfono</label>
            <input value={form.telefono} onChange={e => handleChange('telefono', e.target.value)}
              className="campo-input" placeholder="Ej: 3001234567" />
          </div>
          <div className="col-span-2">
            <label className="campo-label">Rol *</label>
            <select value={form.rol_id} onChange={e => handleChange('rol_id', e.target.value)}
              className={`campo-input ${errores.rol_id ? 'border-red-400' : ''}`}>
              <option value="">Seleccionar rol...</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
            {errores.rol_id && <p className="campo-error">{errores.rol_id}</p>}
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
