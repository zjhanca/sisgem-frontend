import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const BANNERS = [
  {
    id: 1,
    imagen:    'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=85',
    titulo:    'FRESCOS TODOS LOS DÍAS',
    subtitulo: 'Frutas y verduras del campo a tu mesa',
    cta:       'Ver Productos',
    href:      '/productos',
  },
  {
    id: 2,
    imagen:    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1600&q=85',
    titulo:    'LO MEJOR DEL MINIMERCADO',
    subtitulo: 'Selección especial de productos frescos',
    cta:       'Explorar Catálogo',
    href:      '/productos',
  },
  {
    id: 3,
    imagen:    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1600&q=85',
    titulo:    'TU MINIMERCADO DE CONFIANZA',
    subtitulo: 'Calidad y variedad en un solo lugar',
    cta:       'Conoce más',
    href:      '/productos',
  },
]

export default function Carrusel() {
  const [idx, setIdx] = useState(0)
  const timer = useRef(null)

  const resetTimer = () => {
    clearInterval(timer.current)
    timer.current = setInterval(() => setIdx(i => (i + 1) % BANNERS.length), 5500)
  }

  useEffect(() => { resetTimer(); return () => clearInterval(timer.current) }, [])

  const ir   = i  => { setIdx(i); resetTimer() }
  const prev = () => { setIdx(i => (i - 1 + BANNERS.length) % BANNERS.length); resetTimer() }
  const next = () => { setIdx(i => (i + 1) % BANNERS.length); resetTimer() }

  return (
    <section className="relative w-full overflow-hidden select-none bg-gray-900">
      {BANNERS.map((b, i) => (
        <div key={b.id}
          className={`absolute inset-0 transition-opacity duration-700
            ${i === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <img src={b.imagen} alt={b.titulo}
            className="w-full h-full object-cover"
            onError={e => e.target.style.display = 'none'} />
          {/* Degradado izquierda */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
        </div>
      ))}

      {/* Contenido del slide activo */}
      <div className="relative z-10 max-w-7xl mx-auto px-8 sm:px-16
        h-[220px] sm:h-[300px] md:h-[420px]
        flex flex-col justify-center gap-4">

        {/* Línea decorativa + etiqueta */}
        <div className="flex items-center gap-2">
          <div className="h-0.5 w-8 bg-yellow-400" />
          <span className="text-yellow-400 text-xs font-bold tracking-widest uppercase">
            Sisgem Minimercado
          </span>
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight max-w-xl">
          {BANNERS[idx].titulo}
        </h2>
        <p className="text-sm sm:text-base text-white/70 max-w-sm">
          {BANNERS[idx].subtitulo}
        </p>

        <Link to={BANNERS[idx].href}
          className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300
            text-gray-900 font-bold px-6 py-2.5 rounded-full transition-all
            shadow-lg hover:-translate-y-0.5 text-sm w-fit mt-1">
          {BANNERS[idx].cta} →
        </Link>

        {/* Dots */}
        <div className="flex gap-1.5 mt-2">
          {BANNERS.map((_, i) => (
            <button key={i} onClick={() => ir(i)}
              className={`rounded-full transition-all duration-300
                ${i === idx ? 'w-6 h-2 bg-yellow-400' : 'w-2 h-2 bg-white/30'}`} />
          ))}
        </div>
      </div>

      {/* Controles */}
      <button onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
          bg-white/15 hover:bg-white/30 flex items-center justify-center
          text-white transition-all backdrop-blur-sm border border-white/20 z-20">
        <ChevronLeft size={18} />
      </button>
      <button onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
          bg-white/15 hover:bg-white/30 flex items-center justify-center
          text-white transition-all backdrop-blur-sm border border-white/20 z-20">
        <ChevronRight size={18} />
      </button>

      {/* Ola separadora inferior */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,24 C360,48 1080,0 1440,24 L1440,48 L0,48 Z" fill="#ffffff" />
        </svg>
      </div>
    </section>
  )
}