import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@shared/contexts/AuthContext'
import { useTema } from '@shared/contexts/ThemeContext'
import api from '@shared/services/api'
import toast from 'react-hot-toast'
import { Eye, EyeOff, Sun, Moon, Store } from 'lucide-react'
 
export default function Login() {
  const [form, setForm]         = useState({ email: '', password: '' })
  const [verPass, setVerPass]   = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errores, setErrores]   = useState({})
  const { login }               = useAuth()
  const { tema, toggleTema }    = useTema()
  const navigate                = useNavigate()
 
  const validar = () => {
    const e = {}
    if (!form.email.trim()) e.email = 'el correo es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'correo invalido'
    if (!form.password.trim()) e.password = 'la contrasena es obligatoria'
    return e
  }
 
  const handleSubmit = async e => {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length) { setErrores(e2); return }
    setErrores({})
    setCargando(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.token, data.usuario)
      toast.success(`bienvenido, ${data.usuario.nombre}`)
      navigate(data.usuario.rol_id === 1 ? '/admin' : '/')
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'error al iniciar sesion')
    } finally {
      setCargando(false)
    }
  }
 
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
          <h1 className="text-2xl font-bold text-primary">sisgem</h1>
          <p className="text-sm text-gray-400 dark:text-dark-text/50 mt-1">
            sistema de gestion para minimercado
          </p>
        </div>
 
        <div className="card">
          <h2 className="text-sm font-medium text-light-text dark:text-dark-text mb-4">
            inicia sesion
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="campo-label">correo electronico</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className={`campo-input ${errores.email ? 'border-red-400' : ''}`}
                placeholder="admin@sisgem.com"
                autoComplete="email"
              />
              {errores.email && <p className="campo-error">{errores.email}</p>}
            </div>
 
            <div>
              <label className="campo-label">contrasena</label>
              <div className="relative">
                <input
                  type={verPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className={`campo-input pr-10 ${errores.password ? 'border-red-400' : ''}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setVerPass(!verPass)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-primary transition-colors">
                  {verPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errores.password && <p className="campo-error">{errores.password}</p>}
            </div>
 
            <button type="submit" disabled={cargando}
              className="btn-primary w-full justify-center py-2">
              {cargando ? 'ingresando...' : 'ingresar'}
            </button>
          </form>
 
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 dark:border-dark-border pt-4">
            <Link to="/recuperar"
              className="text-xs text-primary/70 hover:text-primary transition-colors">
              olvide mi contrasena
            </Link>
            <Link to="/"
              className="text-xs text-primary/70 hover:text-primary transition-colors">
              ver catalogo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
 
