import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'
import { descargarPDF } from '@shared/utils/reportes'
 
export function useDashboard() {
  const [periodoVentas, setPeriodoVentas] = useState('semana')
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardService.getStats, refetchInterval: 60000 })
  const { data: ventasMes = [] } = useQuery({ queryKey: ['ventas-mes'], queryFn: dashboardService.getVentasMes })
  const descargarReporte = tipo => descargarPDF('/reportes/ventas?periodo=' + tipo, 'reporte-' + tipo + '.pdf')
  const ventasGrafica = periodoVentas === 'semana' ? (data?.ventas_semana || []) : ventasMes
  const totalSemana = (data?.ventas_semana || []).reduce((s, d) => s + parseFloat(d.total || 0), 0)
  const totalMes    = ventasMes.reduce((s, d) => s + parseFloat(d.total || 0), 0)
  return { data, isLoading, ventasMes, ventasGrafica, totalSemana, totalMes, periodoVentas, setPeriodoVentas, descargarReporte }
}
