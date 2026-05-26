import Modal from '@shared/components/Modal'
import { Loader2, CheckCircle2 } from 'lucide-react'
 
function CampoEstado({ verificando, error, valor, validado }) {
  if (verificando) return <span className="campo-hint flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Verificando...</span>
  if (error)  return <p className="campo-error">{error}</p>
  if (validado && valor) return <span className="campo-success"><CheckCircle2 size={10} /> Disponible</span>
  return null
}
 
export default function UsuarioForm({ modal, form, errores, verificando = {}, handleChange, handleSubmit, cerrarModal, guardando, roles }) {
  return (
    <Modal abierto={modal.abierto} onCerrar={cerrarModal}
      titulo={modal.item ? 'Editar Usuario' : 'Nuevo Usuario'}>
      <form onSubmit={handleSubmit} className="space-y-4">
 
        {/* datos personales */}
        <div>
          <p className="section-title">Datos Personales</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="campo-label">Nombre *</label>
              <input value={form.nombre} onChange={e => handleChange('nombre', e.target.value)}
                className={`campo-input ${errores.nombre ? 'error' : ''}`}
                placeholder="Nombre" />
              {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
            </div>
            <div>
              <label className="campo-label">Apellido *</label>
              <input value={form.apellido} onChange={e => handleChange('apellido', e.target.value)}
                className={`campo-input ${errores.apellido ? 'error' : ''}`}
                placeholder="Apellido" />
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
              <div className="relative">
                <input value={form.numero_documento} onChange={e => handleChange('numero_documento', e.target.value)}
                  className={`campo-input pr-7 ${errores.numero_documento ? 'error' : (!errores.numero_documento && form.numero_documento && !verificando.numero_documento) ? 'success' : ''}`}
                  placeholder="Solo números" inputMode="numeric" maxLength={15} />
                {verificando.numero_documento && <Loader2 size={12} className="absolute right-2.5 top-2.5 text-gray-400 animate-spin" />}
              </div>
              <CampoEstado
                verificando={verificando.numero_documento}
                error={errores.numero_documento}
                valor={form.numero_documento}
                validado={!errores.numero_documento && form.numero_documento?.length >= 5}
              />
            </div>
            <div>
              <label className="campo-label">Teléfono (10 dígitos)</label>
              <input value={form.telefono} onChange={e => handleChange('telefono', e.target.value)}
                className={`campo-input ${errores.telefono ? 'error' : ''}`}
                placeholder="3001234567" inputMode="numeric" maxLength={10} />
              {errores.telefono && <p className="campo-error">{errores.telefono}</p>}
              {!errores.telefono && form.telefono?.length === 10 && (
                <span className="campo-success"><CheckCircle2 size={10} /> Válido</span>
              )}
            </div>
            <div>
              <label className="campo-label">Rol *</label>
              <select value={form.rol_id} onChange={e => handleChange('rol_id', e.target.value)}
                className={`campo-input ${errores.rol_id ? 'error' : ''}`}>
                <option value="">Seleccionar rol...</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              {errores.rol_id && <p className="campo-error">{errores.rol_id}</p>}
            </div>
          </div>
        </div>
 
        {/* acceso */}
        <div>
          <p className="section-title">Datos de Acceso</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="campo-label">Correo *</label>
              <div className="relative">
                <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)}
                  className={`campo-input pr-7 ${errores.email ? 'error' : (!errores.email && form.email && !verificando.email) ? 'success' : ''}`}
                  placeholder="correo@ejemplo.com" />
                {verificando.email && <Loader2 size={12} className="absolute right-2.5 top-2.5 text-gray-400 animate-spin" />}
              </div>
              <CampoEstado
                verificando={verificando.email}
                error={errores.email}
                valor={form.email}
                validado={!errores.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)}
              />
            </div>
            <div className="col-span-2">
              <label className="campo-label">{modal.item ? 'Nueva Contraseña' : 'Contraseña *'}</label>
              <input type="password" value={form.password} onChange={e => handleChange('password', e.target.value)}
                className={`campo-input ${errores.password ? 'error' : ''}`}
                placeholder={modal.item ? 'Dejar vacío para no cambiar' : 'Mínimo 6 caracteres'} />
              {errores.password && <p className="campo-error">{errores.password}</p>}
            </div>
          </div>
        </div>
 
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-dark-border/60">
          <button type="button" onClick={cerrarModal}
            className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={guardando || Object.values(verificando).some(Boolean)} className="btn-primary">
            {guardando ? <><Loader2 size={13} className="animate-spin" /> Guardando...</> : 'Aceptar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
