import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Package, ArrowRight } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'

function ProductCard({ prod }) {
  const navigate = useNavigate()

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
    <div onClick={() => navigate(`/producto/${prod.id}`)}
      className="bg-white rounded-2xl border border-gray-100
        hover:border-primary/30 hover:shadow-xl transition-all duration-300
        hover:-translate-y-1 group flex flex-col overflow-hidden cursor-pointer">

      {/* Imagen */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {imagenes.length > 0 ? (
          <>
            <img src={imagenes[imgIdx]} alt={prod.nombre}
              className="w-full h-full object-cover group-hover:scale-105
                transition-transform duration-500"
              onError={e => e.target.style.display = 'none'} />
            {imagenes.length > 1 && (<>
              <button onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full
                  bg-black/40 flex items-center justify-center text-white
                  opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronLeft size={12} />
              </button>
              <button onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full
                  bg-black/40 flex items-center justify-center text-white
                  opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={12} />
              </button>
            </>)}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={40} className="text-gray-200" />
          </div>
        )}

        {prod.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xs font-semibold px-3 py-1
              rounded-full bg-black/60">Agotado</span>
          </div>
        )}
        {prod.stock > 0 && prod.stock <= 5 && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white
            text-xs px-2 py-0.5 rounded-full font-semibold">
            ¡Últimas!
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1 flex-1">
        {prod.categoria && (
          <p className="text-xs text-gray-400">{prod.categoria}</p>
        )}
        <p className="text-xs font-bold text-gray-800 line-clamp-2 leading-snug flex-1
          group-hover:text-primary transition-colors">
          {prod.nombre}
        </p>
        <p className="text-sm font-extrabold text-primary mt-1">
          {formatPrecio(prod.precio)}
        </p>
      </div>
    </div>
  )
}

export default function FeaturedProducts({ productos = [] }) {
  const top = productos.filter(p => p.stock > 0).slice(0, 10)
  if (!top.length) return null

  return (
    <>
      <section className="bg-[#f0fdf4] py-14 px-4">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-primary text-xs font-bold tracking-widest uppercase mb-1">
                Lo más popular
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                Productos Destacados
              </h2>
            </div>
            <Link to="/productos"
              className="hidden md:flex items-center gap-1.5 text-sm font-semibold
                text-primary hover:gap-3 transition-all">
              Ver todos <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {top.map(prod => <ProductCard key={prod.id} prod={prod} />)}
          </div>

          <div className="flex justify-center mt-8 md:hidden">
            <Link to="/productos"
              className="inline-flex items-center gap-2 border-2 border-primary
                text-primary font-bold px-6 py-2.5 rounded-full
                hover:bg-primary hover:text-white transition-all text-sm">
              Ver todos los productos <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Ola inferior */}
      <div className="bg-[#f0fdf4]">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,24 C360,0 1080,48 1440,24 L1440,48 L0,48 Z" fill="#ffffff" />
        </svg>
      </div>
    </>
  )
}