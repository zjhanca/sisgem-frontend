import { Package, AlertTriangle, TrendingUp } from 'lucide-react'
 
export default function ProductoStats({ productos, filtroStock, setFiltroStock }) {
  const total     = productos.length
  const activos   = productos.filter(p => p.estado).length
  const stockBajo = productos.filter(p => p.stock <= 5 && p.stock > 0 && p.estado).length
  const sinStock  = productos.filter(p => p.stock === 0).length
 
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Package size={16} className="text-primary" />
        </div>
        <div>
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-lg font-bold text-light-text dark:text-dark-text">{total}</p>
        </div>
      </div>
 
      <div className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
          <TrendingUp size={16} className="text-green-500" />
        </div>
        <div>
          <p className="text-xs text-gray-400">Activos</p>
          <p className="text-lg font-bold text-green-500">{activos}</p>
        </div>
      </div>
 
      <div
        onClick={() => setFiltroStock(filtroStock === 'bajo' ? '' : 'bajo')}
        className={`bg-light-card dark:bg-dark-card rounded-xl border p-4 flex items-center gap-3 cursor-pointer transition-all ${
          filtroStock === 'bajo' ? 'border-orange-400 bg-orange-50/30 dark:bg-orange-400/5' : 'border-gray-100 dark:border-dark-border hover:border-orange-400/40'
        }`}>
        <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
          <AlertTriangle size={16} className="text-orange-400" />
        </div>
        <div>
          <p className="text-xs text-gray-400">Stock Bajo</p>
          <p className="text-lg font-bold text-orange-400">{stockBajo}</p>
        </div>
      </div>
 
      <div
        onClick={() => setFiltroStock(filtroStock === 'sin' ? '' : 'sin')}
        className={`bg-light-card dark:bg-dark-card rounded-xl border p-4 flex items-center gap-3 cursor-pointer transition-all ${
          filtroStock === 'sin' ? 'border-red-400 bg-red-50/30 dark:bg-red-400/5' : 'border-gray-100 dark:border-dark-border hover:border-red-400/40'
        }`}>
        <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
          <Package size={16} className="text-red-400" />
        </div>
        <div>
          <p className="text-xs text-gray-400">Sin Stock</p>
          <p className="text-lg font-bold text-red-400">{sinStock}</p>
        </div>
      </div>
    </div>
  )
}
