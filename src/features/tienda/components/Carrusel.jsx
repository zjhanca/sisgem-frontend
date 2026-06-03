import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Coloca aquí las URLs de tus imágenes. Mientras no tengas imágenes reales,
// usamos placeholders de Unsplash con temática de minimercado.
const BANNERS = [
  {
    id: 1,
    imagen: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80',
    titulo: 'Frescos Todos los Días',
    subtitulo: 'Frutas y verduras del campo a tu mesa',
  },
  {
    id: 2,
    imagen: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&q=80',
    titulo: 'Lo Mejor del Mercado',
    subtitulo: 'Selección especial de productos frescos',
  },
  {
    id: 3,
    imagen: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1200&q=80',
    titulo: 'Tu Minimercado de Confianza',
    subtitulo: 'Calidad y variedad en un solo lugar',
  },
]

export default function Carrusel() {
  const [idx, setIdx] = useState(0)
  const timer = useRef(null)

  const resetTimer = () => {
    clearInterval(timer.current)
    timer.current = setInterval(() => setIdx(i => (i + 1) % BANNERS.length), 5000)
  }

  useEffect(() => {
    resetTimer()
    return () => clearInterval(timer.current)
  }, [])

  const ir   = i  => { setIdx(i); resetTimer() }
  const prev = () => { setIdx(i => (i - 1 + BANNERS.length) % BANNERS.length); resetTimer() }
  const next = () => { setIdx(i => (i + 1) % BANNERS.length); resetTimer() }

  return (
    <section className="relative rounded-2xl overflow-hidden h-56 sm:h-72 md:h-80 select-none bg-gray-900">
      {BANNERS.map((b, i) => (
        <div key={b.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <img src={b.imagen} alt={b.titulo}
            className="w-full h-full object-cover"
            onError={e => e.target.style.display = 'none'} />
          {/* overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h2 className="text-xl md:text-3xl font-bold drop-shadow">{b.titulo}</h2>
            <p className="text-sm md:text-base opacity-90 mt-1 drop-shadow">{b.subtitulo}</p>
          </div>
        </div>
      ))}

      <button onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50
          flex items-center justify-center text-white transition-colors backdrop-blur-sm">
        <ChevronLeft size={16} />
      </button>
      <button onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50
          flex items-center justify-center text-white transition-colors backdrop-blur-sm">
        <ChevronRight size={16} />
      </button>

      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => ir(i)}
            className={`rounded-full transition-all ${i === idx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`} />
        ))}
      </div>
    </section>
  )
}