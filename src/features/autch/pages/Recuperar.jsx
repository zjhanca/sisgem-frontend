import { Link } from 'react-router-dom'
import { Store, ArrowLeft, CheckCircle } from 'lucide-react'
import { useRecuperar } from '../Hooks/useRecuperar'
 
export default function Recuperar() {
  const { email, enviado, cargando, error, handleChange, handleSubmit } = useRecuperar()
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/20 mb-4">
            <Store size={22} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary">SISGEM</h1>
          <p className="text-sm text-gray-400 dark:text-dark-text/50 mt-1">Recuperar Contraseña</p>
        </div>
        <div className="card">
          {!enviado ? (
            <>
              <p className="text-sm text-gray-500 dark:text-dark-text/60 mb-4">
                Ingresa tu correo y te enviaremos instrucciones para restablecer tu contraseña.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="campo-label">Correo Electrónico</label>
                  <input type="email" value={email}
                    onChange={e => handleChange(e.target.value)}
                    className={'campo-input ' + (error ? 'border-red-400' : '')}
                    placeholder="admin@sisgem.com" autoComplete="email" />
                  {error && <p className="campo-error">{error}</p>}
                </div>
                <button type="submit" disabled={cargando} className="btn-primary w-full justify-center py-2">
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
                Si el correo existe en el sistema recibirás las instrucciones en tu bandeja de entrada.
                Revisa también tu carpeta de spam.
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
