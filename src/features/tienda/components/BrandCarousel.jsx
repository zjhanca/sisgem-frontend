export default function BrandCarousel({ marcas }) {
  if (!marcas.length) return null

  return (
    <section>
      <h2 className="text-sm font-bold text-light-text dark:text-dark-text tracking-wide uppercase mb-3">Marcas</h2>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {marcas.map(m => (
          <div key={m.id}
            className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl
              bg-light-card dark:bg-dark-card border border-gray-100 dark:border-dark-border
              hover:border-primary/30 transition-all">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-50 dark:bg-dark-bg
              border border-gray-100 dark:border-dark-border flex items-center justify-center shrink-0">
              {m.logo
                ? <img src={m.logo} alt={m.nombre} className="w-full h-full object-contain p-0.5"
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                : null}
              <div className={`${m.logo ? 'hidden' : 'flex'} w-full h-full items-center justify-center
                bg-primary/10 font-bold text-primary text-sm`}>
                {m.nombre?.charAt(0).toUpperCase()}
              </div>
            </div>
            <span className="text-xs font-medium text-light-text dark:text-dark-text whitespace-nowrap">{m.nombre}</span>
          </div>
        ))}
      </div>
    </section>
  )
}