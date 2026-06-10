import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRecuperar } from '../Hooks/useRecuperar'

export default function Recuperar() {
  const { email, enviado, cargando, error, verificando, noExiste, handleChange, handleSubmit } = useRecuperar()

  return (
    <div className="min-h-screen flex">

      {/* panel izquierdo */}
      <div className="w-full md:w-[420px] flex flex-col justify-center px-10 py-12 bg-white">
        <div className="mb-8">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain"
                onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
              <span style={{display:'none'}} className="text-sm font-bold text-primary">S</span>
            </div>
            <span className="font-bold text-primary text-lg">Sisgem</span>
          </Link>
          <h1 className="text-2xl font-bold text-light-text mb-1">Recuperar contraseña</h1>
          <p className="text-sm text-gray-400">Ingresa tu correo y te enviaremos instrucciones.</p>
        </div>

        {!enviado ? (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="campo-label">Correo electrónico</label>
              <div className="relative">
                <input type="email" value={email}
                  onChange={e => handleChange(e.target.value)}
                  className={`campo-input pr-8 ${error || noExiste ? 'border-red-400' : (!error && email && !verificando && !noExiste ? 'border-primary' : '')}`}
                  placeholder="correo@ejemplo.com" autoComplete="email" />
                <div className="absolute right-2.5 top-2.5">
                  {verificando
                    ? <Loader2 size={13} className="text-gray-400 animate-spin" />
                    : (!error && !noExiste && email)
                      ? <CheckCircle2 size={13} className="text-primary" />
                      : null
                  }
                </div>
              </div>
              {error && <p className="campo-error">{error}</p>}
              {noExiste && !error && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle size={11} className="text-red-400 shrink-0" />
                  <p className="text-xs text-red-400">Este correo no está registrado</p>
                </div>
              )}
              {verificando && <span className="campo-hint flex items-center gap-1 mt-1"><Loader2 size={10} className="animate-spin" /> Verificando...</span>}
            </div>
            <button type="submit"
              disabled={cargando || verificando || !!error || noExiste}
              className="btn-primary w-full justify-center py-2.5 disabled:opacity-50">
              {cargando ? 'Enviando...' : 'Enviar instrucciones'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-3 py-4">
            <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
              <CheckCircle size={28} className="text-primary" />
            </div>
            <p className="text-base font-semibold text-light-text">¡Instrucciones enviadas!</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              Revisa tu bandeja de entrada. También revisa tu carpeta de spam.
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-primary transition-colors">
            <ArrowLeft size={12} /> Volver al login
          </Link>
        </div>
      </div>

      {/* panel derecho */}
      <div className="hidden md:flex flex-1 flex-col justify-between p-12 text-white"
        style={{ background: 'linear-gradient(135deg, #0f2d1a 0%, #1E9E50 100%)' }}>
        <div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-12 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain"
              onError={e => e.target.style.display='none'} />
          </div>
        </div>
        <div className="max-w-md">
          <h2 className="text-4xl font-bold leading-tight mb-4">¿Olvidaste tu contraseña?</h2>
          <p className="text-white/70 text-base leading-relaxed">
            No te preocupes. Te enviamos un enlace seguro para que puedas restablecer tu acceso en segundos.
          </p>
        </div>
        <div className="flex gap-8 text-sm text-white/50">
          <span>Enlace seguro</span>
          <span>Expira en 1 hora</span>
          <span>Sin complicaciones</span>
        </div>
      </div>
    </div>
  )
}