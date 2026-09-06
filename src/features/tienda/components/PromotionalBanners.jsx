import { ShoppingBag, MapPin, Smartphone } from 'lucide-react'

const METODOS = [
  {
    icon:   MapPin,
    titulo: 'Visítanos en tienda',
    desc:   'Encuéntranos y compra directamente. Te atendemos con gusto.',
    color:  'bg-primary',
  },
  {
    icon:   Smartphone,
    titulo: 'Reserva desde la App',
    desc:   'Elige tus productos y recógelos sin esperas.',
    color:  'bg-green-700',
  },
  {
    icon:   ShoppingBag,
    titulo: 'Paga fácil y rápido',
    desc:   'Efectivo o transferencia. Sin complicaciones.',
    color:  'bg-green-900',
  },
]

export default function PromotionalBanners() {
  return (
    <>
      <section className="bg-white py-14 px-4 relative overflow-hidden">
        {/* Decoración fondo */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
          {[...Array(5)].map((_, i) => (
            <div key={i}
              className="absolute rounded-full border-4 border-primary"
              style={{
                width:  `${120 + i * 40}px`,
                height: `${120 + i * 40}px`,
                top:    `${(i * 23) % 90}%`,
                left:   `${(i * 19) % 90}%`,
              }} />
          ))}
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <p className="text-primary text-xs font-bold tracking-widest uppercase mb-2">
              ¿Cómo comprar?
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">
              Así de fácil es comprar
            </h2>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="h-0.5 w-10 bg-primary" />
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="h-0.5 w-10 bg-primary" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {METODOS.map((m, i) => (
              <div key={i}
                className="group flex flex-col items-center text-center p-8 rounded-3xl
                  border border-gray-100 hover:border-primary/30 hover:shadow-xl
                  transition-all duration-300 hover:-translate-y-1 bg-white">

                <div className={`w-14 h-14 rounded-2xl ${m.color} flex items-center
                  justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                  <m.icon size={26} className="text-white" />
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-2">{m.titulo}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ola inferior */}
      <div className="bg-white">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,24 C360,48 1080,0 1440,24 L1440,48 L0,48 Z" fill="#f0fdf4" />
        </svg>
      </div>
    </>
  )
}