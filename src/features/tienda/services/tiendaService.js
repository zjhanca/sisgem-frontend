import api from '@shared/services/api'
 
export const tiendaService = {
  getCatalogo:         params     => api.get('/catalogo', { params }).then(r => r.data.datos),
  getCategorias:       ()         => api.get('/catalogo/categorias').then(r => r.data.datos),
  getMarcas:           ()         => api.get('/catalogo/marcas').then(r => r.data.datos),
  crearPedido:         data       => api.post('/pedidos', data),
  getClientes:         ()         => api.get('/clientes').then(r => r.data.datos),
  getPedidosByCliente: id         => api.get(`/pedidos?cliente_id=${id}`).then(r => r.data.datos),
  getAbonos:           ()         => api.get('/abonos').then(r => r.data.datos),
  crearAbono:          data       => api.post('/abonos', data),
  getDirecciones:      id         => api.get(`/clientes/${id}/direcciones`).then(r => r.data.datos),
  crearDireccion:      (id, data) => api.post(`/clientes/${id}/direcciones`, data),
  cambiarPassword: data => api.put('/auth/cambiar-password', data),
}
