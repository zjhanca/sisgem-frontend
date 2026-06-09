import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function BrandCarousel({ marcas }) {
  if (!marcas.length) return null

  const [idx, setIdx] = useState(0)
  const visible = 6
  const maxIdx = Math.max(0, marcas.length - visible)
  const prev = () => setIdx(i => Math.max(0, i - 1))
  const next = () => setIdx(i => Math.min(maxIdx, i + 1))
  const visibles = marcas.slice(idx, idx + visible)

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-light-text dark:text-dark-text tracking-wide uppercase">Marcas</h2>
        {marcas.length > visible && (
          <div className="flex gap-1">
            <button onClick={prev} disabled={idx === 0}
              className="w-7 h-7 rounded-full border border-gray-200 dark:border-dark-border flex items-center justify-center
                text-gray-400 hover:border-primary/40 hover:text-primary transition-all disabled:opacity-30">
              <ChevronLeft size={13} />
            </button>
            <button onClick={next} disabled={idx >= maxIdx}
              className="w-7 h-7 rounded-full border border-gray-200 dark:border-dark-border flex items-center justify-center
                text-gray-400 hover:border-primary/40 hover:text-primary transition-all disabled:opacity-30">
              <ChevronRight size={13} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-6 gap-4">
        {visibles.map(m => (
          <div key={m.id} className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-100 dark:border-dark-border
              bg-light-card dark:bg-dark-card flex items-center justify-center shadow-sm">
              {m.logo ? (
                <>
                  <img src={m.logo} alt={m.nombre}
                    className="w-full h-full object-contain p-1.5"
                    onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
                  <div className="hidden w-full h-full items-center justify-center bg-primary/10 font-bold text-primary text-lg">
                    {m.nombre?.charAt(0).toUpperCase()}
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-primary/10 font-bold text-primary text-lg">
                  {m.nombre?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-xs text-center text-gray-400 dark:text-dark-text/50 line-clamp-1">{m.nombre}</span>
          </div>
        ))}
      </div>

      {/* dots */}
      {marcas.length > visible && (
        <div className="flex justify-center gap-1.5 mt-4">
          {Array.from({ length: maxIdx + 1 }).map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`rounded-full transition-all ${i === idx ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-gray-300 dark:bg-dark-border'}`} />
          ))}
        </div>
      )}
    </section>
  )
}