import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/contexts/AuthContext'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'
 
const formVacio = {
  nombre: '', apellido: '', email: '', password: '', confirmar: '',
  telefono: '', tipo_documento: 'CC', numero_documento: '',
  direccion: '', barrio: ''
}
 
const validar = form => {
  const e = {}
  if (!form.nombre.trim())   e.nombre   = 'El nombre es obligatorio'
  if (!form.apellido.trim()) e.apellido = 'El apellido es obligatorio'
  if (!form.email.trim())    e.email    = 'El correo es obligatorio'
  else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(form.email)) e.email = 'Correo inválido'
  if (!form.password)        e.password  = 'La contraseña es obligatoria'
  else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
  if (form.password !== form.confirmar) e.confirmar = 'Las contraseñas no coinciden'
  return e
}
 
export function useRegister() {
  const [form, setForm]         = useState(formVacio)
  const [errores, setErrores]   = useState({})
  const [cargando, setCargando] = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()
 
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
    setCargando(true)
    try {
      const { data } = await authService.registro({
        nombre:           form.nombre.trim(),
        apellido:         form.apellido.trim(),
        email:            form.email.trim(),
        password:         form.password,
        telefono:         form.telefono || null,
        tipo_documento:   form.tipo_documento,
        numero_documento: form.numero_documento || null,
        direccion:        form.direccion || null,
        barrio:           form.barrio || null,
      })
      if (data.ok) {
        login(data.token, data.usuario)
        toast.success('Bienvenido, ' + data.usuario.nombre + '!')
        navigate('/')
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al registrarse')
    } finally { setCargando(false) }
  }
 
  return { form, errores, cargando, handleChange, handleSubmit }
}
