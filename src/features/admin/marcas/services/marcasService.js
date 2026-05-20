import api from '@shared/services/api'
 
export const marcasService = {
  getAll:        ()         => api.get('/marcas').then(r => r.data.datos),
  create:        data       => api.post('/marcas', data),
  update:        (id, data) => api.put(`/marcas/${id}`, data),
  toggleEstado:  id         => api.patch(`/marcas/${id}/estado`),
  delete:        id         => api.delete(`/marcas/${id}`),
  getProveedores:()         => api.get('/proveedores').then(r => r.data.datos.filter(p => p.estado)),
}
