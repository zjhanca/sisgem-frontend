import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [cargando, setCargando] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('completa todos los campos')
      return
    }
    setCargando(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.token, data.usuario)
      navigate(data.usuario.rol_id === 1 ? '/admin' : '/')
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'error al iniciar sesion')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-dark-bg dark:bg-dark-bg bg-light-bg'>
      <div className='w-full max-w-sm bg-dark-card dark:bg-dark-card bg-light-card
        rounded-xl border border-dark-border p-8'>
        <h1 className='text-2xl font-bold text-primary mb-1'>sisgem</h1>
        <p className='text-sm text-dark-text/60 mb-6'>inicia sesion para continuar</p>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label className='block text-xs text-dark-text/70 mb-1'>correo</label>
            <input type='email' value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
              className='w-full px-3 py-2 text-sm bg-dark-bg dark:bg-dark-bg bg-light-bg
                border border-dark-border rounded-lg text-dark-text dark:text-dark-text
                text-light-text focus:outline-none focus:border-primary'
            />
          </div>
          <div>
            <label className='block text-xs text-dark-text/70 mb-1'>contrasena</label>
            <input type='password' value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              className='w-full px-3 py-2 text-sm bg-dark-bg dark:bg-dark-bg bg-light-bg
                border border-dark-border rounded-lg text-dark-text dark:text-dark-text
                text-light-text focus:outline-none focus:border-primary'
            />
          </div>
          <button type='submit' disabled={cargando}
            className='w-full py-2 bg-primary hover:bg-primary-mid text-dark-bg
              font-medium rounded-lg text-sm transition-colors disabled:opacity-50'>
            {cargando ? 'ingresando...' : 'ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
