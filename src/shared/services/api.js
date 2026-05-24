import axios from 'axios'

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
    const esLoginORecuperar = url.includes('/auth/login') || url.includes('/auth/recuperar') || url.includes('/auth/registro')

    // solo redirigir si NO es una llamada de auth
    if (!esLoginORecuperar && (err.response?.status === 401 || err.response?.status === 403)) {
      localStorage.removeItem('sisgem_token')
      localStorage.removeItem('sisgem_usuario')
      window.location.href = '/login'
    }

    return Promise.reject(err)
  }
)

export default api