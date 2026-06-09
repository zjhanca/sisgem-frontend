import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const BANNERS = [
  {
    id: 1,
    imagen: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=85',
    titulo: 'Frescos Todos los Días',
    subtitulo: 'Frutas y verduras del campo a tu mesa',
    cta: 'Ver productos',
  },
  {
    id: 2,
    imagen: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1600&q=85',
    titulo: 'Lo Mejor del Mercado',
    subtitulo: 'Selección especial de productos frescos',
    cta: 'Explorar',
  },
  {
    id: 3,
    imagen: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1600&q=85',
    titulo: 'Tu Minimercado de Confianza',
    subtitulo: 'Calidad y variedad en un solo lugar',
    cta: 'Ver todo',
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
    <section className="relative w-full overflow-hidden h-60 sm:h-80 md:h-[420px] select-none bg-gray-900">
      {BANNERS.map((b, i) => (
        <div key={b.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <img src={b.imagen} alt={b.titulo} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-20">
            <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-2 opacity-90">Minimercado</p>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight max-w-lg">{b.titulo}</h2>
            <p className="text-sm sm:text-base text-white/70 mt-3 max-w-sm">{b.subtitulo}</p>
            <a href="/productos"
              className="mt-5 self-start px-6 py-2.5 rounded-lg bg-primary text-dark-bg font-semibold text-sm
                hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
              {b.cta}
            </a>
          </div>
        </div>
      ))}

      <button onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20
          flex items-center justify-center text-white transition-colors backdrop-blur-sm border border-white/10">
        <ChevronLeft size={16} />
      </button>
      <button onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20
          flex items-center justify-center text-white transition-colors backdrop-blur-sm border border-white/10">
        <ChevronRight size={16} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => ir(i)}
            className={`rounded-full transition-all duration-300 ${i === idx ? 'w-5 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-white/30'}`} />
        ))}
      </div>
    </section>
  )
}