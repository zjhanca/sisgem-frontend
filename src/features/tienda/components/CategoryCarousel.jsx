const ICONOS = ['🥦','🥛','🍗','🧴','🍞','🧃','🍫','🧹','🥚','🛒','🧀','🌽']

export default function CategoryCarousel({ categorias }) {
  if (!categorias.length) return null

  return (
    <section>
      <h2 className="text-sm font-bold text-light-text dark:text-dark-text tracking-wide uppercase mb-4">Categorías</h2>
      <div className="flex gap-6 overflow-x-auto pb-1 scrollbar-hide">
        {categorias.map((cat, i) => (
          <div key={cat.id} className="shrink-0 flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <span className="text-2xl">{ICONOS[i % ICONOS.length]}</span>
            </div>
            <span className="text-xs font-medium text-center text-light-text dark:text-dark-text w-16 line-clamp-2 leading-tight">
              {cat.nombre}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}