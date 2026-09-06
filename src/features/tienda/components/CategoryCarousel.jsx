import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'

export default function CategoryCarousel({ categorias = [] }) {
  if (!categorias.length) return null

  return (
    <>
      <section className="bg-white py-14 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Título */}
          <div className="text-center mb-10">
            <p className="text-primary text-xs font-bold tracking-widest uppercase mb-2">
              Lo que encontrarás
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">
              Nuestras Categorías
            </h2>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="h-0.5 w-10 bg-primary" />
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="h-0.5 w-10 bg-primary" />
            </div>
          </div>

          {/* Grid categorías */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {categorias.slice(0, 12).map(cat => (
              <Link key={cat.id} to={`/productos?categoria=${cat.id}`}
                className="group flex flex-col items-center gap-2.5 p-3 rounded-2xl
                  border border-gray-100 hover:border-primary/40 hover:shadow-lg
                  transition-all duration-300 hover:-translate-y-1 bg-white">

                {/* Imagen circular */}
                <div className="w-16 h-16 rounded-full overflow-hidden
                  border-4 border-primary/20 group-hover:border-primary
                  transition-all shadow-md bg-gray-50 shrink-0">
                  {cat.imagen_url ? (
                    <img src={cat.imagen_url} alt={cat.nombre}
                      className="w-full h-full object-cover"
                      onError={e => e.target.style.display = 'none'} />
                  ) : cat.icono ? (
                    <img src={cat.icono} alt={cat.nombre}
                      className="w-full h-full object-contain p-2"
                      onError={e => e.target.style.display = 'none'} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10">
                      <Package size={22} className="text-primary/60" />
                    </div>
                  )}
                </div>

                <p className="text-xs font-bold text-gray-800 text-center leading-tight
                  group-hover:text-primary transition-colors">
                  {cat.nombre}
                </p>

                <span className="text-xs border border-primary/40 text-primary px-2.5 py-0.5
                  rounded-full group-hover:bg-primary group-hover:text-white
                  transition-all font-medium">
                  Ver más
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Ola separadora */}
      <div className="bg-white">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,24 C360,48 1080,0 1440,24 L1440,48 L0,48 Z" fill="#f0fdf4" />
        </svg>
      </div>
    </>
  )
}