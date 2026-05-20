import { Link } from 'react-router-dom'
import { useRegister } from '../Hooks/useRegister'
 
export default function Register() {
  const { form, errores, cargando, handleChange, handleSubmit } = useRegister()
 
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary">SISGEM</h1>
          <p className="text-sm text-gray-500 dark:text-dark-text/60 mt-1">Crear Cuenta Nueva</p>
        </div>
        <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-dark-border">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Datos Personales</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="campo-label">Nombre *</label>
                  <input value={form.nombre} onChange={e => handleChange('nombre', e.target.value)}
                    className={'campo-input ' + (errores.nombre ? 'border-red-400' : '')} placeholder="Tu nombre" />
                  {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
                </div>
                <div>
                  <label className="campo-label">Apellido *</label>
                  <input value={form.apellido} onChange={e => handleChange('apellido', e.target.value)}
                    className={'campo-input ' + (errores.apellido ? 'border-red-400' : '')} placeholder="Tu apellido" />
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
                  <label className="campo-label">Teléfono</label>
                  <input value={form.telefono} onChange={e => handleChange('telefono', e.target.value)}
                    className="campo-input" placeholder="Ej: 3001234567" />
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Ubicación en Medellín</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="campo-label">Dirección</label>
                  <input value={form.direccion} onChange={e => handleChange('direccion', e.target.value)}
                    className="campo-input" placeholder="Ej: Calle 50 # 40-10" />
                </div>
                <div className="col-span-2">
                  <label className="campo-label">Barrio</label>
                  <input value={form.barrio} onChange={e => handleChange('barrio', e.target.value)}
                    className="campo-input" placeholder="Ej: Laureles, El Poblado..." />
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Datos de Acceso</p>
              <div className="space-y-3">
                <div>
                  <label className="campo-label">Correo Electrónico *</label>
                  <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)}
                    className={'campo-input ' + (errores.email ? 'border-red-400' : '')} placeholder="correo@ejemplo.com" />
                  {errores.email && <p className="campo-error">{errores.email}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="campo-label">Contraseña *</label>
                    <input type="password" value={form.password} onChange={e => handleChange('password', e.target.value)}
                      className={'campo-input ' + (errores.password ? 'border-red-400' : '')} placeholder="Mínimo 6 caracteres" />
                    {errores.password && <p className="campo-error">{errores.password}</p>}
                  </div>
                  <div>
                    <label className="campo-label">Confirmar Contraseña *</label>
                    <input type="password" value={form.confirmar} onChange={e => handleChange('confirmar', e.target.value)}
                      className={'campo-input ' + (errores.confirmar ? 'border-red-400' : '')} placeholder="Repetir contraseña" />
                    {errores.confirmar && <p className="campo-error">{errores.confirmar}</p>}
                  </div>
                </div>
              </div>
            </div>
            <button type="submit" disabled={cargando} className="btn-primary w-full justify-center py-2.5 text-sm disabled:opacity-50">
              {cargando ? 'Creando Cuenta...' : 'Crear Cuenta'}
            </button>
            <p className="text-center text-xs text-gray-500 dark:text-dark-text/60">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">Inicia Sesión</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
