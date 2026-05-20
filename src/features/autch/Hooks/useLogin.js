import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/contexts/AuthContext'
import { useTema } from '@shared/contexts/ThemeContext'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'
 
const validar = form => {
  const e = {}
  if (!form.email.trim())    e.email    = 'El correo es obligatorio'
  else if (!form.email.includes('@')) e.email = 'Correo inválido'
  if (!form.password.trim()) e.password = 'La contraseña es obligatoria'
  return e
}
 
export function useLogin() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [verPass, setVerPass] = useState(false)
  const [cargando, setCargando] = useState(false)
  const [errores, setErrores] = useState({})
  const { login }    = useAuth()
  const { tema, toggleTema } = useTema()
  const navigate     = useNavigate()
 
  const handleChange = (campo, valor) => {
    const nuevo = { ...form, [campo]: valor }
    setForm(nuevo)
    const e = validar(nuevo)
    setErrores(prev => ({ ...prev, [campo]: e[campo] || '' }))
  }
 
  const handleSubmit = async e => {
    e.preventDefault()
    const e2 = validar(form)
    if (Object.keys(e2).length) { setErrores(e2); return }
    setErrores({})
    setCargando(true)
    try {
      const { data } = await authService.login(form)
      login(data.token, data.usuario)
      toast.success('Bienvenido, ' + data.usuario.nombre)
      navigate(data.usuario.rol_id === 1 ? '/admin' : '/')
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al iniciar sesión')
    } finally { setCargando(false) }
  }
 
  return { form, verPass, setVerPass, cargando, errores, tema, toggleTema, handleChange, handleSubmit }
}
