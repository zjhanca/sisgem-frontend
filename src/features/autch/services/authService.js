import api from '@shared/services/api'
 
export const authService = {
  login:     data => api.post('/auth/login', data),
  registro:  data => api.post('/auth/registro', data),
  recuperar: data => api.post('/auth/recuperar', data),
}
 
