import { useState } from 'react'
import { X, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import api from '@shared/services/api'
import toast from 'react-hot-toast'

function Requisito({ ok, texto }) {
  return (
    <div className={`flex items-center gap-1 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
      {ok ? <CheckCircle size={10} /> : <XCircle size={10} />} {texto}
    </div>
  )
}

export default function ModalCambiarContrasena({ onCerrar, darkMode = false }) {
  const [form, setForm] = useState({ actual: '', nueva: '', confirmar: '' })
  const [ver, setVer]   = useState({ actual: false, nueva: false, confirmar: false })
  const [cargando, setCargando]   = useState(false)
  const [errores, setErrores]     = useState({})
  const [focusNueva, setFocusNueva] = useState(false)

  const passReqs = {
    largo:     form.nueva.length >= 6,
    mayuscula: /[A-Z]/.test(form.nueva),
    numero:    /[0-9]/.test(form.nueva),
  }

  const validar = () => {
    const e = {}
    if (!form.actual) e.actual = 'Ingresa tu contraseña actual'
    if (!form.nueva || form.nueva.length < 6) e.nueva = 'Mínimo 6 caracteres'
    if (!/[A-Z]/.test(form.nueva)) e.nueva = 'Debe tener al menos una mayúscula'
    if (!/[0-9]/.test(form.nueva)) e.nueva = 'Debe tener al menos un número'
    if (form.nueva !== form.confirmar) e.confirmar = 'Las contraseñas no coinciden'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length) { setErrores(e2); return }
    setCargando(true)
    try {
      await api.patch('/usuarios/me/contrasena', { actual: form.actual, nueva: form.nueva })
      toast.success('Contraseña actualizada correctamente')
      onCerrar()
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al actualizar'
      if (msg.toLowerCase().includes('actual')) setErrores({ actual: msg })
      else toast.error(msg)
    } finally { setCargando(false) }
  }

  const cardClass = darkMode
    ? 'bg-dark-card border-dark-border text-dark-text'
    : 'bg-white border-gray-200'

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onCerrar}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div className={`relative z-10 w-full max-w-sm rounded-2xl border shadow-xl animate-slideIn ${cardClass}`}
        onClick={e => e.stopPropagation()}>
        <div className={`flex items-center justify-between px-5 py-3.5 border-b ${darkMode ? 'border-dark-border' : 'border-gray-100'}`}>
          <h3 className="text-sm font-semibold">Cambiar Contraseña</h3>
          <button onClick={onCerrar} className="p-1 rounded-md text-gray-400 hover:text-primary transition-all">
            <X size={15} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {/* Contraseña actual */}
          <div>
            <label className="campo-label">Contraseña Actual *</label>
            <div className="relative">
              <input type={ver.actual ? 'text' : 'password'} value={form.actual}
                onChange={e => { setForm(p => ({ ...p, actual: e.target.value })); setErrores(p => ({ ...p, actual: '' })) }}
                className={`campo-input pr-8 ${errores.actual ? 'border-red-400' : ''}`}
                placeholder="Tu contraseña actual" />
              <button type="button" onClick={() => setVer(p => ({ ...p, actual: !p.actual }))}
                className="absolute right-2 top-3 text-gray-400 hover:text-primary">
                {ver.actual ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errores.actual && <p className="campo-error">{errores.actual}</p>}
          </div>

          {/* Nueva contraseña */}
          <div>
            <label className="campo-label">Nueva Contraseña *</label>
            <div className="relative">
              <input type={ver.nueva ? 'text' : 'password'} value={form.nueva}
                onChange={e => { setForm(p => ({ ...p, nueva: e.target.value })); setErrores(p => ({ ...p, nueva: '' })) }}
                onFocus={() => setFocusNueva(true)} onBlur={() => setFocusNueva(false)}
                className={`campo-input pr-8 ${errores.nueva ? 'border-red-400' : ''}`}
                placeholder="Mínimo 6 caracteres" />
              <button type="button" onClick={() => setVer(p => ({ ...p, nueva: !p.nueva }))}
                className="absolute right-2 top-3 text-gray-400 hover:text-primary">
                {ver.nueva ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {(focusNueva || form.nueva) && (
              <div className="mt-1.5 space-y-1 p-2 bg-gray-50 rounded-lg">
                <Requisito ok={passReqs.largo}     texto="Mínimo 6 caracteres" />
                <Requisito ok={passReqs.mayuscula} texto="Una mayúscula" />
                <Requisito ok={passReqs.numero}    texto="Un número" />
              </div>
            )}
            {errores.nueva && <p className="campo-error">{errores.nueva}</p>}
          </div>

          {/* Confirmar */}
          <div>
            <label className="campo-label">Confirmar Nueva *</label>
            <div className="relative">
              <input type={ver.confirmar ? 'text' : 'password'} value={form.confirmar}
                onChange={e => { setForm(p => ({ ...p, confirmar: e.target.value })); setErrores(p => ({ ...p, confirmar: '' })) }}
                className={`campo-input pr-8 ${errores.confirmar ? 'border-red-400' : ''}`}
                placeholder="Repetir nueva contraseña" />
              <button type="button" onClick={() => setVer(p => ({ ...p, confirmar: !p.confirmar }))}
                className="absolute right-2 top-3 text-gray-400 hover:text-primary">
                {ver.confirmar ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errores.confirmar && <p className="campo-error">{errores.confirmar}</p>}
          </div>

          <div className={`flex justify-end gap-2 pt-2 border-t ${darkMode ? 'border-dark-border' : 'border-gray-100'}`}>
            <button type="button" onClick={onCerrar}
              className="px-4 py-1.5 text-sm border border-gray-200 text-gray-500 rounded-lg">
              Cancelar
            </button>
            <button type="submit" disabled={cargando} className="btn-primary disabled:opacity-50">
              {cargando ? 'Guardando...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}