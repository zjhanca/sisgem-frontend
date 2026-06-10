export default function CategoryCarousel({ categorias }) {
  if (!categorias.length) return null

  return (
    <section>
      <h2 className="text-sm font-semibold text-light-text dark:text-dark-text mb-4">Categorías</h2>
      <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
        {categorias.map(cat => (
          <div key={cat.id} className="shrink-0 flex flex-col items-center gap-2 w-20">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center
              shadow-md shadow-primary/20 overflow-hidden">
              {cat.icono
                ? <img src={cat.icono} alt={cat.nombre}
                    className="w-12 h-12 object-contain"
                    onError={e => {
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML =
                        `<span class="text-xs font-semibold text-white text-center px-2 leading-tight">${cat.nombre}</span>`
                    }} />
                : <span className="text-xs font-semibold text-white text-center px-2 leading-tight">
                    {cat.nombre}
                  </span>
              }
            </div>
            {cat.icono && (
              <span className="text-xs text-center text-light-text dark:text-dark-text leading-tight w-20">
                {cat.nombre}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}