import { Link } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle, XCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { useRegister } from '../Hooks/useRegister'

function Logo() {
  return (
    <div className="text-center mb-6">
      <Link to="/" className="inline-flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center overflow-hidden">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain"
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
          <span style={{display:'none'}} className="w-full h-full items-center justify-center text-2xl font-bold text-primary">S</span>
        </div>
        <h1 className="text-2xl font-bold text-primary">Sisgem</h1>
      </Link>
      <p className="text-sm text-gray-500 dark:text-dark-text/60 mt-1">Crear Cuenta Nueva</p>
    </div>
  )
}

function Requisito({ ok, texto }) {
  return (
    <div className={`flex items-center gap-1 text-xs ${ok ? 'text-green-500' : 'text-gray-400'}`}>
      {ok ? <CheckCircle size={10} /> : <XCircle size={10} />} {texto}
    </div>
  )
}

function CampoEstado({ verificando, error, valor, valido }) {
  if (verificando) return <span className="campo-hint flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Verificando...</span>
  if (error) return <p className="campo-error">{error}</p>
  if (valido && valor) return <span className="campo-success flex items-center gap-1"><CheckCircle2 size={10} /> Disponible</span>
  return null
}

export default function Register() {
  const { form, errores, verificando, cargando, handleChange, handleSubmit } = useRegister()
  const [verPass, setVerPass]     = useState(false)
  const [verConf, setVerConf]     = useState(false)
  const [focusPass, setFocusPass] = useState(false)

  const passReqs = {
    largo:     form.password.length >= 6,
    mayuscula: /[A-Z]/.test(form.password),
    numero:    /[0-9]/.test(form.password),
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <Logo />
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
                  <div className="relative">
                    <input value={form.numero_documento} onChange={e => handleChange('numero_documento', e.target.value)}
                      className={'campo-input pr-7 ' + (errores.numero_documento ? 'border-red-400' : (!errores.numero_documento && form.numero_documento && !verificando.numero_documento ? 'border-primary/40' : ''))}
                      placeholder="Solo números" maxLength={15} inputMode="numeric" />
                    {verificando.numero_documento && <Loader2 size={12} className="absolute right-2.5 top-2.5 text-gray-400 animate-spin" />}
                  </div>
                  <CampoEstado verificando={verificando.numero_documento} error={errores.numero_documento}
                    valor={form.numero_documento} valido={!errores.numero_documento && form.numero_documento?.length >= 5} />
                </div>
                <div className="col-span-2">
                  <label className="campo-label">Teléfono (10 dígitos)</label>
                  <input value={form.telefono} onChange={e => handleChange('telefono', e.target.value)}
                    className={'campo-input ' + (errores.telefono ? 'border-red-400' : '')}
                    placeholder="Ej: 3001234567" maxLength={10} inputMode="numeric" />
                  {errores.telefono && <p className="campo-error">{errores.telefono}</p>}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Datos de Acceso</p>
              <div className="space-y-3">
                <div>
                  <label className="campo-label">Correo Electrónico *</label>
                  <div className="relative">
                    <input type="email" value={form.email} onChange={e => handleChange('email', e.target.value)}
                      className={'campo-input pr-7 ' + (errores.email ? 'border-red-400' : (!errores.email && form.email && !verificando.email ? 'border-primary/40' : ''))}
                      placeholder="correo@ejemplo.com" />
                    {verificando.email && <Loader2 size={12} className="absolute right-2.5 top-2.5 text-gray-400 animate-spin" />}
                  </div>
                  <CampoEstado verificando={verificando.email} error={errores.email}
                    valor={form.email} valido={!errores.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="campo-label">Contraseña *</label>
                    <div className="relative">
                      <input type={verPass ? 'text' : 'password'} value={form.password}
                        onChange={e => handleChange('password', e.target.value)}
                        onFocus={() => setFocusPass(true)} onBlur={() => setFocusPass(false)}
                        className={'campo-input pr-8 ' + (errores.password ? 'border-red-400' : '')}
                        placeholder="Mínimo 6 caracteres" />
                      <button type="button" onClick={() => setVerPass(!verPass)}
                        className="absolute right-2 top-2.5 text-gray-400 hover:text-primary">
                        {verPass ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                    {(focusPass || form.password) && (
                      <div className="mt-1.5 space-y-0.5 p-2 bg-light-bg dark:bg-dark-bg rounded-lg">
                        <Requisito ok={passReqs.largo}     texto="Mínimo 6 caracteres" />
                        <Requisito ok={passReqs.mayuscula} texto="Una letra mayúscula" />
                        <Requisito ok={passReqs.numero}    texto="Un número" />
                      </div>
                    )}
                    {errores.password && <p className="campo-error">{errores.password}</p>}
                  </div>
                  <div>
                    <label className="campo-label">Confirmar Contraseña *</label>
                    <div className="relative">
                      <input type={verConf ? 'text' : 'password'} value={form.confirmar}
                        onChange={e => handleChange('confirmar', e.target.value)}
                        className={'campo-input pr-8 ' + (errores.confirmar ? 'border-red-400' : '')}
                        placeholder="Repetir contraseña" />
                      <button type="button" onClick={() => setVerConf(!verConf)}
                        className="absolute right-2 top-2.5 text-gray-400 hover:text-primary">
                        {verConf ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                    {errores.confirmar && <p className="campo-error">{errores.confirmar}</p>}
                  </div>
                </div>
              </div>
            </div>

            <button type="submit"
              disabled={cargando || !!errores.email || !!errores.numero_documento || Object.values(verificando).some(Boolean)}
              className="btn-primary w-full justify-center py-2.5 text-sm disabled:opacity-50">
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