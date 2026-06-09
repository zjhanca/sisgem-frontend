import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function PromotionalBanners() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Link to="/productos"
        className="group relative rounded-xl overflow-hidden h-32 block"
        style={{ background: 'linear-gradient(135deg, #1D6B2B 0%, #2D8F50 100%)' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 90% 50%, white 0%, transparent 55%)' }} />
        <div className="relative p-5 h-full flex flex-col justify-between">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Disponible ahora</p>
            <h3 className="text-white font-bold text-base leading-tight">Compra en Mostrador</h3>
            <p className="text-white/70 text-xs mt-1">Visítanos y lleva lo que necesitas</p>
          </div>
          <div className="flex items-center gap-1 text-white text-xs font-medium group-hover:gap-2 transition-all">
            Ver productos <ArrowRight size={11} />
          </div>
        </div>
      </Link>

      <Link to="/productos"
        className="group relative rounded-xl overflow-hidden h-32 block"
        style={{ background: 'linear-gradient(135deg, #14532d 0%, #166534 100%)' }}>
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 10% 50%, white 0%, transparent 55%)' }} />
        <div className="relative p-5 h-full flex flex-col justify-between">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">Selección diaria</p>
            <h3 className="text-white font-bold text-base leading-tight">Productos Frescos</h3>
            <p className="text-white/70 text-xs mt-1">Calidad garantizada cada día</p>
          </div>
          <div className="flex items-center gap-1 text-white text-xs font-medium group-hover:gap-2 transition-all">
            Explorar <ArrowRight size={11} />
          </div>
        </div>
      </Link>
    </section>
  )
}