import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/contexts/AuthContext'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const validar = form => {
  const e = {}
  if (!form.email.trim())             e.email    = 'El correo es obligatorio'
  else if (!form.email.includes('@')) e.email    = 'Correo inválido'
  if (!form.password.trim())          e.password = 'La contraseña es obligatoria'
  return e
}

// Permisos que dan acceso al panel admin
const PERMISOS_ADMIN = [
  'ver_dashboard', 'ver_productos', 'ver_ventas', 'ver_clientes',
  'ver_pedidos', 'ver_pagos', 'ver_cartera', 'ver_ordenes',
  'ver_categorias', 'ver_marcas', 'ver_proveedores',
  'ver_usuarios', 'ver_roles', 'ver_reportes',
]

export function useLogin() {
  const [form, setForm]               = useState({ email: '', password: '' })
  const [verPass, setVerPass]         = useState(false)
  const [cargando, setCargando]       = useState(false)
  const [errores, setErrores]         = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleChange = (campo, valor) => {
    const nuevo = { ...form, [campo]: valor }
    setForm(nuevo)
    setErrorGeneral('')
    const e = validar(nuevo)
    setErrores(prev => ({ ...prev, [campo]: e[campo] || '' }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    e.stopPropagation()
    const e2 = validar(form)
    if (Object.keys(e2).length) { setErrores(e2); return }
    setErrores({})
    setErrorGeneral('')
    setCargando(true)
    try {
      const { data } = await authService.login(form)
      login(data.token, data.usuario)
      toast.success('Bienvenido, ' + data.usuario.nombre)

      // Detecta si tiene acceso al admin por rol o por permisos
      const esAdmin      = +data.usuario.rol_id === 1
      const tienePermiso = data.usuario.permisos?.some(p => PERMISOS_ADMIN.includes(p))

      if (esAdmin || tienePermiso) {
        navigate('/admin')
      } else {
        navigate('/')
      }

      setTimeout(() => setCargando(false), 600)
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Correo o contraseña incorrectos'
      setErrorGeneral(msg)
      setCargando(false)
    }
  }

  return { form, verPass, setVerPass, cargando, errores, errorGeneral, handleChange, handleSubmit }
}