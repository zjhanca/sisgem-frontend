import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'

function ProductCard({ prod }) {
  const imagenes = (() => {
    let imgs = prod.imagenes
    if (typeof imgs === 'string') { try { imgs = JSON.parse(imgs) } catch { imgs = [] } }
    if (Array.isArray(imgs) && imgs.length > 0) {
      const limpias = imgs.filter(Boolean)
      if (limpias.length > 0) return limpias
    }
    return prod.imagen_url ? [prod.imagen_url] : []
  })()

  const [imgIdx, setImgIdx] = useState(0)
  const prev = e => { e.stopPropagation(); setImgIdx(i => (i - 1 + imagenes.length) % imagenes.length) }
  const next = e => { e.stopPropagation(); setImgIdx(i => (i + 1) % imagenes.length) }

  return (
    <div className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border
      hover:border-primary/30 hover:shadow-md transition-all group flex flex-col overflow-hidden">

      <div className="relative h-40 bg-gray-50 dark:bg-dark-bg overflow-hidden">
        {imagenes.length > 0 ? (
          <>
            <img src={imagenes[imgIdx]} alt={prod.nombre}
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              onError={e => e.target.style.display='none'} />
            {imagenes.length > 1 && (<>
              <button onClick={prev}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40
                  flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft size={12} />
              </button>
              <button onClick={next}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/40
                  flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={12} />
              </button>
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                {imagenes.map((_, i) => (
                  <span key={i} className={`rounded-full transition-all ${i === imgIdx ? 'w-3 h-1 bg-primary' : 'w-1 h-1 bg-white/50'}`} />
                ))}
              </div>
            </>)}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl opacity-10">🛒</div>
        )}

        {prod.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-medium px-2.5 py-1 rounded-full bg-black/50">Agotado</span>
          </div>
        )}
        {prod.stock > 0 && prod.stock <= 5 && (
          <span className="absolute top-2 left-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-medium">
            Últimas {prod.stock}
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1 gap-0.5">
        {prod.categoria && <p className="text-xs text-gray-400">{prod.categoria}</p>}
        <p className="text-xs font-semibold text-light-text dark:text-dark-text line-clamp-2 flex-1 leading-snug">
          {prod.nombre}
        </p>
        {prod.marca && <p className="text-xs text-gray-400">{prod.marca}</p>}
        <p className="text-sm font-bold text-primary mt-1.5">{formatPrecio(prod.precio)}</p>
      </div>
    </div>
  )
}

export default function FeaturedProducts({ productos }) {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-light-text dark:text-dark-text tracking-wide uppercase">Productos Destacados</h2>
        <a href="/productos" className="text-xs text-primary hover:underline">Ver todos →</a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {productos.slice(0, 10).map(prod => <ProductCard key={prod.id} prod={prod} />)}
      </div>
    </section>
  )
}