import api from '@shared/services/api'

export const usuariosService = {
  getAll:       ()         => api.get('/usuarios').then(r => r.data.datos),
  create:       data       => api.post('/usuarios', data),
  update:       (id, data) => api.put(`/usuarios/${id}`, data),
  toggleEstado: id         => api.patch(`/usuarios/${id}/estado`),
  delete:       id         => api.delete(`/usuarios/${id}`),
  getRoles:     ()         => api.get('/roles').then(r => r.data.datos.filter(r => r.estado)),
}