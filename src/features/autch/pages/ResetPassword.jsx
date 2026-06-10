import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

function Requisito({ ok, texto }) {
  return (
    <div className={`flex items-center gap-1 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
      {ok ? <CheckCircle size={10} /> : <XCircle size={10} />} {texto}
    </div>
  )
}

export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')
  const [form, setForm]         = useState({ nueva: '', confirmar: '' })
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

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="card max-w-sm w-full text-center space-y-3">
        <AlertCircle size={32} className="text-red-400 mx-auto" />
        <p className="text-sm font-medium">Enlace inválido</p>
        <p className="text-xs text-gray-400">Este enlace no es válido o ha expirado.</p>
        <Link to="/recuperar" className="btn-primary text-xs justify-center w-full">Solicitar nuevo enlace</Link>
      </div>
    </div>
  )

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
      if (msg.includes('expir')) setErrores({ nueva: 'El enlace ha expirado.' })
      else if (msg.includes('utilizado')) setErrores({ nueva: 'Este enlace ya fue utilizado.' })
      else toast.error(msg)
    } finally { setCargando(false) }
  }

  return (
    <div className="min-h-screen flex">
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
          <h1 className="text-2xl font-bold text-light-text mb-1">Nueva contraseña</h1>
          <p className="text-sm text-gray-400">Elige una contraseña segura para tu cuenta.</p>
        </div>

        {exito ? (
          <div className="text-center space-y-3 py-4">
            <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto">
              <CheckCircle size={28} className="text-primary" />
            </div>
            <p className="text-base font-semibold text-light-text">¡Contraseña actualizada!</p>
            <p className="text-sm text-gray-400">Serás redirigido al login en unos segundos...</p>
            <Link to="/login" className="btn-primary text-xs justify-center w-full">Ir al login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="campo-label">Nueva contraseña</label>
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
                <div className="mt-2 space-y-1 p-2 bg-gray-50 rounded-lg">
                  <Requisito ok={passReqs.largo}     texto="Mínimo 6 caracteres" />
                  <Requisito ok={passReqs.mayuscula} texto="Una letra mayúscula" />
                  <Requisito ok={passReqs.numero}    texto="Un número" />
                </div>
              )}
              {errores.nueva && <p className="campo-error">{errores.nueva}</p>}
            </div>
            <div>
              <label className="campo-label">Confirmar contraseña</label>
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
            <button type="submit" disabled={cargando} className="btn-primary w-full justify-center py-2.5 disabled:opacity-50">
              {cargando ? 'Actualizando...' : 'Restablecer contraseña'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="text-xs text-gray-400 hover:text-primary transition-colors">← Volver al login</Link>
        </div>
      </div>

      <div className="hidden md:flex flex-1 flex-col justify-between p-12 text-white"
        style={{ background: 'linear-gradient(135deg, #0f2d1a 0%, #1E9E50 100%)' }}>
        <div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-12 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain"
              onError={e => e.target.style.display='none'} />
          </div>
        </div>
        <div className="max-w-md">
          <h2 className="text-4xl font-bold leading-tight mb-4">Restablece tu acceso</h2>
          <p className="text-white/70 text-base leading-relaxed">
            Elige una contraseña segura y vuelve a gestionar tu negocio sin interrupciones.
          </p>
        </div>
        <div className="flex gap-8 text-sm text-white/50">
          <span>Acceso seguro</span>
          <span>Cifrado SSL</span>
          <span>Protección total</span>
        </div>
      </div>
    </div>
  )
}