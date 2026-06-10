export default function CategoryCarousel({ categorias }) {
  if (!categorias.length) return null

  return (
    <section>
      <h2 className="text-sm font-semibold text-light-text mb-4">Categorías</h2>
      <div className="flex gap-5 overflow-x-auto pb-1 scrollbar-hide">
        {categorias.map(cat => (
          <div key={cat.id} className="shrink-0 flex flex-col items-center gap-2 w-20">
            <div className="w-20 h-20 rounded-full bg-light-text flex items-center justify-center
              shadow-md overflow-hidden">
              {cat.icono
                ? <img src={cat.icono} alt={cat.nombre}
                    className="w-12 h-12 object-contain"
                    onError={e => {
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML =
                        `<span style="color:#A6E8B2;font-size:11px;font-weight:600;text-align:center;padding:8px;line-height:1.2">${cat.nombre}</span>`
                    }} />
                : <span className="text-xs font-semibold text-primary text-center px-2 leading-tight">
                    {cat.nombre}
                  </span>
              }
            </div>
            {cat.icono && (
              <span className="text-xs text-center text-light-text leading-tight w-20 font-medium">
                {cat.nombre}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}