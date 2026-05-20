import api from '@shared/services/api'
 
export const categoriasService = {
  getAll:       ()         => api.get('/categorias').then(r => r.data.datos),
  create:       data       => api.post('/categorias', data),
  update:       (id, data) => api.put(`/categorias/${id}`, data),
  toggleEstado: id         => api.patch(`/categorias/${id}/estado`),
  delete:       id         => api.delete(`/categorias/${id}`),
}
