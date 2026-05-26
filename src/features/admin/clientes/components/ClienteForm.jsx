import Modal from '@shared/components/Modal'
import { Loader2, CheckCircle2 } from 'lucide-react'
 
function CampoEstado({ verificando, error, valor, validado }) {
  if (verificando) return <span className="campo-hint flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Verificando...</span>
  if (error)  return <p className="campo-error">{error}</p>
  if (validado && valor) return <span className="campo-success"><CheckCircle2 size={10} /> Disponible</span>
  return null
}
 
export default function ClienteForm({ modal, form, errores, verificando = {}, handleChange, handleSubmit, cerrarModal, guardando }) {
  return (
    <Modal abierto={modal.abierto} onCerrar={cerrarModal}
      titulo={modal.item ? 'Editar Cliente' : 'Nuevo Cliente'}>
      <form onSubmit={handleSubmit} className="space-y-4">
 
        {/* datos personales */}
        <div>
          <p className="section-title">Datos Personales</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="campo-label">Nombre *</label>
              <input value={form.nombre} onChange={e => handleChange('nombre', e.target.value)}
                className={`campo-input ${errores.nombre ? 'error' : ''}`} placeholder="Nombre" />
              {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
            </div>
            <div>
              <label className="campo-label">Apellido *</label>
              <input value={form.apellido} onChange={e => handleChange('apellido', e.target.value)}
                className={`campo-input ${errores.apellido ? 'error' : ''}`} placeholder="Apellido" />
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
              <label className="campo-label">Correo</label>
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
            <div>
              <label className="campo-label">Teléfono (10 dígitos)</label>
              <input value={form.telefono} onChange={e => handleChange('telefono', e.target.value)}
                className={`campo-input ${errores.telefono ? 'error' : (!errores.telefono && form.telefono?.length === 10) ? 'success' : ''}`}
                placeholder="3001234567" inputMode="numeric" maxLength={10} />
              {errores.telefono
                ? <p className="campo-error">{errores.telefono}</p>
                : form.telefono?.length === 10 && <span className="campo-success"><CheckCircle2 size={10} /> Válido</span>
              }
            </div>
          </div>
        </div>
 
        {/* fiado */}
        <div className="p-3.5 rounded-xl border border-gray-200 dark:border-dark-border/70 space-y-3 bg-light-bg/50 dark:bg-dark-bg/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-light-text dark:text-dark-text">Habilitar Fiado</p>
              <p className="text-xs text-gray-400 dark:text-dark-text/40 mt-0.5">Permite compras a crédito</p>
            </div>
            <button type="button"
              onClick={() => handleChange('permite_fiado', !form.permite_fiado)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
                form.permite_fiado ? 'bg-primary' : 'bg-gray-300 dark:bg-dark-border'
              }`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                form.permite_fiado ? 'translate-x-4' : 'translate-x-1'
              }`} />
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
