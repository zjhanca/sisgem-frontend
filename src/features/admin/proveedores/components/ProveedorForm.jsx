import Modal from '@shared/components/Modal'
import { Loader2, CheckCircle2 } from 'lucide-react'

function CampoEstado({ verificando, error, valor, valido }) {
  if (verificando) return <span className="campo-hint flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Verificando...</span>
  if (error)  return <p className="campo-error">{error}</p>
  if (valido && valor) return <span className="campo-success"><CheckCircle2 size={10} /> Disponible</span>
  return null
}

export default function ProveedorForm({ modal, form, errores, verificando = {}, handleChange, handleSubmit, cerrarModal, guardando }) {
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

          {/* documento con verificación */}
          <div>
            <label className="campo-label">Documento *</label>
            <div className="relative">
              <input
                value={form.documento}
                onChange={e => handleChange('documento', e.target.value)}
                className={`campo-input pr-7 ${errores.documento ? 'border-red-400' : (!errores.documento && form.documento && !verificando.documento ? 'border-primary/40' : '')}`}
                placeholder="Ej: 900123456"
              />
              {verificando.documento && <Loader2 size={12} className="absolute right-2.5 top-2.5 text-gray-400 animate-spin" />}
            </div>
            <CampoEstado
              verificando={verificando.documento}
              error={errores.documento}
              valor={form.documento}
              valido={!errores.documento && form.documento?.trim().length >= 4}
            />
          </div>

          <div>
            <label className="campo-label">Contacto</label>
            <input value={form.contacto} onChange={e => handleChange('contacto', e.target.value)}
              className="campo-input" placeholder="Nombre del contacto" />
          </div>

          <div className="col-span-2">
            <label className="campo-label">Razón Social *</label>
            <input
              value={form.nombre}
              onChange={e => handleChange('nombre', e.target.value)}
              className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`}
              placeholder="Nombre o razón social"
            />
            {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
          </div>

          <div>
            <label className="campo-label">Teléfono</label>
            <input
              value={form.telefono}
              onChange={e => handleChange('telefono', e.target.value)}
              className={`campo-input ${errores.telefono ? 'border-red-400' : ''}`}
              placeholder="Ej: 3001234567"
              inputMode="numeric"
            />
            {errores.telefono && <p className="campo-error">{errores.telefono}</p>}
          </div>

          {/* email con verificación */}
          <div>
            <label className="campo-label">Correo</label>
            <div className="relative">
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                className={`campo-input pr-7 ${errores.email ? 'border-red-400' : (!errores.email && form.email && !verificando.email ? 'border-primary/40' : '')}`}
                placeholder="correo@ejemplo.com"
              />
              {verificando.email && <Loader2 size={12} className="absolute right-2.5 top-2.5 text-gray-400 animate-spin" />}
            </div>
            <CampoEstado
              verificando={verificando.email}
              error={errores.email}
              valor={form.email}
              valido={!errores.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)}
            />
          </div>

          <div className="col-span-2">
            <label className="campo-label">Dirección</label>
            <input value={form.direccion} onChange={e => handleChange('direccion', e.target.value)}
              className="campo-input" placeholder="Dirección del proveedor" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
          <button type="button" onClick={cerrarModal}
            className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">
            Cancelar
          </button>
          <button type="submit"
            disabled={guardando || Object.values(verificando).some(Boolean)}
            className="btn-primary disabled:opacity-50">
            {guardando ? 'Guardando...' : 'Aceptar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}