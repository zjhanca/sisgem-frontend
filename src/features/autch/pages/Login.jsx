import { Link } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { useLogin } from '../Hooks/useLogin'
import PantallaCarga from '@shared/components/PantallaCarga'

export default function Login() {
  const { form, verPass, setVerPass, cargando, errores, errorGeneral, handleChange, handleSubmit } = useLogin()

  return (
    <div className="min-h-screen flex">
      {cargando && <PantallaCarga mensaje="Iniciando sesión..." />}

      {/* panel izquierdo — formulario */}
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
          <h1 className="text-2xl font-bold text-light-text mb-1">Iniciar sesión</h1>
          <p className="text-sm text-gray-400">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">Regístrate</Link>
          </p>
        </div>

        {errorGeneral && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-100">
            <AlertCircle size={14} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-600">{errorGeneral}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="campo-label">Correo electrónico</label>
            <input type="email" value={form.email}
              onChange={e => handleChange('email', e.target.value)}
              className={"campo-input " + (errores.email ? 'border-red-400' : '')}
              placeholder="correo@ejemplo.com" autoComplete="email" />
            {errores.email && <p className="campo-error">{errores.email}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="campo-label mb-0">Contraseña</label>
              <Link to="/recuperar" className="text-xs text-primary hover:underline">¿Olvidaste tu contraseña?</Link>
            </div>
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

          <button type="submit" disabled={cargando} className="btn-primary w-full justify-center py-2.5 mt-2">
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-8">
          <Link to="/" className="hover:text-primary transition-colors">← Volver a la tienda</Link>
        </p>
      </div>

      {/* panel derecho — decorativo */}
      <div className="hidden md:flex flex-1 flex-col justify-between p-12 text-white"
        style={{ background: 'linear-gradient(135deg, #0f2d1a 0%, #1E9E50 100%)' }}>
        <div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-12 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain"
              onError={e => e.target.style.display='none'} />
          </div>
        </div>
        <div className="max-w-md">
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Gestiona tu minimercado con facilidad
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            Controla inventario, ventas, clientes y más desde un solo lugar. Rápido, seguro y siempre disponible.
          </p>
        </div>
        <div className="flex gap-8 text-sm text-white/50">
          <span>Ventas en tiempo real</span>
          <span>Control de inventario</span>
          <span>Reportes automáticos</span>
        </div>
      </div>
    </div>
  )
}