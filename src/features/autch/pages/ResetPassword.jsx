import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Store, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

function Requisito({ ok, texto }) {
  return (
    <div className={`flex items-center gap-1 text-xs ${ok ? 'text-green-500' : 'text-gray-400'}`}>
      {ok ? <CheckCircle size={10} /> : <XCircle size={10} />} {texto}
    </div>
  )
}

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')

  const [form, setForm]       = useState({ nueva: '', confirmar: '' })
  const [verNueva, setVerNueva] = useState(false)
  const [verConf, setVerConf]   = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errores, setErrores]   = useState({})
  const [exito, setExito]       = useState(false)

  const passReqs = {
    largo:     form.nueva.length >= 6,
    mayuscula: /[A-Z]/.test(form.nueva),
    numero:    /[0-9]/.test(form.nueva),
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg px-4">
        <div className="card max-w-sm w-full text-center space-y-3">
          <AlertCircle size={32} className="text-red-400 mx-auto" />
          <p className="text-sm font-medium">Enlace inválido</p>
          <p className="text-xs text-gray-400">Este enlace no es válido o ha expirado.</p>
          <Link to="/recuperar" className="btn-primary text-xs justify-center w-full">Solicitar nuevo enlace</Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const e2 = {}
    if (!form.nueva || form.nueva.length < 6) e2.nueva = 'Mínimo 6 caracteres'
    if (!/[A-Z]/.test(form.nueva)) e2.nueva = 'Debe tener al menos una mayúscula'
    if (!/[0-9]/.test(form.nueva)) e2.nueva = 'Debe tener al menos un número'
    if (form.nueva !== form.confirmar) e2.confirmar = 'Las contraseñas no coinciden'
    if (Object.keys(e2).length) { setErrores(e2); return }

    setCargando(true)
    try {
      await authService.resetPassword({ token, nueva: form.nueva })
      setExito(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al restablecer'
      if (msg.includes('expir')) setErrores({ nueva: 'El enlace ha expirado. Solicita uno nuevo.' })
      else if (msg.includes('utilizado')) setErrores({ nueva: 'Este enlace ya fue utilizado.' })
      else toast.error(msg)
    } finally { setCargando(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/20 mb-4">
            <Store size={22} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary">SISGEM</h1>
          <p className="text-sm text-gray-400 dark:text-dark-text/50 mt-1">Restablecer Contraseña</p>
        </div>

        <div className="card">
          {exito ? (
            <div className="text-center space-y-3 py-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <CheckCircle size={24} className="text-primary" />
              </div>
              <p className="text-sm font-medium">¡Contraseña actualizada!</p>
              <p className="text-xs text-gray-400">Serás redirigido al login en unos segundos...</p>
              <Link to="/login" className="btn-primary text-xs justify-center w-full">Ir al Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-gray-400 dark:text-dark-text/50">
                Ingresa tu nueva contraseña para restablecer el acceso.
              </p>

              <div>
                <label className="campo-label">Nueva Contraseña *</label>
                <div className="relative">
                  <input type={verNueva ? 'text' : 'password'} value={form.nueva}
                    onChange={e => { setForm(p => ({ ...p, nueva: e.target.value })); setErrores(p => ({ ...p, nueva: '' })) }}
                    className={`campo-input pr-8 ${errores.nueva ? 'border-red-400' : ''}`}
                    placeholder="Mínimo 6 caracteres" />
                  <button type="button" onClick={() => setVerNueva(!verNueva)}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-primary">
                    {verNueva ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                {form.nueva && (
                  <div className="mt-1.5 space-y-0.5 p-2 bg-light-bg dark:bg-dark-bg rounded-lg">
                    <Requisito ok={passReqs.largo}     texto="Mínimo 6 caracteres" />
                    <Requisito ok={passReqs.mayuscula} texto="Una letra mayúscula" />
                    <Requisito ok={passReqs.numero}    texto="Un número" />
                  </div>
                )}
                {errores.nueva && <p className="campo-error">{errores.nueva}</p>}
              </div>

              <div>
                <label className="campo-label">Confirmar Contraseña *</label>
                <div className="relative">
                  <input type={verConf ? 'text' : 'password'} value={form.confirmar}
                    onChange={e => { setForm(p => ({ ...p, confirmar: e.target.value })); setErrores(p => ({ ...p, confirmar: '' })) }}
                    className={`campo-input pr-8 ${errores.confirmar ? 'border-red-400' : ''}`}
                    placeholder="Repetir contraseña" />
                  <button type="button" onClick={() => setVerConf(!verConf)}
                    className="absolute right-2 top-2.5 text-gray-400 hover:text-primary">
                    {verConf ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                {errores.confirmar && <p className="campo-error">{errores.confirmar}</p>}
              </div>

              <button type="submit" disabled={cargando} className="btn-primary w-full justify-center py-2 disabled:opacity-50">
                {cargando ? 'Actualizando...' : 'Restablecer Contraseña'}
              </button>
            </form>
          )}

          <div className="mt-4 text-center border-t border-gray-200 dark:border-dark-border pt-4">
            <Link to="/login" className="text-xs text-primary/70 hover:text-primary transition-colors">
              ← Volver al Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}