const ICONOS = ['🥦','🥛','🍗','🧴','🍞','🧃','🍫','🧹','🥚','🛒','🧀','🌽']

const COLORES = [
  'bg-emerald-500/10 border-emerald-500/20',
  'bg-blue-500/10 border-blue-500/20',
  'bg-orange-500/10 border-orange-500/20',
  'bg-purple-500/10 border-purple-500/20',
  'bg-rose-500/10 border-rose-500/20',
  'bg-teal-500/10 border-teal-500/20',
  'bg-amber-500/10 border-amber-500/20',
  'bg-indigo-500/10 border-indigo-500/20',
]

const TEXTO = [
  'text-emerald-600 dark:text-emerald-400',
  'text-blue-600 dark:text-blue-400',
  'text-orange-600 dark:text-orange-400',
  'text-purple-600 dark:text-purple-400',
  'text-rose-600 dark:text-rose-400',
  'text-teal-600 dark:text-teal-400',
  'text-amber-600 dark:text-amber-400',
  'text-indigo-600 dark:text-indigo-400',
]

export default function CategoryCarousel({ categorias }) {
  if (!categorias.length) return null

  return (
    <section>
      <h2 className="text-sm font-bold text-light-text dark:text-dark-text tracking-wide uppercase mb-3">Categorías</h2>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {categorias.map((cat, i) => (
          <div key={cat.id}
            className={`shrink-0 flex flex-col items-center gap-2 p-3 w-20 rounded-xl border
              ${COLORES[i % COLORES.length]} transition-all`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl
              ${COLORES[i % COLORES.length]}`}>
              {ICONOS[i % ICONOS.length]}
            </div>
            <span className={`text-xs font-medium text-center leading-tight line-clamp-2 ${TEXTO[i % TEXTO.length]}`}>
              {cat.nombre}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}