export default function BrandCarousel({ marcas }) {
  if (!marcas.length) return null

  return (
    <section>
      <h2 className="text-base font-semibold text-light-text dark:text-dark-text mb-4">Marcas</h2>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {marcas.map(m => (
          <div key={m.id}
            className="shrink-0 flex flex-col items-center gap-2.5 p-4 w-28
              bg-light-card dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-dark-border">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-50 dark:bg-dark-bg
              border-2 border-gray-100 dark:border-dark-border flex items-center justify-center">
              {m.logo ? (
                <img src={m.logo} alt={m.nombre}
                  className="w-full h-full object-contain p-1"
                  onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
              ) : null}
              <div className={`${m.logo ? 'hidden' : 'flex'} w-full h-full items-center justify-center
                bg-primary/10 font-bold text-primary text-xl`}>
                {m.nombre?.charAt(0).toUpperCase()}
              </div>
            </div>
            <span className="text-xs font-medium text-center text-light-text dark:text-dark-text line-clamp-2 leading-tight">
              {m.nombre}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}