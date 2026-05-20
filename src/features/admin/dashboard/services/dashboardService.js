import api from '@shared/services/api'
 
export const dashboardService = {
  getStats:     () => api.get('/dashboard').then(r => r.data.datos),
  getVentasMes: () => api.get('/dashboard/ventas-mes').then(r => r.data.datos),
}
