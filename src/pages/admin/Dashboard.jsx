import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { formatPrecio } from '../../utils/validaciones'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  DollarSign, ShoppingCart, Clock, TrendingUp,
  Package, Download, Calendar
} from 'lucide-react'
import { descargarPDF } from '../../utils/reportes'
 
const tooltipStyle = {
  contentStyle: {
    background: '#0F1C22',
    border: '1px solid #1A3040',
    borderRadius: 8,
    fontSize: 12
  },
  labelStyle: { color: '#A6E8B2' },
  itemStyle:  { color: '#EAF7EE' },
}
 
const COLORES = ['#A6E8B2', '#7CCF92', '#4CAF6E', '#2D8F50', '#1A6635']
 
function StatCard({ icon: Icon, label, valor, sub, color = 'bg-primary/20' }) {
  return (
    <div className="card flex items-start gap-3">
      <div className={`p-2.5 rounded-xl ${color} shrink-0`}>
        <Icon size={18} className="text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 dark:text-dark-text/50">{label}</p>
        <p className="text-lg font-semibold text-light-text dark:text-dark-text truncate">
          {valor}
        </p>
        {sub && (
          <p className="text-xs text-gray-400 dark:text-dark-text/40">{sub}</p>
        )}
      </div>
    </div>
  )
}
 
export default function Dashboard() {
  const [periodoVentas, setPeriodoVentas] = useState('semana')
 
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then(r => r.data.datos),
    refetchInterval: 60000
  })
 
  const { data: ventasMes = [] } = useQuery({
    queryKey: ['ventas-mes'],
    queryFn: () => api.get('/dashboard/ventas-mes').then(r => r.data.datos)
  })
 
  const descargarReporte = tipo => descargarPDF(`/reportes/ventas?periodo=${tipo}`, `reporte-${tipo}.pdf`)
 
  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-gray-400 dark:text-dark-text/40">cargando...</p>
    </div>
  )
 
  if (!data) return null
 
  const ventasGrafica = periodoVentas === 'semana'
    ? (data.ventas_semana || [])
    : ventasMes
 
  const totalSemana = (data.ventas_semana || [])
    .reduce((s, d) => s + parseFloat(d.total || 0), 0)
 
  const totalMes = ventasMes
    .reduce((s, d) => s + parseFloat(d.total || 0), 0)
 
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="page-title">dashboard</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarReporte('semana')}
            className="btn-outline text-xs">
            <Download size={12} /> reporte semanal
          </button>
          <button onClick={() => descargarReporte('mes')}
            className="btn-outline text-xs">
            <Download size={12} /> reporte mensual
          </button>
        </div>
      </div>
 
      {/* stats principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={DollarSign}
          label="ventas hoy"
          valor={formatPrecio(data.ventas_hoy?.monto_total || 0)}
          sub={`${data.ventas_hoy?.total_pedidos || 0} pedidos`}
        />
        <StatCard
          icon={Clock}
          label="pendientes"
          valor={data.pedidos_pendientes || 0}
          sub="por atender"
          color="bg-yellow-500/20"
        />
        <StatCard
          icon={TrendingUp}
          label="esta semana"
          valor={formatPrecio(totalSemana)}
          sub="en ventas"
        />
        <StatCard
          icon={Calendar}
          label="este mes"
          valor={formatPrecio(totalMes)}
          sub="en ventas"
          color="bg-blue-500/20"
        />
      </div>
 
      {/* graficas ventas */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-light-text dark:text-dark-text">
            ventas por periodo
          </h2>
          <div className="flex gap-1">
            {['semana', 'mes'].map(p => (
              <button key={p}
                onClick={() => setPeriodoVentas(p)}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                  periodoVentas === p
                    ? 'bg-primary text-dark-bg border-primary'
                    : 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-text/60'
                }`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={ventasGrafica}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A3040" />
            <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#A6E8B2' }} />
            <YAxis tick={{ fontSize: 11, fill: '#A6E8B2' }} width={70}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...tooltipStyle}
              formatter={v => [formatPrecio(v), 'ventas']} />
            <Line type="monotone" dataKey="total" stroke="#A6E8B2"
              strokeWidth={2} dot={{ fill: '#A6E8B2', r: 3 }}
              activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
 
      {/* segunda fila */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 
        {/* productos mas vendidos */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-light-text dark:text-dark-text">
              productos mas vendidos
            </h2>
            <Package size={14} className="text-primary/50" />
          </div>
          {(data.productos_top || []).length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-dark-text/40 text-center py-8">
              sin datos disponibles
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data.productos_top || []} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: '#A6E8B2' }} />
                <YAxis dataKey="nombre" type="category" width={100}
                  tick={{ fontSize: 10, fill: '#EAF7EE' }} />
                <Tooltip {...tooltipStyle}
                  formatter={v => [v, 'unidades']} />
                <Bar dataKey="total_vendido" radius={[0, 4, 4, 0]}>
                  {(data.productos_top || []).map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
 
        {/* distribucion por tipo de venta */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-light-text dark:text-dark-text">
              ventas por tipo
            </h2>
            <ShoppingCart size={14} className="text-primary/50" />
          </div>
          {(data.ventas_por_tipo || []).length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-dark-text/40 text-center py-8">
              sin datos disponibles
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={data.ventas_por_tipo || []}
                  dataKey="total" nameKey="tipo_venta"
                  cx="50%" cy="50%" outerRadius={70}
                  label={({ tipo_venta, percent }) =>
                    `${tipo_venta} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: '#A6E8B2' }}>
                  {(data.ventas_por_tipo || []).map((_, i) => (
                    <Cell key={i} fill={COLORES[i % COLORES.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle}
                  formatter={v => [formatPrecio(v), 'total']} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
 
      {/* resumen del mes en tabla */}
      <div className="card">
        <h2 className="text-sm font-medium text-light-text dark:text-dark-text mb-4">
          ventas por mes
        </h2>
        {ventasMes.length === 0 ? (
          <p className="text-xs text-gray-400 dark:text-dark-text/40 text-center py-6">
            sin datos del mes actual
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ventasMes}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A3040" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#A6E8B2' }} />
              <YAxis tick={{ fontSize: 11, fill: '#A6E8B2' }} width={70}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...tooltipStyle}
                formatter={v => [formatPrecio(v), 'ventas']} />
              <Bar dataKey="total" fill="#A6E8B2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}