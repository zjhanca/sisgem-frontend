import api from '@shared/services/api'
 
export const ordenesService = {
  getAll:        ()         => api.get('/ordenes').then(r => r.data.datos),
  create:        data       => api.post('/ordenes', data),
  cambiarEstado: (id, data) => api.patch(`/ordenes/${id}/estado`, data),
  getProveedores:()         => api.get('/proveedores').then(r => r.data.datos.filter(p => p.estado)),
  getProductos:  ()         => api.get('/productos').then(r => r.data.datos.filter(p => p.estado)),
  getEstados:    ()         => api.get('/estados?tipo=compra').then(r => r.data.datos),
  getBarcode:    cod        => api.get(`/productos/barcode/${cod}`),
}
