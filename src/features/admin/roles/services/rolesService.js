import api from '@shared/services/api'
 
export const rolesService = {
  getAll:       ()         => api.get('/roles').then(r => r.data.datos),
  getById:      id         => api.get(`/roles/${id}`),
  create:       data       => api.post('/roles', data),
  update:       (id, data) => api.put(`/roles/${id}`, data),
  toggleEstado: id         => api.patch(`/roles/${id}/estado`),
  delete:       id         => api.delete(`/roles/${id}`),
  getPermisos:  ()         => api.get('/roles/permisos').then(r => r.data.datos),
  setPermisos:  (id, data) => api.post(`/roles/${id}/permisos`, data),
}
 