import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export default function PromotionalBanners() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Link to="/productos"
        className="group relative rounded-2xl overflow-hidden h-36 block"
        style={{ background: 'linear-gradient(135deg, #1D6B2B 0%, #2D8F50 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, white 0%, transparent 60%)' }} />
        <div className="relative p-6 h-full flex flex-col justify-between">
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">Compra en Mostrador</h3>
            <p className="text-white/80 text-sm mt-1">Visítanos y lleva lo que necesitas</p>
          </div>
          <div className="flex items-center gap-1 text-white/90 text-xs font-medium group-hover:gap-2 transition-all">
            Ver productos <ArrowRight size={12} />
          </div>
        </div>
      </Link>

      <Link to="/productos"
        className="group relative rounded-2xl overflow-hidden h-36 block"
        style={{ background: 'linear-gradient(135deg, #1D3326 0%, #2D8F50 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 60%)' }} />
        <div className="relative p-6 h-full flex flex-col justify-between">
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">Productos Frescos</h3>
            <p className="text-white/80 text-sm mt-1">Selección diaria de calidad</p>
          </div>
          <div className="flex items-center gap-1 text-white/90 text-xs font-medium group-hover:gap-2 transition-all">
            Explorar <ArrowRight size={12} />
          </div>
        </div>
      </Link>
    </section>
  )
}