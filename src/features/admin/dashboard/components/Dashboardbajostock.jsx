import { AlertTriangle } from 'lucide-react'

export default function DashboardBajoStock({ productos }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-light-text">Bajo Stock</h2>
        <AlertTriangle size={14} className="text-amber-500" />
      </div>
      {!productos?.length ? (
        <p className="text-xs text-gray-400 text-center py-8">Todos los productos tienen stock suficiente</p>
      ) : (
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
          {productos.map(p => (
            <div key={p.id} className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-gray-50 dark:bg-dark-bg text-xs">
              <div className="flex items-center gap-2 min-w-0">
                {p.imagen_url
                  ? <img src={p.imagen_url} alt="" className="w-7 h-7 rounded object-cover shrink-0"
                      onError={e => e.target.style.display='none'} />
                  : <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center shrink-0 text-primary/40 text-xs">—</div>
                }
                <span className="truncate font-medium text-light-text">{p.nombre}</span>
              </div>
              <span className={`shrink-0 font-bold ${p.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
                {p.stock === 0 ? 'Sin stock' : `${p.stock} uds`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}