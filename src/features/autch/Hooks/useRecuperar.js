import { useState } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'
 
const validarEmail = email => {
  if (!email.trim())  return 'Ingresa tu correo'
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) return 'Correo inválido'
  return ''
}
 
export function useRecuperar() {
  const [email, setEmail]       = useState('')
  const [enviado, setEnviado]   = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState('')
 
  const handleChange = valor => {
    setEmail(valor)
    setError(validarEmail(valor))
  }
 
  const handleSubmit = async e => {
    e.preventDefault()
    const err = validarEmail(email)
    if (err) { setError(err); return }
    setError('')
    setCargando(true)
    try {
      await authService.recuperar({ email })
      setEnviado(true)
    } catch {
      toast.error('Error al procesar la solicitud')
    } finally { setCargando(false) }
  }
 
  return { email, enviado, cargando, error, handleChange, handleSubmit }
}
