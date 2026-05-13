import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '@shared/services/api'
import { useAuth } from '@shared/contexts/AuthContext'
import toast from 'react-hot-toast'
 
const formVacio = {
  nombre: '', apellido: '', email: '', password: '', confirmar: '',
  telefono: '', tipo_documento: 'CC', numero_documento: '',
  direccion: '', barrio: ''
}
 
export default function Register() {
  const [form, setForm]       = useState(formVacio)
  const [errores, setErrores] = useState({})
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()
 
  const validar = () => {
    const e = {}
    if (!form.nombre.trim())    e.nombre   = 'el nombre es obligatorio'
    if (!form.apellido.trim())  e.apellido = 'el apellido es obligatorio'
    if (!form.email.trim())     e.email    = 'el correo es obligatorio'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'correo invalido'
    if (!form.password)         e.password  = 'la contrasena es obligatoria'
    else if (form.password.length < 6) e.password = 'minimo 6 caracteres'
    if (form.password !== form.confirmar) e.confirmar = 'las contrasenas no coinciden'
    return e
  }
 
  const handleSubmit = async e => {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length) { setErrores(e2); return }
    setCargando(true)
    try {
      const { data } = await api.post('/auth/registro', {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        email: form.email.trim(),
        password: form.password,
        telefono: form.telefono || null,
        tipo_documento: form.tipo_documento,
        numero_documento: form.numero_documento || null,
        direccion: form.direccion || null,
        barrio: form.barrio || null
      })
      if (data.ok) {
        login(data.token, data.usuario)
        toast.success(`bienvenido, ${data.usuario.nombre}!`)
        navigate('/')
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'error al registrarse')
    } finally { setCargando(false) }
  }
 
  const f = (campo, val) => setForm(p => ({ ...p, [campo]: val }))
 
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary">SISGEM</h1>
          <p className="text-sm text-gray-500 dark:text-dark-text/60 mt-1">crear cuenta nueva</p>
        </div>
 
        <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-dark-border">
          <form onSubmit={handleSubmit} className="space-y-4">
 
            {/* datos personales */}
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">datos personales</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="campo-label">nombre *</label>
                  <input value={form.nombre} onChange={e => f('nombre', e.target.value)}
                    className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`} placeholder="tu nombre" />
                  {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
                </div>
                <div>
                  <label className="campo-label">apellido *</label>
                  <input value={form.apellido} onChange={e => f('apellido', e.target.value)}
                    className={`campo-input ${errores.apellido ? 'border-red-400' : ''}`} placeholder="tu apellido" />
                  {errores.apellido && <p className="campo-error">{errores.apellido}</p>}
                </div>
                <div>
                  <label className="campo-label">tipo documento</label>
                  <select value={form.tipo_documento} onChange={e => f('tipo_documento', e.target.value)} className="campo-input">
                    <option value="CC">Cedula (CC)</option>
                    <option value="CE">Cedula extranjeria (CE)</option>
                    <option value="TI">Tarjeta identidad (TI)</option>
                    <option value="PA">Pasaporte (PA)</option>
                  </select>
                </div>
                <div>
                  <label className="campo-label">numero documento</label>
                  <input value={form.numero_documento} onChange={e => f('numero_documento', e.target.value)}
                    className="campo-input" placeholder="ej: 1234567890" />
                </div>
                <div className="col-span-2">
                  <label className="campo-label">telefono</label>
                  <input value={form.telefono} onChange={e => f('telefono', e.target.value)}
                    className="campo-input" placeholder="ej: 3001234567" />
                </div>
              </div>
            </div>
 
            {/* ubicacion */}
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">ubicacion en medellin</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="campo-label">direccion</label>
                  <input value={form.direccion} onChange={e => f('direccion', e.target.value)}
                    className="campo-input" placeholder="ej: Calle 50 # 40-10" />
                </div>
                <div className="col-span-2">
                  <label className="campo-label">barrio</label>
                  <input value={form.barrio} onChange={e => f('barrio', e.target.value)}
                    className="campo-input" placeholder="ej: Laureles, El Poblado..." />
                </div>
              </div>
            </div>
 
            {/* cuenta */}
            <div>
              <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">datos de acceso</p>
              <div className="space-y-3">
                <div>
                  <label className="campo-label">correo electronico *</label>
                  <input type="email" value={form.email} onChange={e => f('email', e.target.value)}
                    className={`campo-input ${errores.email ? 'border-red-400' : ''}`} placeholder="Correo@ejemplo.com" />
                  {errores.email && <p className="campo-error">{errores.email}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="campo-label">contrasena *</label>
                    <input type="password" value={form.password} onChange={e => f('password', e.target.value)}
                      className={`campo-input ${errores.password ? 'border-red-400' : ''}`} placeholder="minimo 6 caracteres" />
                    {errores.password && <p className="campo-error">{errores.password}</p>}
                  </div>
                  <div>
                    <label className="campo-label">confirmar contrasena *</label>
                    <input type="password" value={form.confirmar} onChange={e => f('confirmar', e.target.value)}
                      className={`campo-input ${errores.confirmar ? 'border-red-400' : ''}`} placeholder="repetir contrasena" />
                    {errores.confirmar && <p className="campo-error">{errores.confirmar}</p>}
                  </div>
                </div>
              </div>
            </div>
 
            <button type="submit" disabled={cargando}
              className="btn-primary w-full justify-center py-2.5 text-sm disabled:opacity-50">
              {cargando ? 'creando cuenta...' : 'crear cuenta'}
            </button>
 
            <p className="text-center text-xs text-gray-500 dark:text-dark-text/60">
              ya tienes cuenta?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">inicia sesion</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
