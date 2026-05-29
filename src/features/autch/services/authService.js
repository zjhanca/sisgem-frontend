import api from '@shared/services/api'

export const authService = {
  login:     data   => api.post('/auth/login', data),
  registro:  data   => api.post('/auth/registro', data),
  recuperar: data   => api.post('/auth/recuperar', data),
  verificar:      params => api.get('/auth/verificar', { params }),
  resetPassword:  data   => api.post('/auth/reset-password', data),
}