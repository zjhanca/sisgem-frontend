import api from '@shared/services/api'
 
export const ordenesService = {
  getAll:        ()         => api.get('/ordenes').then(r => r.data.datos),
  getDetalle:    id         => api.get(`/ordenes/${id}`).then(r => r.data.datos),
  create:        data       => api.post('/ordenes', data),
  update:        (id, data) => api.put(`/ordenes/${id}`, data),
  anular:        id         => api.patch(`/ordenes/${id}/anular`),
  cambiarEstado: (id, data) => api.patch(`/ordenes/${id}/estado`, data),
  getProveedores:()         => api.get('/proveedores').then(r => r.data.datos.filter(p => p.estado)),
  getProductos:  ()         => api.get('/productos').then(r => r.data.datos.filter(p => p.estado)),
  getEstados:    ()         => api.get('/estados?tipo=compra').then(r => r.data.datos),
  getBarcode:    cod        => api.get(`/productos/barcode/${cod}`),
}