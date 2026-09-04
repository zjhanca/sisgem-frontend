import api from '@shared/services/api'

export const pedidosService = {
  getAll:        ()         => api.get('/pedidos').then(r => r.data.datos),
  cambiarEstado: (id, data) => api.patch(`/pedidos/${id}/estado`, data),
  marcarEntregado: id       => api.patch(`/pedidos/${id}/entregado`),
  getEstados:    ()         => api.get('/estados?tipo=pedido').then(r => r.data.datos),
  crearPago:     data       => api.post('/pagos', data),
}