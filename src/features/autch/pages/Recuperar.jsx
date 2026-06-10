import { Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRecuperar } from '../Hooks/useRecuperar'

function Logo() {
  return (
    <div className="text-center mb-8">
      <Link to="/" className="inline-flex flex-col items-center gap-2">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center overflow-hidden">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain"
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
          <span style={{display:'none'}} className="w-full h-full items-center justify-center text-2xl font-bold text-primary">S</span>
        </div>
        <h1 className="text-2xl font-bold text-primary">Sisgem</h1>
      </Link>
      <p className="text-sm text-gray-400 dark:text-dark-text/50 mt-1">Recuperar Contraseña</p>
    </div>
  )
}

export default function Recuperar() {
  const { email, enviado, cargando, error, verificando, noExiste, handleChange, handleSubmit } = useRecuperar()

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg px-4">
      <div className="w-full max-w-sm">
        <Logo />
        <div className="card">
          {!enviado ? (
            <>
              <p className="text-sm text-gray-500 dark:text-dark-text/60 mb-4">
                Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="campo-label">Correo Electrónico</label>
                  <div className="relative">
                    <input type="email" value={email}
                      onChange={e => handleChange(e.target.value)}
                      className={`campo-input pr-8 ${error || noExiste ? 'border-red-400' : (!error && email && !verificando && !noExiste ? 'border-primary/40' : '')}`}
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
                      <p className="text-xs text-red-400">Este correo no está registrado en el sistema</p>
                    </div>
                  )}
                  {verificando && <span className="campo-hint flex items-center gap-1 mt-1"><Loader2 size={10} className="animate-spin" /> Verificando...</span>}
                </div>
                <button type="submit"
                  disabled={cargando || verificando || !!error || noExiste}
                  className="btn-primary w-full justify-center py-2 disabled:opacity-50">
                  {cargando ? 'Enviando...' : 'Enviar Instrucciones'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-3 py-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <CheckCircle size={24} className="text-primary" />
              </div>
              <p className="text-sm font-medium text-light-text dark:text-dark-text">Instrucciones Enviadas</p>
              <p className="text-xs text-gray-400 dark:text-dark-text/50 leading-relaxed">
                Revisa tu bandeja de entrada y sigue las instrucciones. Revisa también tu carpeta de spam.
              </p>
            </div>
          )}
          <div className="mt-4 text-center border-t border-gray-200 dark:border-dark-border pt-4">
            <Link to="/login" className="inline-flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors">
              <ArrowLeft size={12} /> Volver al Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}