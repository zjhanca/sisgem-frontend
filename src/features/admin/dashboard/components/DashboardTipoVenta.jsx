import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { ShoppingCart } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'
 
const COLORES = ['#A6E8B2', '#7CCF92', '#4CAF6E', '#2D8F50', '#1A6635']
 
const tooltipStyle = {
  contentStyle: { background: '#0F1C22', border: '1px solid #1A3040', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#A6E8B2' },
  itemStyle:  { color: '#EAF7EE' },
}
 
export default function DashboardTipoVenta({ ventasPorTipo }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-light-text dark:text-dark-text">Ventas por Tipo</h2>
        <ShoppingCart size={14} className="text-primary/50" />
      </div>
      {!ventasPorTipo?.length ? (
        <p className="text-xs text-gray-400 dark:text-dark-text/40 text-center py-8">Sin datos disponibles</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={ventasPorTipo}
              dataKey="total" nameKey="tipo_venta"
              cx="50%" cy="50%" outerRadius={70}
              label={({ tipo_venta, percent }) => `${tipo_venta} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#A6E8B2' }}>
              {ventasPorTipo.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
            </Pie>
            <Tooltip {...tooltipStyle} formatter={v => [formatPrecio(v), 'Total']} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
