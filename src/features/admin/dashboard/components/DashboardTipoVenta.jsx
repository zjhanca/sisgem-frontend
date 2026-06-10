import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { ShoppingCart } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'

const COLORES = ['#1E9E50', '#2DB860', '#3DD170', '#52D980', '#78E49A']

const tooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#1D3326', fontWeight: 600 },
  itemStyle:  { color: '#1E9E50' },
}

export default function DashboardTipoVenta({ ventasPorTipo }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-light-text">Ventas por Tipo</h2>
        <ShoppingCart size={14} className="text-primary/50" />
      </div>
      {!ventasPorTipo?.length ? (
        <p className="text-xs text-gray-400 text-center py-8">Sin datos disponibles</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={ventasPorTipo} dataKey="total" nameKey="tipo_venta"
              cx="50%" cy="50%" outerRadius={70}
              label={({ tipo_venta, percent }) => `${tipo_venta} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#1E9E50' }}>
              {ventasPorTipo.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
            </Pie>
            <Tooltip {...tooltipStyle} formatter={v => [formatPrecio(v), 'Total']} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}