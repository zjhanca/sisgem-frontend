import Modal from '@shared/components/Modal'
import { Loader2, CheckCircle2, Lock } from 'lucide-react'

function CampoEstado({ verificando, error, valor, validado }) {
  if (verificando) return <span className="campo-hint flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Verificando...</span>
  if (error) return <p className="campo-error">{error}</p>
  if (validado && valor) return <span className="campo-success flex items-center gap-1"><CheckCircle2 size={10} /> Disponible</span>
  return null
}

export default function ClienteForm({ modal, form, errores, verificando = {}, handleChange, handleSubmit, cerrarModal, guardando }) {
  const docVerificado = !errores.numero_documento && form.numero_documento?.length >= 5 && !verificando.numero_documento
  const bloqueado = !docVerificado

  return (
    <Modal abierto={modal.abierto} onCerrar={cerrarModal} bloquearCierre titulo={modal.item ? 'Editar Cliente' : 'Nuevo Cliente'}>
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
                <option value="NIT">NIT</option>
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

        {/* datos personales — bloqueados hasta verificar doc */}
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
              <label className="campo-label">Correo</label>
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
            <div>
              <label className="campo-label">Teléfono (10 dígitos)</label>
              <input value={form.telefono} onChange={e => handleChange('telefono', e.target.value)}
                disabled={bloqueado}
                className={`campo-input ${errores.telefono ? 'border-red-400' : ''}`}
                placeholder="3001234567" inputMode="numeric" maxLength={10} />
              {errores.telefono && <p className="campo-error">{errores.telefono}</p>}
            </div>
          </div>
          {!modal.item && (
            <div className="mt-2 p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary">
              Se generará una contraseña automática y se enviará al correo del cliente.
            </div>
          )}
        </div>

        {/* fiado */}
        <div className={`p-3.5 rounded-xl border border-gray-200 space-y-3 transition-opacity duration-200 ${bloqueado ? 'opacity-40 pointer-events-none select-none' : ''}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-light-text">Habilitar Fiado</p>
              <p className="text-xs text-gray-400 mt-0.5">Permite compras a crédito</p>
            </div>
            <button type="button" disabled={bloqueado}
              onClick={() => handleChange('permite_fiado', !form.permite_fiado)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${form.permite_fiado ? 'bg-primary' : 'bg-gray-300'}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${form.permite_fiado ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          </div>
          {form.permite_fiado && (
            <div className="animate-fadeIn">
              <label className="campo-label">Límite de Fiado (opcional)</label>
              <input type="number" step="0.01" value={form.limite_fiado}
                onChange={e => handleChange('limite_fiado', e.target.value)}
                className="campo-input" placeholder="Ej: 100000 — vacío = sin límite" />
              <p className="campo-hint">Si no se establece, no habrá límite.</p>
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