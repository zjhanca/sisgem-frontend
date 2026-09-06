import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatPrecio } from '@shared/utils/validaciones'

const tooltipStyle = {
  contentStyle: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 },
  labelStyle:   { color: '#1D3326', fontWeight: 600 },
  itemStyle:    { color: '#1E9E50' },
}

export default function DashboardVentas({ ventasGrafica, periodoVentas, setPeriodoVentas }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-light-text">Ventas por Periodo</h2>
        <div className="flex gap-1">
          {['semana', 'mes'].map(p => (
            <button key={p} onClick={() => setPeriodoVentas(p)}
              className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                periodoVentas === p
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-200 text-gray-500 hover:border-primary/40'
              }`}>
              {p === 'semana' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>
      {!ventasGrafica?.length ? (
        <p className="text-xs text-gray-400 text-center py-8">Sin datos disponibles</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ventasGrafica}>
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