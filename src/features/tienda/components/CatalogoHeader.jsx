import { Search, Filter, X, Home } from 'lucide-react'
import { Link } from 'react-router-dom'
 
export default function CatalogoHeader({
  busqueda, setBusqueda,
  mostrarFiltros, setMostrarFiltros,
  hayFiltros, limpiarFiltros,
  categorias, marcas,
  categoriaFiltro, marcaFiltro,
}) {
  return (
    <div className="bg-light-card dark:bg-dark-card border-b border-gray-100 dark:border-dark-border px-4 py-3">
      <div className="max-w-6xl mx-auto space-y-2">
 
        {/* breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Home size={11} /> Inicio
          </Link>
          <span>/</span>
          <span className="text-light-text dark:text-dark-text font-medium">Productos</span>
          {categoriaFiltro && (
            <>
              <span>/</span>
              <span className="text-primary">{categorias.find(c => c.id === +categoriaFiltro)?.nombre}</span>
            </>
          )}
          {marcaFiltro && (
            <>
              <span>/</span>
              <span className="text-primary">{marcas.find(m => m.id === +marcaFiltro)?.nombre}</span>
            </>
          )}
        </div>
 
        {/* búsqueda + botón filtros */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border
                bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text
                focus:outline-none focus:border-primary/60 transition-colors"
            />
          </div>
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border transition-colors ${
              mostrarFiltros || hayFiltros
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-200 dark:border-dark-border text-gray-500 hover:border-primary/40'
            }`}>
            <Filter size={13} /> Filtros
            {hayFiltros && (
              <span className="w-4 h-4 rounded-full bg-primary text-dark-bg text-xs flex items-center justify-center">!</span>
            )}
          </button>
          {hayFiltros && (
            <button
              onClick={limpiarFiltros}
              className="px-3 py-2 text-sm rounded-xl border border-red-300 text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors">
              <X size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
