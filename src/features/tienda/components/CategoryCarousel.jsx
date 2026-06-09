import { useNavigate } from 'react-router-dom'

const ICONOS = ['🥦', '🥛', '🍗', '🧴', '🍞', '🧃', '🍫', '🧹', '🥚', '🛒']

const COLORES = [
  'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
  'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
  'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/20',
  'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
  'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
  'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-500/20',
  'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
  'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20',
]

export default function CategoryCarousel({ categorias }) {
  const navigate = useNavigate()
  if (!categorias.length) return null

  return (
    <section>
      <h2 className="text-lg font-bold text-light-text dark:text-dark-text mb-4">Categorías</h2>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
        {categorias.map((cat, i) => (
          <button key={cat.id}
            onClick={() => navigate(`/productos?categoria=${cat.id}`)}
            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all hover:scale-105 hover:shadow-md ${COLORES[i % COLORES.length]}`}>
            <span className="text-2xl">{ICONOS[i % ICONOS.length]}</span>
            <span className="text-xs font-medium text-center leading-tight line-clamp-2">{cat.nombre}</span>
          </button>
        ))}
      </div>
    </section>
  )
}