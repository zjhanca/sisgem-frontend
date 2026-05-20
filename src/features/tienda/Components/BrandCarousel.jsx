import { Link } from 'react-router-dom'
 
export default function BrandCarousel({ marcas }) {
  if (!marcas.length) return null
 
  return (
    <section>
      <h2 className="text-base font-semibold text-light-text dark:text-dark-text mb-3">Marcas</h2>
 
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {marcas.map(m => (
          <Link
            key={m.id}
            to={`/productos?marca=${m.id}`}
            className="shrink-0 flex flex-col items-center gap-2 p-3 w-24
              bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border
              hover:border-primary/40 transition-all"
          >
            {m.logo ? (
              <img
                src={m.logo} alt={m.nombre}
                className="w-10 h-10 object-contain"
                onError={e => e.target.style.display = 'none'}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                {m.nombre?.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-xs font-medium text-center text-light-text dark:text-dark-text line-clamp-1">
              {m.nombre}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
