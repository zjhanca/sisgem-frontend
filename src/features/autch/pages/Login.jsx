import { Link } from 'react-router-dom'
import { Eye, EyeOff, Sun, Moon, Store, AlertCircle } from 'lucide-react'
import { useLogin } from '../Hooks/useLogin'
 
export default function Login() {
  const {
    form, verPass, setVerPass, cargando,
    errores, errorGeneral,
    tema, toggleTema, handleChange, handleSubmit,
  } = useLogin()
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg px-4">
      <button onClick={toggleTema} className="fixed top-4 right-4 btn-ghost">
        {tema === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
 
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/20 mb-4">
            <Store size={22} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary">SISGEM</h1>
          <p className="text-sm text-gray-400 dark:text-dark-text/50 mt-1">Sistema de Gestión para Minimercado</p>
        </div>
 
        <div className="card">
          <h2 className="text-sm font-medium text-light-text dark:text-dark-text mb-4">Inicia Sesión</h2>
 
          {errorGeneral && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20">
              <AlertCircle size={14} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-600 dark:text-red-400">{errorGeneral}</p>
            </div>
          )}
 
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="campo-label">Correo Electrónico</label>
              <input type="email" value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                className={"campo-input " + (errores.email ? 'border-red-400' : '')}
                placeholder="admin@sisgem.com" autoComplete="email" />
              {errores.email && <p className="campo-error">{errores.email}</p>}
            </div>
 
            <div>
              <label className="campo-label">Contraseña</label>
              <div className="relative">
                <input type={verPass ? 'text' : 'password'} value={form.password}
                  onChange={e => handleChange('password', e.target.value)}
                  className={"campo-input pr-10 " + (errores.password || errorGeneral ? 'border-red-400' : '')}
                  placeholder="••••••••" autoComplete="current-password" />
                <button type="button" onClick={() => setVerPass(!verPass)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-primary transition-colors">
                  {verPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errores.password && <p className="campo-error">{errores.password}</p>}
            </div>
 
            <button type="submit" disabled={cargando} className="btn-primary w-full justify-center py-2">
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
 
          <div className="mt-4 border-t border-gray-200 dark:border-dark-border pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <Link to="/recuperar" className="text-xs text-primary/70 hover:text-primary transition-colors">
                Olvidé mi Contraseña
              </Link>
              <Link to="/" className="text-xs text-primary/70 hover:text-primary transition-colors">
                Ver Catálogo
              </Link>
            </div>
            <div className="text-center pt-1">
              <span className="text-xs text-gray-400">¿No tienes cuenta? </span>
              <Link to="/register" className="text-xs text-primary hover:underline font-medium">
                Regístrate aquí
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
