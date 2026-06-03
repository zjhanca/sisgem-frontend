import { Link } from 'react-router-dom'
import { Tag } from 'lucide-react'

const COLORES = [
  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  'bg-orange-500/10 text-orange-600 dark:text-orange-400',
  'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  'bg-teal-500/10 text-teal-600 dark:text-teal-400',
  'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
]

export default function CategoryCarousel({ categorias }) {
  if (!categorias.length) return null

  return (
    <section>
      <h2 className="text-base font-semibold text-light-text dark:text-dark-text mb-4">Categorías</h2>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categorias.map((cat, i) => (
          <Link key={cat.id} to={`/productos?categoria=${cat.id}`}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border border-transparent
              hover:border-primary/30 transition-all font-medium text-xs ${COLORES[i % COLORES.length]}
              bg-opacity-10 hover:scale-105`}>
            <Tag size={11} />
            {cat.nombre}
            {cat.total_productos !== undefined && (
              <span className="opacity-60">({cat.total_productos})</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}