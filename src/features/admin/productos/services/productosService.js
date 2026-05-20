import api from '@shared/services/api'
 
export const productosService = {
  getAll:        ()         => api.get('/productos').then(r => r.data.datos),
  create:        data       => api.post('/productos', data),
  update:        (id, data) => api.put(`/productos/${id}`, data),
  toggleEstado:  id         => api.patch(`/productos/${id}/estado`),
  delete:        id         => api.delete(`/productos/${id}`),
  getCategorias: ()         => api.get('/categorias').then(r => r.data.datos.filter(c => c.estado)),
  getProveedores:()         => api.get('/proveedores').then(r => r.data.datos.filter(p => p.estado)),
  getMarcas:     ()         => api.get('/marcas').then(r => r.data.datos.filter(m => m.estado)),
}
 
