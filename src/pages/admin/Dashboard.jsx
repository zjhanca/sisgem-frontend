import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ShoppingCart, DollarSign, Package, Clock } from 'lucide-react'

function StatCard({ icon: Icon, label, valor, color }) {
  return (
    <div className='card flex items-center gap-3'>
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon size={18} className='text-dark-bg' />
      </div>
      <div>
        <p className='text-xs text-dark-text/60'>{label}</p>
        <p className='text-lg font-medium text-dark-text dark:text-dark-text text-light-text'>
          {valor}
        </p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then(r => r.data.datos),
    refetchInterval: 60000 // actualiza cada minuto
  })

  if (!data) return <div className='text-dark-text/40 text-sm'>cargando...</div>

  return (
    <div className='space-y-4'>
      <h1 className='text-lg font-medium text-dark-text dark:text-dark-text text-light-text'>
        dashboard
      </h1>

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
        <StatCard icon={DollarSign} label='ventas hoy'
          valor={`$${parseFloat(data.ventas_hoy.monto_total).toLocaleString('es-CO')}`}
          color='bg-primary' />
        <StatCard icon={ShoppingCart} label='pedidos hoy'
          valor={data.ventas_hoy.total_pedidos}
          color='bg-primary' />
        <StatCard icon={Clock} label='pendientes'
          valor={data.pedidos_pendientes}
          color='bg-yellow-500' />
        <StatCard icon={Package} label='top producto'
          valor={data.productos_top[0]?.nombre || '-'}
          color='bg-primary-mid' />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <div className='card'>
          <h2 className='text-sm font-medium text-dark-text/70 mb-3'>ventas por dia</h2>
          <ResponsiveContainer width='100%' height={180}>
            <LineChart data={data.ventas_semana}>
              <XAxis dataKey='dia' tick={{ fontSize: 11, fill: '#A6E8B2' }} />
              <YAxis tick={{ fontSize: 11, fill: '#A6E8B2' }} />
              <Tooltip
                contentStyle={{ background: '#0F1C22', border: '1px solid #1A3040', borderRadius: 8 }}
                labelStyle={{ color: '#A6E8B2' }}
                itemStyle={{ color: '#EAF7EE' }}
              />
              <Line type='monotone' dataKey='total' stroke='#A6E8B2'
                strokeWidth={2} dot={{ fill: '#A6E8B2', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className='card'>
          <h2 className='text-sm font-medium text-dark-text/70 mb-3'>productos mas vendidos</h2>
          <div className='space-y-2'>
            {data.productos_top.map((p, i) => (
              <div key={i} className='flex justify-between items-center'>
                <span className='text-sm text-dark-text dark:text-dark-text text-light-text'>
                  {p.nombre}
                </span>
                <span className='text-xs text-primary'>{p.total_vendido} uds</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
