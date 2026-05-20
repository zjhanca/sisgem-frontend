import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'
import CatalogoCard from './CatalogoCard'
 
export default function CatalogoGrid({ productos, isLoading, agregarAlCarrito, limpiarFiltros }) {
 
  // skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border animate-pulse">
            <div className="h-36 bg-gray-200 dark:bg-dark-border rounded-t-xl" />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-1/2" />
              <div className="h-6 bg-gray-200 dark:bg-dark-border rounded mt-2" />
            </div>
          </div>
        ))}
      </div>
    )
  }
 
  // sin resultados
  if (productos.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <p className="text-gray-400 text-base font-medium mb-1">No se encontraron productos</p>
        <p className="text-gray-400 text-sm mb-6">Intenta con otros filtros o términos de búsqueda</p>
        <div className="flex gap-2 justify-center flex-wrap">
          <button onClick={limpiarFiltros} className="btn-primary text-sm">
            Limpiar Filtros
          </button>
          <Link to="/" className="btn-outline text-sm">
            <Home size={13} /> Volver al Inicio
          </Link>
        </div>
      </div>
    )
  }
 
  // grid
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {productos.map(prod => (
        <CatalogoCard key={prod.id} prod={prod} agregarAlCarrito={agregarAlCarrito} />
      ))}
    </div>
  )
}
 
