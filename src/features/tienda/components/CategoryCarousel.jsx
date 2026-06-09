export default function CategoryCarousel({ categorias }) {
  if (!categorias.length) return null

  return (
    <section>
      <h2 className="text-sm font-semibold text-light-text dark:text-dark-text mb-4">Categorías</h2>
      <div className="flex gap-5 overflow-x-auto pb-1 scrollbar-hide">
        {categorias.map((cat, i) => (
          <div key={cat.id} className="shrink-0 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-md shadow-primary/20 px-2">
              <span className="text-xs font-semibold text-white text-center leading-tight line-clamp-3">
                {cat.nombre}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}