import api from '@shared/services/api'
 
export const proveedoresService = {
  getAll:       ()         => api.get('/proveedores').then(r => r.data.datos),
  create:       data       => api.post('/proveedores', data),
  update:       (id, data) => api.put(`/proveedores/${id}`, data),
  toggleEstado: id         => api.patch(`/proveedores/${id}/estado`),
  delete:       id         => api.delete(`/proveedores/${id}`),
}
