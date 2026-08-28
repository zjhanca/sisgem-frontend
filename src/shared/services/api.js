import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})

// adjuntar token automaticamente
api.interceptors.request.use(config => {
  const token = localStorage.getItem('sisgem_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// manejar errores de autenticacion
api.interceptors.response.use(
  res => res,
  err => {
    const url = err.config?.url || ''
    const esAuth = url.includes('/auth/login') || url.includes('/auth/recuperar')
      || url.includes('/auth/registro') || url.includes('/auth/cambiar-password')
      || url.includes('/usuarios/me/contrasena')

    // Error de red / servidor caído / CORS — antes se tragaba en silencio
    if (!err.response) {
      console.error('Error de red en petición a', url, err)
      toast.error('No se pudo conectar con el servidor. Revisa tu conexión o si el backend está activo.')
      return Promise.reject(err)
    }

    // solo cerrar sesión en 401 (token inválido/expirado), NO en 403 (sin permiso)
    if (!esAuth && err.response?.status === 401) {
      console.warn('Sesión expirada o token inválido, redirigiendo a login. URL:', url)
      toast.error('Tu sesión expiró. Inicia sesión de nuevo.')
      localStorage.removeItem('sisgem_token')
      localStorage.removeItem('sisgem_usuario')
      // pequeño delay para que el toast alcance a verse antes de la redirección
      setTimeout(() => { window.location.href = '/login' }, 800)
      return Promise.reject(err)
    }

    return Promise.reject(err)
  }
)

export default api