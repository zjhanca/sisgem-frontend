import api from '@shared/services/api'
 
export const domiciliosService = {
  getAll:         ()         => api.get('/domicilios').then(r => r.data.datos),
  create:         data       => api.post('/domicilios', data),
  cambiarEstado:  (id, data) => api.patch(`/domicilios/${id}/estado`, data),
  getTarifas:     ()         => api.get('/domicilios/tarifas').then(r => r.data.datos),
  crearTarifa:    data       => api.post('/domicilios/tarifas', data),
  eliminarTarifa: id         => api.delete(`/domicilios/tarifas/${id}`),
  getEstados:     ()         => api.get('/estados?tipo=domicilio').then(r => r.data.datos),
}
