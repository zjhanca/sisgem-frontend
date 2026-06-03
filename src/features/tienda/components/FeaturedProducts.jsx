import { Link } from 'react-router-dom'
import { formatPrecio } from '@shared/utils/validaciones'
 
export default function FeaturedProducts({ productos, busqueda, setBusqueda }) {
  const filtrados = productos
    .filter(p => !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .slice(0, busqueda ? 20 : 10)
 
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-light-text dark:text-dark-text">
          {busqueda ? `Resultados para "${busqueda}"` : 'Productos Destacados'}
        </h2>
        <div className="flex items-center gap-2">
          {busqueda && (
            <button onClick={() => setBusqueda('')} className="text-xs text-red-400 hover:underline">
              Limpiar
            </button>
          )}
          {!busqueda && (
            <Link to="/productos" className="text-xs text-primary hover:underline">Ver todos →</Link>
          )}
        </div>
      </div>
 
      {filtrados.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-400 text-sm">No se encontraron productos para "{busqueda}"</p>
          <button onClick={() => setBusqueda('')} className="text-primary text-xs mt-2 hover:underline">
            Limpiar búsqueda
          </button>
        </div>
      )}
 
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtrados.map(prod => (
          <div key={prod.id}
            className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border
              hover:border-primary/40 hover:shadow-sm transition-all group flex flex-col">
            <div className="relative h-36 rounded-t-xl overflow-hidden bg-gray-50 dark:bg-dark-bg">
              {prod.imagen_url ? (
                <img
                  src={prod.imagen_url} alt={prod.nombre}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => e.target.style.display = 'none'}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">🛒</div>
              )}
              {prod.stock <= 5 && prod.stock > 0 && (
                <span className="absolute top-2 right-2 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                  Quedan {prod.stock}
                </span>
              )}
            </div>
            <div className="p-2.5 flex flex-col flex-1">
              <p className="text-xs font-medium text-light-text dark:text-dark-text line-clamp-2 flex-1">
                {prod.nombre}
              </p>
              {prod.marca && <p className="text-xs text-gray-400 mt-0.5">{prod.marca}</p>}
              <p className="text-sm font-bold text-primary mt-1.5">{formatPrecio(prod.precio)}</p>

            </div>
          </div>
        ))}
      </div>
    </section>
  )
}