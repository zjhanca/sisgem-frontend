export default function CategoryCarousel({ categorias }) {
  if (!categorias.length) return null

  return (
    <section>
      <h2 className="text-sm font-semibold text-light-text dark:text-dark-text mb-4">Categorías</h2>
      <div className="flex gap-5 overflow-x-auto pb-1 scrollbar-hide">
        {categorias.map(cat => (
          <div key={cat.id} className="shrink-0 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center
              shadow-md shadow-primary/20 overflow-hidden">
              {cat.icono
                ? <img src={cat.icono} alt={cat.nombre}
                    className="w-full h-full object-cover"
                    onError={e => {
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML = `<span class="text-xs font-semibold text-white text-center px-2 leading-tight">${cat.nombre}</span>`
                    }} />
                : <span className="text-xs font-semibold text-white text-center px-2 leading-tight line-clamp-3">
                    {cat.nombre}
                  </span>
              }
            </div>
            {cat.icono && (
              <span className="text-xs text-center text-gray-400 dark:text-dark-text/50 mt-1.5 w-20 line-clamp-1">
                {cat.nombre}
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}