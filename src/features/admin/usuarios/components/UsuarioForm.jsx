import Modal from '@shared/components/Modal'
import { Loader2, CheckCircle2, Lock } from 'lucide-react'

function CampoEstado({ verificando, error, valor, validado }) {
  if (verificando) return <span className="campo-hint flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Verificando...</span>
  if (error) return <p className="campo-error">{error}</p>
  if (validado && valor) return <span className="campo-success flex items-center gap-1"><CheckCircle2 size={10} /> Disponible</span>
  return null
}

export default function UsuarioForm({ modal, form, errores, verificando = {}, handleChange, handleSubmit, cerrarModal, guardando, roles }) {
  const docVerificado = !errores.numero_documento && form.numero_documento?.length >= 5 && !verificando.numero_documento
  const bloqueado = !docVerificado

  return (
    <Modal abierto={modal.abierto} onCerrar={cerrarModal} bloquearCierre titulo={modal.item ? 'Editar Usuario' : 'Nuevo Usuario'}>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* identificación primero */}
        <div>
          <p className="section-title">Identificación</p>
          <div className="grid grid-cols-2 gap-3">
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
              <label className="campo-label">Número Documento *</label>
              <div className="relative">
                <input value={form.numero_documento} onChange={e => handleChange('numero_documento', e.target.value)}
                  className={`campo-input pr-7 ${errores.numero_documento ? 'border-red-400' : (docVerificado ? 'border-primary' : '')}`}
                  placeholder="Solo números" inputMode="numeric" maxLength={15} />
                {verificando.numero_documento
                  ? <Loader2 size={12} className="absolute right-2.5 top-2.5 text-gray-400 animate-spin" />
                  : docVerificado
                    ? <CheckCircle2 size={12} className="absolute right-2.5 top-2.5 text-primary" />
                    : null
                }
              </div>
              <CampoEstado verificando={verificando.numero_documento} error={errores.numero_documento}
                valor={form.numero_documento} validado={docVerificado} />
              {!form.numero_documento && <p className="campo-hint">Ingresa el documento para continuar</p>}
            </div>
          </div>
        </div>

        {/* datos personales bloqueados */}
        <div className={`space-y-3 transition-opacity duration-200 ${bloqueado ? 'opacity-40 pointer-events-none select-none' : ''}`}>
          <p className="section-title flex items-center gap-1">
            Datos Personales {bloqueado && <Lock size={10} className="text-gray-400" />}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="campo-label">Nombre *</label>
              <input value={form.nombre} onChange={e => handleChange('nombre', e.target.value)}
                disabled={bloqueado}
                className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`} placeholder="Nombre" />
              {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
            </div>
            <div>
              <label className="campo-label">Apellido *</label>
              <input value={form.apellido} onChange={e => handleChange('apellido', e.target.value)}
                disabled={bloqueado}
                className={`campo-input ${errores.apellido ? 'border-red-400' : ''}`} placeholder="Apellido" />
              {errores.apellido && <p className="campo-error">{errores.apellido}</p>}
            </div>
            <div>
              <label className="campo-label">Teléfono (10 dígitos)</label>
              <input value={form.telefono} onChange={e => handleChange('telefono', e.target.value)}
                disabled={bloqueado}
                className={`campo-input ${errores.telefono ? 'border-red-400' : ''}`}
                placeholder="3001234567" inputMode="numeric" maxLength={10} />
              {errores.telefono && <p className="campo-error">{errores.telefono}</p>}
            </div>
            <div>
              <label className="campo-label">Rol *</label>
              <select value={form.rol_id} onChange={e => handleChange('rol_id', e.target.value)}
                disabled={bloqueado}
                className={`campo-input ${errores.rol_id ? 'border-red-400' : ''}`}>
                <option value="">Seleccionar rol...</option>
                {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </select>
              {errores.rol_id && <p className="campo-error">{errores.rol_id}</p>}
            </div>
          </div>
        </div>

        {/* acceso */}
        <div className={`space-y-3 transition-opacity duration-200 ${bloqueado ? 'opacity-40 pointer-events-none select-none' : ''}`}>
          <p className="section-title flex items-center gap-1">
            Datos de Acceso {bloqueado && <Lock size={10} className="text-gray-400" />}
          </p>
          <div>
            <label className="campo-label">Correo *</label>
            <div className="relative">
              <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)}
                disabled={bloqueado}
                className={`campo-input pr-7 ${errores.email ? 'border-red-400' : (!errores.email && form.email && !verificando.email ? 'border-primary/40' : '')}`}
                placeholder="correo@ejemplo.com" />
              {verificando.email && <Loader2 size={12} className="absolute right-2.5 top-2.5 text-gray-400 animate-spin" />}
            </div>
            <CampoEstado verificando={verificando.email} error={errores.email}
              valor={form.email} validado={!errores.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)} />
          </div>
          {!modal.item && (
            <div className="p-3 rounded-lg bg-primary/8 border border-primary/20 text-xs text-primary">
              Se generará una contraseña automática y se enviará al correo del usuario.
            </div>
          )}
          {modal.item && (
            <div>
              <label className="campo-label">Nueva Contraseña <span className="text-gray-400 font-normal">(opcional)</span></label>
              <input type="password" value={form.password} onChange={e => handleChange('password', e.target.value)}
                disabled={bloqueado}
                className={`campo-input ${errores.password ? 'border-red-400' : ''}`}
                placeholder="Dejar vacío para no cambiar" />
              {errores.password && <p className="campo-error">{errores.password}</p>}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button type="submit" disabled={guardando || Object.values(verificando).some(Boolean) || bloqueado} className="btn-primary disabled:opacity-50">
            {guardando ? <><Loader2 size={13} className="animate-spin" /> Guardando...</> : 'Aceptar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}