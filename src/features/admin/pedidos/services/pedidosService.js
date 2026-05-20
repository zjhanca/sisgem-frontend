import api from '@shared/services/api'
 
export const pedidosService = {
  getAll:          ()         => api.get('/pedidos').then(r => r.data.datos),
  create:          data       => api.post('/pedidos', data),
  cambiarEstado:   (id, data) => api.patch(`/pedidos/${id}/estado`, data),
  getClientes:     ()         => api.get('/clientes').then(r => r.data.datos.filter(c => c.estado)),
  getProductos:    ()         => api.get('/productos').then(r => r.data.datos.filter(p => p.estado && p.stock > 0)),
  getEstados:      ()         => api.get('/estados?tipo=pedido').then(r => r.data.datos),
  getEstadosDom:   ()         => api.get('/estados?tipo=domicilio').then(r => r.data.datos),
  getTarifas:      ()         => api.get('/domicilios/tarifas').then(r => r.data.datos),
  crearTarifa:     data       => api.post('/domicilios/tarifas', data),
  eliminarTarifa:  id         => api.delete(`/domicilios/tarifas/${id}`),
  getDomicilios:   ()         => api.get('/domicilios').then(r => r.data.datos),
  getDomPedido:    id         => api.get(`/domicilios?pedido_id=${id}`).then(r => r.data.datos?.[0] || null),
  crearDomicilio:  data       => api.post('/domicilios', data),
  cambiarEstadoDom:(id, data) => api.patch(`/domicilios/${id}/estado`, data),
  getDirs:         id         => api.get(`/clientes/${id}/direcciones`).then(r => r.data.datos),
  getBarcode:      cod        => api.get(`/productos/barcode/${cod}`),
}
