import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'

export default function FeaturedProducts({ productos, busqueda, setBusqueda }) {
  const filtrados = productos
    .filter(p => !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .slice(0, busqueda ? 20 : 10)

  return (
    <section>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-base font-semibold text-light-text dark:text-dark-text shrink-0">
          {busqueda ? `Resultados para "${busqueda}"` : 'Productos Destacados'}
        </h2>
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <div className="relative flex-1">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-dark-border
                bg-light-bg dark:bg-dark-bg focus:outline-none focus:border-primary/60 transition-colors" />
          </div>
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="text-xs text-red-400 hover:underline shrink-0">
              Limpiar
            </button>
          )}
          {!busqueda && (
            <Link to="/productos" className="text-xs text-primary hover:underline shrink-0">Ver todos →</Link>
          )}
        </div>
      </div>

      {filtrados.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-400 text-sm">Sin resultados para "{busqueda}"</p>
          <button onClick={() => setBusqueda('')} className="text-primary text-xs mt-2 hover:underline">Limpiar</button>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtrados.map(prod => (
          <div key={prod.id}
            className="bg-light-card dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border
              hover:border-primary/40 hover:shadow-lg transition-all group flex flex-col overflow-hidden">
            <div className="relative h-40 bg-gray-50 dark:bg-dark-bg overflow-hidden">
              {prod.imagen_url ? (
                <img src={prod.imagen_url} alt={prod.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={e => e.target.style.display = 'none'} />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary/40">{prod.nombre?.charAt(0)}</span>
                  </div>
                </div>
              )}
              {prod.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xs font-medium bg-black/60 px-2 py-1 rounded-full">Agotado</span>
                </div>
              )}
              {prod.stock > 0 && prod.stock <= 5 && (
                <span className="absolute top-2 left-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-medium">
                  Últimas {prod.stock}
                </span>
              )}
            </div>
            <div className="p-3 flex flex-col flex-1">
              <p className="text-xs font-medium text-light-text dark:text-dark-text line-clamp-2 flex-1 leading-relaxed">
                {prod.nombre}
              </p>
              {prod.marca && <p className="text-xs text-gray-400 mt-1">{prod.marca}</p>}
              <p className="text-sm font-bold text-primary mt-2">{formatPrecio(prod.precio)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}