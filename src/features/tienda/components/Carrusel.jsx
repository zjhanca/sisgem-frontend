import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const BANNERS = [
  {
    id: 1,
    imagen: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1400&q=80',
    titulo: 'Frescos Todos los Días',
    subtitulo: 'Frutas y verduras del campo a tu mesa',
    cta: 'Ver productos',
  },
  {
    id: 2,
    imagen: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1400&q=80',
    titulo: 'Lo Mejor del Mercado',
    subtitulo: 'Selección especial de productos frescos',
    cta: 'Explorar',
  },
  {
    id: 3,
    imagen: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1400&q=80',
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
    timer.current = setInterval(() => setIdx(i => (i + 1) % BANNERS.length), 5000)
  }

  useEffect(() => { resetTimer(); return () => clearInterval(timer.current) }, [])

  const ir   = i  => { setIdx(i); resetTimer() }
  const prev = () => { setIdx(i => (i - 1 + BANNERS.length) % BANNERS.length); resetTimer() }
  const next = () => { setIdx(i => (i + 1) % BANNERS.length); resetTimer() }

  return (
    <section className="relative w-full overflow-hidden rounded-none sm:rounded-2xl h-52 sm:h-72 md:h-96 select-none bg-gray-900">
      {BANNERS.map((b, i) => (
        <div key={b.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <img src={b.imagen} alt={b.titulo} className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center px-8 sm:px-16 max-w-2xl">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow">{b.titulo}</h2>
            <p className="text-sm sm:text-base text-white/80 mt-2 drop-shadow">{b.subtitulo}</p>
            <a href="/productos"
              className="mt-4 inline-flex items-center gap-2 self-start px-5 py-2.5 rounded-full
                bg-primary text-dark-bg font-semibold text-sm hover:bg-primary/90 transition-colors shadow-lg">
              {b.cta}
            </a>
          </div>
        </div>
      ))}

      <button onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50
          flex items-center justify-center text-white transition-colors backdrop-blur-sm">
        <ChevronLeft size={18} />
      </button>
      <button onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50
          flex items-center justify-center text-white transition-colors backdrop-blur-sm">
        <ChevronRight size={18} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => ir(i)}
            className={`rounded-full transition-all duration-300 ${i === idx ? 'w-6 h-2 bg-primary' : 'w-2 h-2 bg-white/50'}`} />
        ))}
      </div>
    </section>
  )
}