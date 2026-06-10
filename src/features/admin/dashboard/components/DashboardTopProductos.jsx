import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Package } from 'lucide-react'

const COLORES = ['#1E9E50', '#2DB860', '#3DD170', '#52D980', '#78E49A']

const tooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#1D3326', fontWeight: 600 },
  itemStyle:  { color: '#1E9E50' },
}

export default function DashboardTopProductos({ productos }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-light-text">Productos Más Vendidos</h2>
        <Package size={14} className="text-primary/50" />
      </div>
      {!productos?.length ? (
        <p className="text-xs text-gray-400 text-center py-8">Sin datos disponibles</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={productos} layout="vertical">
            <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis dataKey="nombre" type="category" width={100} tick={{ fontSize: 10, fill: '#374151' }} />
            <Tooltip {...tooltipStyle} formatter={v => [v, 'Unidades']} />
            <Bar dataKey="total_vendido" radius={[0, 4, 4, 0]}>
              {productos.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}