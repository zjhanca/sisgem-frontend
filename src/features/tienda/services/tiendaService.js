import api from '@shared/services/api'

export const tiendaService = {
  getCatalogo:         params     => api.get('/catalogo', { params }).then(r => r.data.datos),
  getCategorias:       ()         => api.get('/catalogo/categorias').then(r => r.data.datos),
  getMarcas:           ()         => api.get('/catalogo/marcas').then(r => r.data.datos),
  crearPedido:         data       => api.post('/pedidos', data),
  getClientes:         ()         => api.get('/clientes').then(r => r.data.datos),
  getPedidosByCliente: id         => api.get(`/pedidos?cliente_id=${id}`).then(r => r.data.datos),
  // Abonos = pagos filtrados por pedidos del cliente (viene con pedido_id)
  getPagosByCliente:   cliente_id => api.get('/pagos').then(r =>
    r.data.datos.filter(p => p.cliente_id === cliente_id || true) // filtra en hook
  ),
  getPagosPorPedido:   pedido_id  => api.get(`/pagos?pedido_id=${pedido_id}`).then(r => r.data.datos),
  descargarComprobante: id => api.get(`/pagos/${id}/comprobante`, { responseType: 'blob' }),
  getDirecciones:      id         => api.get(`/clientes/${id}/direcciones`).then(r => r.data.datos),
  crearDireccion:      (id, data) => api.post(`/clientes/${id}/direcciones`, data),
  cambiarPassword:     data       => api.put('/auth/cambiar-password', data),
}