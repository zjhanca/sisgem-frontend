import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/contexts/AuthContext'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const formVacio = {
  nombre: '', apellido: '', email: '', password: '', confirmar: '',
  telefono: '', tipo_documento: 'CC', numero_documento: '',
}

const validarCampo = (campo, valor, form) => {
  switch (campo) {
    case 'nombre':   return !valor.trim() ? 'El nombre es obligatorio' : ''
    case 'apellido': return !valor.trim() ? 'El apellido es obligatorio' : ''
    case 'email':
      if (!valor.trim()) return 'El correo es obligatorio'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return 'Correo inválido'
      return ''
    case 'password':
      if (!valor) return 'La contraseña es obligatoria'
      if (valor.length < 6) return 'Mínimo 6 caracteres'
      if (!/[A-Z]/.test(valor)) return 'Debe tener al menos una mayúscula'
      if (!/[0-9]/.test(valor)) return 'Debe tener al menos un número'
      return ''
    case 'confirmar':
      return valor !== form.password ? 'Las contraseñas no coinciden' : ''
    case 'telefono':
      if (!valor) return ''
      if (!/^\d+$/.test(valor)) return 'Solo se permiten números'
      if (valor.length !== 10) return 'El teléfono debe tener 10 dígitos'
      return ''
    case 'numero_documento':
      if (!valor) return ''
      if (!/^\d+$/.test(valor)) return 'Solo se permiten números'
      return ''
    default: return ''
  }
}

export function useRegister() {
  const [form, setForm]         = useState(formVacio)
  const [errores, setErrores]   = useState({})
  const [verificando, setVerificando] = useState({})
  const [cargando, setCargando] = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()
  const timerEmail = useRef(null)
  const timerDoc   = useRef(null)

  const verificarEmail = useCallback(async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    clearTimeout(timerEmail.current)
    setVerificando(v => ({ ...v, email: true }))
    timerEmail.current = setTimeout(async () => {
      try {
        const { data } = await authService.verificar({ email })
        setVerificando(v => ({ ...v, email: false }))
        if (data.email_existe) setErrores(p => ({ ...p, email: 'Este correo ya está registrado' }))
      } catch { setVerificando(v => ({ ...v, email: false })) }
    }, 500)
  }, [])

  const verificarDocumento = useCallback(async (documento) => {
    if (!documento || documento.length < 5) return
    clearTimeout(timerDoc.current)
    setVerificando(v => ({ ...v, numero_documento: true }))
    timerDoc.current = setTimeout(async () => {
      try {
        const { data } = await authService.verificar({ documento })
        setVerificando(v => ({ ...v, numero_documento: false }))
        if (data.documento_existe) setErrores(p => ({ ...p, numero_documento: 'Este documento ya está registrado' }))
      } catch { setVerificando(v => ({ ...v, numero_documento: false })) }
    }, 500)
  }, [])

  const handleChange = (campo, valor) => {
    if (campo === 'telefono' || campo === 'numero_documento') {
      if (valor && !/^\d*$/.test(valor)) return
    }
    const nuevo = { ...form, [campo]: valor }
    setForm(nuevo)
    const err = validarCampo(campo, valor, nuevo)
    setErrores(prev => ({ ...prev, [campo]: err }))
    if (campo === 'password') {
      const errConf = validarCampo('confirmar', nuevo.confirmar, nuevo)
      setErrores(prev => ({ ...prev, confirmar: errConf }))
    }
    if (campo === 'email' && !err) verificarEmail(valor)
    if (campo === 'numero_documento' && !err) verificarDocumento(valor)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const campos = ['nombre', 'apellido', 'email', 'password', 'confirmar', 'telefono', 'numero_documento']
    const nuevosErrores = {}
    campos.forEach(c => { nuevosErrores[c] = validarCampo(c, form[c], form) })
    setErrores(nuevosErrores)
    if (Object.values(nuevosErrores).some(Boolean)) return
    if (errores.email || errores.numero_documento) return
    if (Object.values(verificando).some(Boolean)) { toast.error('Espera, verificando datos...'); return }
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
        rol_id:           2,
      })
      if (data.ok) {
        login(data.token, data.usuario)
        toast.success('Bienvenido, ' + data.usuario.nombre + '!')
        navigate('/')
      }
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al registrarse'
      if (msg.includes('correo')) setErrores(p => ({ ...p, email: 'Este correo ya está registrado' }))
      else toast.error(msg)
    } finally { setCargando(false) }
  }

  return { form, errores, verificando, cargando, handleChange, handleSubmit }
}