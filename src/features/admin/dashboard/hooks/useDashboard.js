import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'
import { descargarPDF, descargarExcel } from '@shared/utils/reportes'
 
export function useDashboard() {
  const [periodoVentas, setPeriodoVentas] = useState('semana')
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: dashboardService.getStats, refetchInterval: 60000 })
  const { data: ventasMes = [] } = useQuery({ queryKey: ['ventas-mes'], queryFn: dashboardService.getVentasMes })
  const { data: bajoStock = [] } = useQuery({ queryKey: ['bajo-stock'], queryFn: dashboardService.getBajoStock, refetchInterval: 60000 })
  const descargarReporte = async ({ tipo, formato = 'pdf', desde, hasta } = {}) => {
    const nombres = { dia: 'diario', semana: 'semanal', mes: 'mensual', rango: 'personalizado' }
    const ext = formato === 'excel' ? 'xlsx' : 'pdf'
    const params = new URLSearchParams({ formato })
    if (tipo === 'rango') {
      if (desde) params.set('desde', desde)
      if (hasta) params.set('hasta', hasta)
    } else {
      params.set('periodo', tipo)
    }
    const url = `/reportes/ventas?${params.toString()}`
    const nombreArchivo = `reporte-${nombres[tipo] || tipo}.${ext}`
    if (formato === 'excel') await descargarExcel(url, nombreArchivo)
    else await descargarPDF(url, nombreArchivo)
  }
  const ventasGrafica = periodoVentas === 'semana' ? (data?.ventas_semana || []) : ventasMes
  const totalSemana = (data?.ventas_semana || []).reduce((s, d) => s + parseFloat(d.total || 0), 0)
  const totalMes    = ventasMes.reduce((s, d) => s + parseFloat(d.total || 0), 0)
  return { data, isLoading, ventasMes, bajoStock, ventasGrafica, totalSemana, totalMes, periodoVentas, setPeriodoVentas, descargarReporte }
}