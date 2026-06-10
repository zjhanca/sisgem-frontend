import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatPrecio } from '@shared/utils/validaciones'

const tooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#1D3326', fontWeight: 600 },
  itemStyle:  { color: '#1E9E50' },
}

export default function DashboardVentasMes({ ventasMes }) {
  return (
    <div className="card">
      <h2 className="text-sm font-semibold text-light-text mb-4">Ventas del Mes</h2>
      {!ventasMes?.length ? (
        <p className="text-xs text-gray-400 text-center py-6">Sin datos del mes actual</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={ventasMes}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#6b7280' }} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} width={70}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...tooltipStyle} formatter={v => [formatPrecio(v), 'Ventas']} />
            <Bar dataKey="total" fill="#1E9E50" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}