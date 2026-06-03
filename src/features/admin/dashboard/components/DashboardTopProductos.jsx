import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Package } from 'lucide-react'

const COLORES = ['#A6E8B2', '#7CCF92', '#4CAF6E', '#2D8F50', '#1A6635']

const tooltipStyle = {
  contentStyle: { background: '#0F1C22', border: '1px solid #1A3040', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#A6E8B2' },
  itemStyle:  { color: '#EAF7EE' },
}

export default function DashboardTopProductos({ productos }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-light-text dark:text-dark-text">Productos Más Vendidos</h2>
        <Package size={14} className="text-primary/50" />
      </div>
      {!productos?.length ? (
        <p className="text-xs text-gray-400 dark:text-dark-text/40 text-center py-8">Sin datos disponibles</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={productos}
              dataKey="total_vendido"
              nameKey="nombre"
              cx="50%" cy="50%"
              outerRadius={70}
              innerRadius={30}
              paddingAngle={3}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: '#A6E8B2' }}>
              {productos.map((_, i) => (
                <Cell key={i} fill={COLORES[i % COLORES.length]} />
              ))}
            </Pie>
            <Tooltip {...tooltipStyle} formatter={(v, name) => [v + ' uds', name]} />
            <Legend
              formatter={value => <span style={{ fontSize: 11, color: '#EAF7EE' }}>{value}</span>}
              iconType="circle" iconSize={8} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}