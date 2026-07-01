import api from '@shared/services/api'
 
export const dashboardService = {
  getStats:     () => api.get('/dashboard').then(r => r.data.datos),
  getVentasMes: () => api.get('/dashboard/ventas-mes').then(r => r.data.datos),
  getBajoStock: () => api.get('/productos').then(r =>
    r.data.datos.filter(p => p.stock <= 5 && p.estado).sort((a, b) => a.stock - b.stock).slice(0, 10)
  ),
}