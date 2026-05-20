import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
 
const BANNERS = [
  {
    id: 1,
    titulo:    'Frescos Todos los Días',
    subtitulo: 'Frutas y verduras del campo a tu mesa',
    desde:     '#1D6B2B',
    hasta:     '#2D8F50',
    emoji:     '🥑',
    link:      '/productos',
    cta:       'Ver Productos',
  },
  {
    id: 2,
    titulo:    'Ofertas de Temporada',
    subtitulo: 'Descuentos en productos seleccionados',
    desde:     '#1D3326',
    hasta:     '#2D8F50',
    emoji:     '🛒',
    link:      '/productos',
    cta:       'Ver Ofertas',
  },
  {
    id: 3,
    titulo:    'Domicilios en Medellín',
    subtitulo: 'Pedidos rápidos y seguros a tu puerta',
    desde:     '#1A4A7A',
    hasta:     '#2E6EBF',
    emoji:     '🛵',
    link:      '/productos',
    cta:       'Pedir Ahora',
  },
]
 
export default function Carrusel() {
  const [idx, setIdx] = useState(0)
  const timer = useRef(null)
 
  useEffect(() => {
    timer.current = setInterval(() => setIdx(i => (i + 1) % BANNERS.length), 4500)
    return () => clearInterval(timer.current)
  }, [])
 
  const ir   = i  => { setIdx(i);                             clearInterval(timer.current) }
  const prev = () => { setIdx(i => (i - 1 + BANNERS.length) % BANNERS.length); clearInterval(timer.current) }
  const next = () => { setIdx(i => (i + 1) % BANNERS.length); clearInterval(timer.current) }
 
  return (
    <section className="relative rounded-2xl overflow-hidden h-56 sm:h-64 md:h-72 select-none">
      {BANNERS.map((b, i) => (
        <div
          key={b.id}
          style={{ background: `linear-gradient(135deg, ${b.desde}, ${b.hasta})` }}
          className={`absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6
            transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <div className="text-5xl mb-3">{b.emoji}</div>
          <h2 className="text-2xl md:text-3xl font-bold">{b.titulo}</h2>
          <p className="text-sm md:text-base opacity-90 mt-1">{b.subtitulo}</p>
          <Link to={b.link}
            className="mt-4 px-5 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors">
            {b.cta} →
          </Link>
        </div>
      ))}
 
      {/* botones navegación */}
      <button onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/25 hover:bg-black/40
          flex items-center justify-center text-white transition-colors">
        <ChevronLeft size={16} />
      </button>
      <button onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/25 hover:bg-black/40
          flex items-center justify-center text-white transition-colors">
        <ChevronRight size={16} />
      </button>
 
      {/* indicadores */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {BANNERS.map((_, i) => (
          <button key={i} onClick={() => ir(i)}
            className={`rounded-full transition-all ${i === idx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`} />
        ))}
      </div>
    </section>
  )
}
