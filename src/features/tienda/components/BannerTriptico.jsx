const ITEMS = [
  {
    imagen:  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=85',
    titulo:  'Frutas & Verduras',
    desc:    'Del campo directo a tu mesa. Frescura garantizada cada día.',
    tag:     '🌿 Siempre frescos',
    grande:  false,
  },
  {
    imagen:  'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=1200&q=85',
    titulo:  'TODO LO QUE NECESITAS EN UN SOLO LUGAR',
    desc:    'Abarrotes, lácteos, carnes, aseo y mucho más. Tu minimercado de confianza con la mejor calidad y los mejores precios.',
    tag:     '✨ Calidad garantizada',
    grande:  true,
    cta:     'Ver Productos',
    href:    '/productos',
  },
  {
    imagen:  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=85',
    titulo:  'Abarrotes & Más',
    desc:    'Todo para tu hogar. Encuentra lo que buscas al mejor precio.',
    tag:     '🛒 Variedad total',
    grande:  false,
  },
]

export default function BannerTriptico() {
  return (
    <>
      {/* Ola superior */}
      <div className="bg-white">
        <svg viewBox="0 0 1440 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,16 C360,32 1080,0 1440,16 L1440,32 L0,32 Z" fill="#0F1C22" />
        </svg>
      </div>

      <section className="bg-[#0F1C22] py-14 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Título sección */}
          <div className="text-center mb-10">
            <p className="text-primary text-xs font-bold tracking-widest uppercase mb-2">
              Descubre
            </p>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              Nuestro Minimercado
            </h2>
            <div className="flex items-center justify-center gap-3 mt-3">
              <div className="h-0.5 w-10 bg-primary" />
              <div className="w-2 h-2 rounded-full bg-primary" />
              <div className="h-0.5 w-10 bg-primary" />
            </div>
          </div>

          {/* Layout tipo Zenú — centro grande, dos laterales */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.6fr_1fr] gap-4 items-stretch">
            {ITEMS.map((item, i) => (
              <div key={i}
                className={`relative overflow-hidden rounded-3xl group cursor-pointer
                  ${item.grande ? 'md:row-span-1' : ''}`}
                style={{ minHeight: item.grande ? '420px' : '280px' }}>

                {/* Imagen */}
                <img src={item.imagen} alt={item.titulo}
                  className="absolute inset-0 w-full h-full object-cover
                    group-hover:scale-105 transition-transform duration-700"
                  onError={e => e.target.style.display = 'none'} />

                {/* Overlay */}
                <div className={`absolute inset-0 ${
                  item.grande
                    ? 'bg-gradient-to-t from-black/90 via-black/40 to-black/10'
                    : 'bg-gradient-to-t from-black/80 via-black/30 to-transparent'
                }`} />

                {/* Contenido */}
                <div className={`absolute inset-0 flex flex-col justify-end p-6
                  ${item.grande ? 'p-8' : 'p-5'}`}>

                  {/* Tag */}
                  <span className="inline-flex w-fit text-xs font-bold
                    bg-primary/90 text-white px-3 py-1 rounded-full mb-3 backdrop-blur-sm">
                    {item.tag}
                  </span>

                  <h3 className={`font-black text-white leading-tight mb-2
                    ${item.grande ? 'text-xl md:text-2xl' : 'text-base'}`}>
                    {item.titulo}
                  </h3>

                  <p className={`text-white/70 leading-relaxed
                    ${item.grande ? 'text-sm mb-5' : 'text-xs mb-3'}`}>
                    {item.desc}
                  </p>

                  {item.cta && item.href && (
                    <a href={item.href}
                      className="inline-flex items-center gap-2 w-fit
                        bg-yellow-400 hover:bg-yellow-300 text-gray-900
                        font-bold px-5 py-2.5 rounded-full transition-all text-sm
                        hover:-translate-y-0.5 shadow-lg">
                      {item.cta} →
                    </a>
                  )}
                </div>

                {/* Borde verde en hover */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent
                  group-hover:border-primary/50 transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ola inferior */}
      <div className="bg-[#0F1C22]">
        <svg viewBox="0 0 1440 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,16 C360,0 1080,32 1440,16 L1440,32 L0,32 Z" fill="#f0fdf4" />
        </svg>
      </div>
    </>
  )
}