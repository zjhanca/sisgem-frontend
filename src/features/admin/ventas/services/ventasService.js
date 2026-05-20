import api from '@shared/services/api'
 
export const ventasService = {
  getAll:        ()         => api.get('/pedidos').then(r => r.data.datos),
  create:        data       => api.post('/pedidos', data),
  cambiarEstado: (id, data) => api.patch(`/pedidos/${id}/estado`, data),
  getClientes:   ()         => api.get('/clientes').then(r => r.data.datos.filter(c => c.estado)),
  getProductos:  ()         => api.get('/productos').then(r => r.data.datos.filter(p => p.estado && p.stock > 0)),
  getEstados:    ()         => api.get('/estados?tipo=pedido').then(r => r.data.datos),
  registrarPago: data       => api.post('/pagos', data),
  getBarcode:    cod        => api.get(`/productos/barcode/${cod}`),
}
