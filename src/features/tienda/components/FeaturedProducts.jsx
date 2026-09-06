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
      className="bg-white rounded-3xl border border-gray-100
        hover:border-primary/30 hover:shadow-2xl transition-all duration-300
        hover:-translate-y-2 group flex flex-col overflow-hidden cursor-pointer relative">

      {/* Badge categoría */}
      {prod.categoria && (
        <div className="absolute top-3 left-3 z-10">
          <span className="text-xs font-bold bg-white/90 backdrop-blur-sm
            text-primary px-2.5 py-1 rounded-full shadow-sm border border-primary/20">
            {prod.categoria}
          </span>
        </div>
      )}

      {/* Badge stock */}
      {prod.stock > 0 && prod.stock <= 5 && (
        <div className="absolute top-3 right-3 z-10">
          <span className="text-xs font-bold bg-orange-500 text-white
            px-2.5 py-1 rounded-full shadow-sm">
            ¡Últimas!
          </span>
        </div>
      )}

      {/* Imagen */}
      <div className="relative h-52 bg-gray-50 overflow-hidden">
        {imagenes.length > 0 ? (
          <>
            <img src={imagenes[imgIdx]} alt={prod.nombre}
              className="w-full h-full object-cover group-hover:scale-110
                transition-transform duration-700"
              onError={e => e.target.style.display = 'none'} />
            {imagenes.length > 1 && (<>
              <button onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full
                  bg-white/80 backdrop-blur-sm flex items-center justify-center
                  text-gray-600 opacity-0 group-hover:opacity-100 transition-all
                  hover:bg-white shadow-md">
                <ChevronLeft size={14} />
              </button>
              <button onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full
                  bg-white/80 backdrop-blur-sm flex items-center justify-center
                  text-gray-600 opacity-0 group-hover:opacity-100 transition-all
                  hover:bg-white shadow-md">
                <ChevronRight size={14} />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {imagenes.map((_, i) => (
                  <span key={i}
                    className={`rounded-full transition-all ${
                      i === imgIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'
                    }`} />
                ))}
              </div>
            </>)}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Package size={48} className="text-gray-200" />
          </div>
        )}

        {prod.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-sm font-bold px-4 py-2
              rounded-full bg-black/60 backdrop-blur-sm">
              Agotado
            </span>
          </div>
        )}

        {/* Gradiente inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-16
          bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="text-sm font-bold text-gray-800 line-clamp-2 leading-snug flex-1
          group-hover:text-primary transition-colors">
          {prod.nombre}
        </p>

        {prod.marca && (
          <p className="text-xs text-gray-400">{prod.marca}</p>
        )}

        <p className="text-lg font-black text-primary mt-1">
          {formatPrecio(prod.precio)}
        </p>

        {/* Botón ver más */}
        <div className="mt-2 pt-3 border-t border-gray-50">
          <span className="text-xs font-bold text-primary flex items-center gap-1
            group-hover:gap-2 transition-all">
            Ver detalle <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </div>
  )
}

export default function FeaturedProducts({ productos = [] }) {
  const top = productos.filter(p => p.stock > 0).slice(0, 8)
  if (!top.length) return null

  return (
    <>
      <section className="bg-[#f0fdf4] py-16 px-4">
        <div className="max-w-6xl mx-auto">

          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-primary text-xs font-bold tracking-widest uppercase mb-2">
                Lo más popular
              </p>
              <h2 className="text-2xl md:text-4xl font-black text-gray-900">
                Productos Destacados
              </h2>
              <p className="text-gray-400 text-sm mt-2">
                Selección especial de nuestros mejores productos
              </p>
            </div>
            <Link to="/productos"
              className="hidden md:flex items-center gap-2 text-sm font-bold
                text-primary border-2 border-primary px-5 py-2.5 rounded-full
                hover:bg-primary hover:text-white transition-all">
              Ver todos <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {top.map(prod => <ProductCard key={prod.id} prod={prod} />)}
          </div>

          <div className="flex justify-center mt-10 md:hidden">
            <Link to="/productos"
              className="inline-flex items-center gap-2 bg-primary
                text-white font-bold px-8 py-3 rounded-full
                hover:bg-green-700 transition-all text-sm shadow-lg">
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