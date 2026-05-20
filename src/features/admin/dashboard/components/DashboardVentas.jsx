import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatPrecio } from '@shared/utils/validaciones'
 
const tooltipStyle = {
  contentStyle: { background: '#0F1C22', border: '1px solid #1A3040', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#A6E8B2' },
  itemStyle:  { color: '#EAF7EE' },
}
 
export default function DashboardVentas({ ventasGrafica, periodoVentas, setPeriodoVentas }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-light-text dark:text-dark-text">Ventas por Periodo</h2>
        <div className="flex gap-1">
          {['semana', 'mes'].map(p => (
            <button key={p} onClick={() => setPeriodoVentas(p)}
              className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                periodoVentas === p
                  ? 'bg-primary text-dark-bg border-primary'
                  : 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-text/60'
              }`}>
              {p === 'semana' ? 'Semana' : 'Mes'}
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
          <Tooltip {...tooltipStyle} formatter={v => [formatPrecio(v), 'Ventas']} />
          <Line type="monotone" dataKey="total" stroke="#A6E8B2"
            strokeWidth={2} dot={{ fill: '#A6E8B2', r: 3 }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
