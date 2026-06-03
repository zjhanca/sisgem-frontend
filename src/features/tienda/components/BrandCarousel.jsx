import { Link } from 'react-router-dom'

export default function BrandCarousel({ marcas }) {
  if (!marcas.length) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-light-text dark:text-dark-text">Marcas</h2>
        <Link to="/productos" className="text-xs text-primary hover:underline">Ver todas →</Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {marcas.map(m => (
          <Link key={m.id} to={`/productos?marca=${m.id}`}
            className="shrink-0 flex flex-col items-center gap-2 p-4 w-24
              bg-light-card dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border
              hover:border-primary/40 hover:shadow-md transition-all group">
            {m.logo ? (
              <img src={m.logo} alt={m.nombre}
                className="w-10 h-10 object-contain group-hover:scale-110 transition-transform"
                onError={e => e.target.style.display = 'none'} />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center
                font-bold text-primary text-lg group-hover:bg-primary/20 transition-colors">
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