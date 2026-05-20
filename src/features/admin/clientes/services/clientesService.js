import api from '@shared/services/api'
 
export const clientesService = {
  getAll:         ()         => api.get('/clientes').then(r => r.data.datos),
  create:         data       => api.post('/clientes', data),
  update:         (id, data) => api.put(`/clientes/${id}`, data),
  toggleEstado:   id         => api.patch(`/clientes/${id}/estado`),
  getDirecciones: id         => api.get(`/clientes/${id}/direcciones`).then(r => r.data.datos),
  addDireccion:   (id, data) => api.post(`/clientes/${id}/direcciones`, data),
  getPedidos:     id         => api.get(`/pedidos?cliente_id=${id}`).then(r => r.data.datos),
}
