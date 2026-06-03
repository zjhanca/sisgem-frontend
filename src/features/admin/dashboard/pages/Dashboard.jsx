import { DollarSign, Clock, TrendingUp, Calendar, Download } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'
import { useDashboard } from '../hooks/useDashboard'
import DashboardStatCard     from '../components/DashboardStatCard'
import DashboardVentas       from '../components/DashboardVentas'
import DashboardTopProductos from '../components/DashboardTopProductos'
import DashboardVentasMes    from '../components/DashboardVentasMes'

export default function Dashboard() {
  const {
    data, isLoading, ventasMes, ventasGrafica,
    totalSemana, totalMes,
    periodoVentas, setPeriodoVentas,
    descargarReporte,
  } = useDashboard()

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-gray-400 dark:text-dark-text/40">Cargando...</p>
    </div>
  )

  if (!data) return null

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">Dashboard</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarReporte('semana')} className="btn-outline">
            <Download size={14} /> Semanal
          </button>
          <button onClick={() => descargarReporte('mes')} className="btn-outline">
            <Download size={14} /> Mensual
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <DashboardStatCard
          icon={DollarSign} label="Ventas Hoy"
          valor={formatPrecio(data.ventas_hoy?.monto_total || 0)}
          sub={`${data.ventas_hoy?.total_pedidos || 0} pedidos`}
        />
        <DashboardStatCard
          icon={Clock} label="Pendientes"
          valor={data.pedidos_pendientes || 0}
          sub="Por atender"
          color="bg-yellow-500/20"
        />
        <DashboardStatCard
          icon={TrendingUp} label="Esta Semana"
          valor={formatPrecio(totalSemana)}
          sub="En ventas"
        />
        <DashboardStatCard
          icon={Calendar} label="Este Mes"
          valor={formatPrecio(totalMes)}
          sub="En ventas"
          color="bg-blue-500/20"
        />
      </div>

      <DashboardVentas
        ventasGrafica={ventasGrafica}
        periodoVentas={periodoVentas}
        setPeriodoVentas={setPeriodoVentas}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashboardTopProductos productos={data.productos_top} />
        <DashboardVentasMes ventasMes={ventasMes} />
      </div>
    </div>
  )
}