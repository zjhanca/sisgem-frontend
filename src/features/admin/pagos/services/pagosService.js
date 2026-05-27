import api from '@shared/services/api'

export const pagosService = {
  getAll:         ()   => api.get('/pagos').then(r => r.data.datos),
  create:         data => api.post('/pagos', data),
  anular:         id   => api.patch(`/pagos/${id}/anular`),
  getPedidos:     ()   => api.get('/pedidos').then(r => r.data.datos),
  getEstadosPago: ()   => api.get('/estados?tipo=pago').then(r => r.data.datos),
}