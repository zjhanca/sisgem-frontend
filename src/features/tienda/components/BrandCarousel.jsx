import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function BrandCarousel({ marcas = [] }) {
  const ref = useRef(null)
  if (!marcas.length) return null

  const scroll = dir => {
    if (ref.current) ref.current.scrollLeft += dir * 220
  }

  return (
    <section className="bg-[#f0fdf4] py-14 px-4">
      <div className="max-w-6xl mx-auto">

        <div className="text-center mb-8">
          <p className="text-primary text-xs font-bold tracking-widest uppercase mb-2">
            Nuestras marcas
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">
            Marcas que manejamos
          </h2>
          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-0.5 w-10 bg-primary" />
            <div className="w-2 h-2 rounded-full bg-primary" />
            <div className="h-0.5 w-10 bg-primary" />
          </div>
        </div>

        <div className="relative">
          <button onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full
              bg-white border border-gray-200 shadow-md flex items-center justify-center
              hover:border-primary hover:text-primary transition-all text-gray-400">
            <ChevronLeft size={16} />
          </button>

          <div ref={ref}
            className="flex gap-4 overflow-x-auto scrollbar-hide px-12
              scroll-smooth snap-x snap-mandatory">
            {marcas.map(m => (
              <Link key={m.id} to={`/productos?marca=${m.id}`}
                className="shrink-0 snap-center w-32 h-24 bg-white rounded-2xl
                  border border-gray-100 hover:border-primary/40 hover:shadow-lg
                  transition-all flex items-center justify-center p-3 group">
                {m.logo || m.imagen_url ? (
                  <img src={m.logo || m.imagen_url} alt={m.nombre}
                    className="max-w-full max-h-full object-contain
                      filter grayscale group-hover:grayscale-0 transition-all"
                    onError={e => e.target.style.display = 'none'} />
                ) : (
                  <span className="text-xs font-bold text-gray-500 text-center
                    group-hover:text-primary transition-colors leading-tight">
                    {m.nombre}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <button onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full
              bg-white border border-gray-200 shadow-md flex items-center justify-center
              hover:border-primary hover:text-primary transition-all text-gray-400">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}