import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function BrandCarousel({ marcas }) {
  if (!marcas.length) return null

  const [idx, setIdx] = useState(0)
  const visible = 5
  const maxIdx = Math.max(0, marcas.length - visible)
  const prev = () => setIdx(i => Math.max(0, i - 1))
  const next = () => setIdx(i => Math.min(maxIdx, i + 1))
  const visibles = marcas.slice(idx, idx + visible)

  return (
    <section>
      <h2 className="text-sm font-semibold text-light-text dark:text-dark-text mb-4">Marcas</h2>

      <div className="flex items-center gap-3">
        {marcas.length > visible && (
          <button onClick={prev} disabled={idx === 0}
            className="shrink-0 w-7 h-7 rounded-full border border-gray-200 dark:border-dark-border
              flex items-center justify-center text-gray-400 hover:border-primary/40 hover:text-primary
              transition-all disabled:opacity-30">
            <ChevronLeft size={13} />
          </button>
        )}

        <div className="flex-1 grid grid-cols-5 gap-3">
          {visibles.map(m => (
            <Link key={m.id} to={`/productos?marca=${m.id}`}
              className="h-20 rounded-xl overflow-hidden bg-white dark:bg-dark-card
                border border-gray-100 dark:border-dark-border shadow-sm
                flex items-center justify-center p-3
                hover:border-primary/40 hover:shadow-md transition-all">
              {m.logo ? (
                <img src={m.logo} alt={m.nombre}
                  className="max-w-full max-h-full object-contain"
                  onError={e => {
                    e.target.style.display='none'
                    e.target.parentElement.innerHTML = `<span class="text-xs font-semibold text-primary text-center px-1">${m.nombre}</span>`
                  }} />
              ) : (
                <span className="text-xs font-semibold text-primary text-center px-1">{m.nombre}</span>
              )}
            </Link>
          ))}
        </div>

        {marcas.length > visible && (
          <button onClick={next} disabled={idx >= maxIdx}
            className="shrink-0 w-7 h-7 rounded-full border border-gray-200 dark:border-dark-border
              flex items-center justify-center text-gray-400 hover:border-primary/40 hover:text-primary
              transition-all disabled:opacity-30">
            <ChevronRight size={13} />
          </button>
        )}
      </div>

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