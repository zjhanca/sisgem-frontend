import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Package } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'

export default function ProductoModal({ producto, onCerrar }) {
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => { setImgIdx(0) }, [producto?.id])

  if (!producto) return null

  const imagenes = (() => {
    let imgs = producto.imagenes
    if (typeof imgs === 'string') { try { imgs = JSON.parse(imgs) } catch { imgs = [] } }
    if (Array.isArray(imgs) && imgs.length > 0) {
      const limpias = imgs.filter(Boolean)
      if (limpias.length > 0) return limpias
    }
    return producto.imagen_url ? [producto.imagen_url] : []
  })()

  const prev = e => { e.stopPropagation(); setImgIdx(i => (i - 1 + imagenes.length) % imagenes.length) }
  const next = e => { e.stopPropagation(); setImgIdx(i => (i + 1) % imagenes.length) }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onCerrar}>
      <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fadeIn"
        onClick={e => e.stopPropagation()}>

        <div className="relative h-64 bg-gray-50 dark:bg-dark-bg">
          {imagenes.length > 0 ? (
            <>
              <img src={imagenes[imgIdx]} alt={producto.nombre} className="w-full h-full object-cover"
                onError={e => e.target.style.display='none'} />
              {imagenes.length > 1 && (<>
                <button onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40
                    flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40
                    flex items-center justify-center text-white hover:bg-black/60 transition-colors">
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {imagenes.map((_, i) => (
                    <span key={i} className={`rounded-full transition-all ${i === imgIdx ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-white/60'}`} />
                  ))}
                </div>
              </>)}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-dark-border">
              <Package size={48} />
            </div>
          )}
          {producto.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-medium bg-black/60 px-3 py-1.5 rounded-full">Agotado</span>
            </div>
          )}
          <button onClick={onCerrar}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center
              text-white hover:bg-black/60 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-3 max-h-[45vh] overflow-y-auto">
          <div>
            {(producto.categoria || producto.marca) && (
              <p className="text-xs text-gray-400">
                {producto.categoria}{producto.categoria && producto.marca ? ' · ' : ''}{producto.marca}
              </p>
            )}
            <h2 className="text-lg font-bold text-light-text dark:text-dark-text mt-0.5">{producto.nombre}</h2>
          </div>

          <p className="text-2xl font-extrabold text-primary">{formatPrecio(producto.precio)}</p>

          {producto.stock > 0 && producto.stock <= 5 && (
            <p className="text-xs text-orange-500 font-medium">Quedan solo {producto.stock} unidades</p>
          )}

          {producto.descripcion && (
            <div className="pt-2 border-t border-gray-100 dark:border-dark-border">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Descripción</p>
              <p className="text-sm text-light-text dark:text-dark-text leading-relaxed">{producto.descripcion}</p>
            </div>
          )}

          {producto.codigo_barras && (
            <p className="text-xs text-gray-400 font-mono">Código: {producto.codigo_barras}</p>
          )}
        </div>
      </div>
    </div>
  )
}