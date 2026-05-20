import { Link } from 'react-router-dom'
 
const EMOJIS = ['🥑', '🧃', '🍞', '🧴', '🥩', '🧀', '🍫', '🧹', '🥚', '🛒']
 
export default function CategoryCarousel({ categorias }) {
  if (!categorias.length) return null
 
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-light-text dark:text-dark-text">Categorías</h2>
        <Link to="/productos" className="text-xs text-primary hover:underline">Ver todas →</Link>
      </div>
 
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
        {categorias.map((cat, i) => (
          <Link
            key={cat.id}
            to={`/productos?categoria=${cat.id}`}
            className="shrink-0 snap-start flex flex-col items-center gap-2 p-4 w-28
              bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border
              hover:border-primary/50 hover:bg-primary/5 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">
              {EMOJIS[i % EMOJIS.length]}
            </div>
            <span className="text-xs text-center font-medium text-light-text dark:text-dark-text line-clamp-2">
              {cat.nombre}
            </span>
            {cat.total_productos !== undefined && (
              <span className="text-xs text-gray-400">{cat.total_productos} productos</span>
            )}
          </Link>
        ))}
      </div>
    </section>
  )
}
