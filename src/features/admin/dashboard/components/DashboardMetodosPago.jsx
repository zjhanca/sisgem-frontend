import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { CreditCard } from 'lucide-react'

const COLORES = ['#1E9E50', '#374151', '#6B7280', '#9CA3AF']

const capitalizar = str => str ? str.charAt(0).toUpperCase() + str.slice(1) : str

const tooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 },
  labelStyle:   { color: '#1D3326', fontWeight: 600 },
}

export default function DashboardMetodosPago({ metodosPago = [] }) {
  const datos = metodosPago.map(m => ({
    name:     capitalizar(m.metodo),
    value:    +m.cantidad,
    total:    +m.total,
  }))

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-light-text">Métodos de Pago</h2>
        <CreditCard size={14} className="text-primary/50" />
      </div>
      {!datos.length ? (
        <p className="text-xs text-gray-400 text-center py-8">Sin datos disponibles</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={datos}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {datos.map((_, i) => (
                <Cell key={i} fill={COLORES[i % COLORES.length]} />
              ))}
            </Pie>
            <Tooltip
              {...tooltipStyle}
              formatter={(v, name) => [`${v} transacciones`, name]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={v => <span style={{ fontSize: 11, color: '#374151' }}>{v}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}