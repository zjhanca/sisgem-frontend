import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatPrecio } from '@shared/utils/validaciones'
 
const tooltipStyle = {
  contentStyle: { background: '#0F1C22', border: '1px solid #1A3040', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#A6E8B2' },
  itemStyle:  { color: '#EAF7EE' },
}
 
export default function DashboardVentasMes({ ventasMes }) {
  return (
    <div className="card">
      <h2 className="text-sm font-medium text-light-text dark:text-dark-text mb-4">Ventas del Mes</h2>
      {!ventasMes?.length ? (
        <p className="text-xs text-gray-400 dark:text-dark-text/40 text-center py-6">Sin datos del mes actual</p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={ventasMes}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A3040" />
            <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#A6E8B2' }} />
            <YAxis tick={{ fontSize: 11, fill: '#A6E8B2' }} width={70}
              tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...tooltipStyle} formatter={v => [formatPrecio(v), 'Ventas']} />
            <Bar dataKey="total" fill="#A6E8B2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
