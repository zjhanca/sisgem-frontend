import { ShoppingCart } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'
 
export default function CatalogoCard({ prod, agregarAlCarrito }) {
  return (
    <div className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border
      hover:border-primary/40 hover:shadow-md transition-all group flex flex-col">
 
      <div className="relative h-36 rounded-t-xl overflow-hidden bg-gray-50 dark:bg-dark-bg">
        {prod.imagen_url
          ? <img
              src={prod.imagen_url} alt={prod.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={e => e.target.style.display='none'}
            />
          : <div className="w-full h-full flex items-center justify-center text-4xl">🛒</div>
        }
        {prod.stock === 0 && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-t-xl">
            <span className="text-white text-xs font-medium bg-black/60 px-2 py-1 rounded-full">Agotado</span>
          </div>
        )}
        {prod.stock > 0 && prod.stock <= 5 && (
          <span className="absolute top-2 right-2 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
            Quedan {prod.stock}
          </span>
        )}
      </div>
 
      <div className="p-2.5 flex flex-col flex-1">
        <p className="text-xs font-medium text-light-text dark:text-dark-text line-clamp-2 flex-1">
          {prod.nombre}
        </p>
        {prod.categoria && <p className="text-xs text-gray-400 mt-0.5">{prod.categoria}</p>}
        {prod.marca     && <p className="text-xs text-gray-400">{prod.marca}</p>}
        <p className="text-sm font-bold text-primary mt-2">{formatPrecio(prod.precio)}</p>
        <button
          onClick={() => agregarAlCarrito(prod)}
          disabled={prod.stock === 0}
          className="mt-2 w-full py-1.5 text-xs font-medium rounded-lg border border-primary/40
            text-primary hover:bg-primary hover:text-dark-bg transition-colors
            flex items-center justify-center gap-1
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary">
          <ShoppingCart size={11} />
          {prod.stock === 0 ? 'Agotado' : 'Agregar'}
        </button>
      </div>
    </div>
  )
}
