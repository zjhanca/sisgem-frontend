import { Search, ShoppingCart, Filter, X } from 'lucide-react'
import { useCatalogo } from '../hooks/useCatalogo'
import { formatPrecio } from '@shared/utils/validaciones'
 
export default function Catalogo({ carrito, setCarrito }) {
  const {
    productos, categorias, marcas, isLoading,
    busqueda, setBusqueda, mostrarFiltros, setMostrarFiltros,
    categoriaFiltro, marcaFiltro, hayFiltros,
    agregarAlCarrito, limpiarFiltros, setCategoria, setMarca,
  } = useCatalogo({ setCarrito })
 
  return (
    <div>
      {/* barra búsqueda + filtros */}
      <div className="bg-light-card dark:bg-dark-card border-b border-gray-100 dark:border-dark-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex gap-2">
          <div className="flex-1 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border
                bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text
                focus:outline-none focus:border-primary/60" />
          </div>
          <button onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-xl border transition-colors ${
              mostrarFiltros || hayFiltros
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-200 dark:border-dark-border text-gray-500'
            }`}>
            <Filter size={13} /> Filtros
            {hayFiltros && <span className="w-4 h-4 rounded-full bg-primary text-dark-bg text-xs flex items-center justify-center">!</span>}
          </button>
          {hayFiltros && (
            <button onClick={limpiarFiltros}
              className="px-3 py-2 text-sm rounded-xl border border-red-300 text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors">
              <X size={13} />
            </button>
          )}
        </div>
      </div>
 
      {/* panel filtros */}
      {mostrarFiltros && (
        <div className="bg-light-bg dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border px-4 py-4">
          <div className="max-w-6xl mx-auto grid grid-cols-2 gap-4">
            <div>
              <label className="campo-label">Categoría</label>
              <select value={categoriaFiltro} onChange={e => setCategoria(e.target.value)} className="campo-input text-sm">
                <option value="">Todas las categorías</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="campo-label">Marca</label>
              <select value={marcaFiltro} onChange={e => setMarca(e.target.value)} className="campo-input text-sm">
                <option value="">Todas las marcas</option>
                {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
 
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-dark-text/60">
            {isLoading ? 'Cargando...' : `${productos.length} productos encontrados`}
          </p>
          {hayFiltros && (
            <div className="flex gap-1 flex-wrap">
              {categoriaFiltro && <span className="badge-proceso text-xs">{categorias.find(c => c.id === +categoriaFiltro)?.nombre}</span>}
              {marcaFiltro     && <span className="badge-proceso text-xs">{marcas.find(m => m.id === +marcaFiltro)?.nombre}</span>}
            </div>
          )}
        </div>
 
        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border animate-pulse">
                <div className="h-36 bg-gray-200 dark:bg-dark-border rounded-t-xl" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
 
        {!isLoading && productos.length === 0 && (
          <div className="text-center py-16">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-400 text-sm">No se encontraron productos</p>
            <button onClick={limpiarFiltros} className="text-primary text-sm mt-2 hover:underline">Limpiar filtros</button>
          </div>
        )}
 
        {!isLoading && productos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {productos.map(prod => (
              <div key={prod.id}
                className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border
                  hover:border-primary/40 hover:shadow-md transition-all group flex flex-col">
                <div className="relative h-36 rounded-t-xl overflow-hidden bg-gray-50 dark:bg-dark-bg">
                  {prod.imagen_url
                    ? <img src={prod.imagen_url} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => e.target.style.display='none'} />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">🛒</div>
                  }
                  {prod.stock <= 5 && prod.stock > 0 && (
                    <span className="absolute top-2 right-2 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">Quedan {prod.stock}</span>
                  )}
                </div>
                <div className="p-2.5 flex flex-col flex-1">
                  <p className="text-xs font-medium text-light-text dark:text-dark-text line-clamp-2 flex-1">{prod.nombre}</p>
                  {prod.categoria && <p className="text-xs text-gray-400 mt-0.5">{prod.categoria}</p>}
                  {prod.marca     && <p className="text-xs text-gray-400">{prod.marca}</p>}
                  <p className="text-sm font-bold text-primary mt-2">{formatPrecio(prod.precio)}</p>
                  <button onClick={() => agregarAlCarrito(prod)}
                    className="mt-2 w-full py-1.5 text-xs font-medium rounded-lg border border-primary/40
                      text-primary hover:bg-primary hover:text-dark-bg transition-colors flex items-center justify-center gap-1">
                    <ShoppingCart size={11} /> Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
