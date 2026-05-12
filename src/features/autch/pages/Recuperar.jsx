import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '@shared/services/api'
import toast from 'react-hot-toast'
import { Store, ArrowLeft, CheckCircle } from 'lucide-react'
 
export default function Recuperar() {
  const [email, setEmail]       = useState('')
  const [enviado, setEnviado]   = useState(false)
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState('')
 
  const handleSubmit = async e => {
    e.preventDefault()
    if (!email.trim()) { setError('ingresa tu correo'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('correo invalido'); return }
    setError('')
    setCargando(true)
    try {
      await api.post('/auth/recuperar', { email })
      setEnviado(true)
    } catch {
      toast.error('error al procesar la solicitud')
    } finally {
      setCargando(false)
    }
  }
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/20 mb-4">
            <Store size={22} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-primary">sisgem</h1>
          <p className="text-sm text-gray-400 dark:text-dark-text/50 mt-1">
            recuperar contrasena
          </p>
        </div>
 
        <div className="card">
          {!enviado ? (
            <>
              <p className="text-sm text-gray-500 dark:text-dark-text/60 mb-4">
                ingresa tu correo y te enviaremos instrucciones para restablecer tu contrasena.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label className="campo-label">correo electronico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    className={`campo-input ${error ? 'border-red-400' : ''}`}
                    placeholder="admin@sisgem.com"
                    autoComplete="email"
                  />
                  {error && <p className="campo-error">{error}</p>}
                </div>
                <button type="submit" disabled={cargando}
                  className="btn-primary w-full justify-center py-2">
                  {cargando ? 'enviando...' : 'enviar instrucciones'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-3 py-2">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center
                justify-center mx-auto">
                <CheckCircle size={24} className="text-primary" />
              </div>
              <p className="text-sm font-medium text-light-text dark:text-dark-text">
                instrucciones enviadas
              </p>
              <p className="text-xs text-gray-400 dark:text-dark-text/50 leading-relaxed">
                si el correo existe en el sistema recibiras las instrucciones
                en tu bandeja de entrada. revisa tambien tu carpeta de spam.
              </p>
            </div>
          )}
 
          <div className="mt-4 text-center border-t border-gray-200 dark:border-dark-border pt-4">
            <Link to="/login"
              className="inline-flex items-center gap-1 text-xs text-primary/70 hover:text-primary transition-colors">
              <ArrowLeft size={12} /> volver al login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
 
