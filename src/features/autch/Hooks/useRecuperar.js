import { useState, useRef, useCallback } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const validarEmail = email => {
  if (!email.trim()) return 'Ingresa tu correo'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Correo inválido'
  return ''
}

export function useRecuperar() {
  const [email, setEmail]           = useState('')
  const [enviado, setEnviado]       = useState(false)
  const [cargando, setCargando]     = useState(false)
  const [error, setError]           = useState('')
  const [verificando, setVerificando] = useState(false)
  const [noExiste, setNoExiste]     = useState(false)
  const timerRef = useRef(null)

  const verificarEmail = useCallback(async valor => {
    if (!valor || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
      setNoExiste(false); return
    }
    clearTimeout(timerRef.current)
    setVerificando(true)
    timerRef.current = setTimeout(async () => {
      try {
        const { data } = await authService.verificar({ email: valor })
        setNoExiste(!data.email_existe)
      } catch {
        setNoExiste(false)
      } finally { setVerificando(false) }
    }, 500)
  }, [])

  const handleChange = valor => {
    setEmail(valor)
    setNoExiste(false)
    const err = validarEmail(valor)
    setError(err)
    if (!err) verificarEmail(valor)
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const err = validarEmail(email)
    if (err) { setError(err); return }
    if (noExiste) { setError('Este correo no está registrado en el sistema'); return }
    if (verificando) return
    setError('')
    setCargando(true)
    try {
      await authService.recuperar({ email })
      setEnviado(true)
    } catch {
      toast.error('Error al procesar la solicitud')
    } finally { setCargando(false) }
  }

  return { email, enviado, cargando, error, verificando, noExiste, handleChange, handleSubmit }
}