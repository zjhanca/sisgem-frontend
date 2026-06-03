import { Search, SlidersHorizontal, X } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CatalogoHeader({
  busqueda, setBusqueda,
  mostrarFiltros, setMostrarFiltros,
  hayFiltros, limpiarFiltros,
  categorias, marcas,
  categoriaFiltro, marcaFiltro,
}) {
  return (
    <div className="bg-light-card dark:bg-dark-card border-b border-gray-100 dark:border-dark-border px-4 py-4">
      <div className="max-w-6xl mx-auto space-y-3">

        {/* breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
          <span>/</span>
          <span className="text-light-text dark:text-dark-text font-medium">Productos</span>
          {categoriaFiltro && <><span>/</span><span className="text-primary">{categorias.find(c => c.id === +categoriaFiltro)?.nombre}</span></>}
          {marcaFiltro     && <><span>/</span><span className="text-primary">{marcas.find(m => m.id === +marcaFiltro)?.nombre}</span></>}
        </div>

        {/* buscador + botón filtros */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-dark-border
                bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text
                focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-all" />
            {busqueda && (
              <button onClick={() => setBusqueda('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <X size={13} />
              </button>
            )}
          </div>

          <button onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              mostrarFiltros || hayFiltros
                ? 'bg-primary text-dark-bg border-primary'
                : 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-text/60 hover:border-primary/40'
            }`}>
            <SlidersHorizontal size={14} />
            <span className="hidden sm:inline">Filtros</span>
            {hayFiltros && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
          </button>

          {hayFiltros && (
            <button onClick={limpiarFiltros}
              className="p-2.5 rounded-xl border border-red-200 dark:border-red-400/30 text-red-400
                hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors">
              <X size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}