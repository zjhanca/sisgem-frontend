import { useNavigate } from 'react-router-dom'

const ICONOS = ['🥦','🥛','🍗','🧴','🍞','🧃','🍫','🧹','🥚','🛒','🧀','🌽']

export default function CategoryCarousel({ categorias }) {
  const navigate = useNavigate()
  if (!categorias.length) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-light-text dark:text-dark-text tracking-wide uppercase">Categorías</h2>
        <a href="/productos" className="text-xs text-primary hover:underline">Ver todas →</a>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categorias.map((cat, i) => (
          <button key={cat.id}
            onClick={() => navigate(`/productos?categoria=${cat.id}`)}
            className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-dark-border
              bg-light-card dark:bg-dark-card text-xs font-medium text-light-text dark:text-dark-text
              hover:border-primary/50 hover:text-primary transition-all whitespace-nowrap">
            <span className="text-sm">{ICONOS[i % ICONOS.length]}</span>
            {cat.nombre}
          </button>
        ))}
      </div>
    </section>
  )
}