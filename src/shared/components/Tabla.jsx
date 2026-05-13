import { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
 
export default function Tabla({
  columnas = [],
  datos = [],
  acciones,
  sinBusqueda = false,
  porPagina = 10,
}) {
  const [busqueda, setBusqueda] = useState('')
  const [pagina, setPagina]     = useState(1)
  const [porPag, setPorPag]     = useState(porPagina)
 
  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return datos
    const t = busqueda.toLowerCase()
    return datos.filter(fila =>
      columnas.some(col => {
        const val = fila[col.key]
        return val !== null && val !== undefined && String(val).toLowerCase().includes(t)
      })
    )
  }, [datos, busqueda, columnas])
 
  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / porPag))
  const paginaActual = Math.min(pagina, totalPaginas)
  const inicio       = (paginaActual - 1) * porPag
  const filasPagina  = filtrados.slice(inicio, inicio + porPag)
 
  const handleBusqueda = v => { setBusqueda(v); setPagina(1) }
  const handlePorPag   = v => { setPorPag(+v); setPagina(1) }
 
  const paginasVisibles = () => {
    const rango = []
    const delta = 2
    const left  = Math.max(1, paginaActual - delta)
    const right = Math.min(totalPaginas, paginaActual + delta)
    for (let i = left; i <= right; i++) rango.push(i)
    return rango
  }
 
  return (
    <div className="space-y-3">
      {/* barra superior — siempre visible, busqueda opcional */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {!sinBusqueda ? (
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
            <input
              value={busqueda}
              onChange={e => handleBusqueda(e.target.value)}
              placeholder="Buscar..."
              className="pl-8 pr-3 py-1.5 text-sm rounded-xl border border-gray-200
                dark:border-dark-border bg-light-bg dark:bg-dark-bg
                text-light-text dark:text-dark-text focus:outline-none
                focus:border-primary/60 transition-colors w-56"
            />
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span>{filtrados.length} registros</span>
          <select value={porPag} onChange={e => handlePorPag(e.target.value)}
            className="campo-input w-20 text-xs py-1">
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} / pág</option>)}
          </select>
        </div>
      </div>
 
      {/* tabla */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-dark-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-light-bg dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
              {columnas.map(col => (
                <th key={col.key}
                  className="text-left px-3 py-2.5 text-xs font-semibold text-gray-500
                    dark:text-dark-text/50 uppercase tracking-wide whitespace-nowrap">
                  {col.label}
                </th>
              ))}
              {acciones && (
                <th className="text-right px-3 py-2.5 text-xs font-semibold text-gray-500
                  dark:text-dark-text/50 uppercase tracking-wide">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
            {filasPagina.length === 0 ? (
              <tr>
                <td colSpan={columnas.length + (acciones ? 1 : 0)}
                  className="text-center py-10 text-sm text-gray-400 dark:text-dark-text/40">
                  {busqueda ? `Sin resultados para "${busqueda}"` : 'Sin registros'}
                </td>
              </tr>
            ) : filasPagina.map((fila, i) => (
              <tr key={fila.id ?? i}
                className="bg-light-card dark:bg-dark-card hover:bg-primary/5 transition-colors">
                {columnas.map(col => (
                  <td key={col.key} className="px-3 py-2.5 text-light-text dark:text-dark-text">
                    {col.render ? col.render(fila) : (fila[col.key] ?? '—')}
                  </td>
                ))}
                {acciones && (
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      {acciones(fila)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
 
      {/* paginación — siempre visible cuando hay más de 1 página */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-gray-400 dark:text-dark-text/40">
            Mostrando {inicio + 1}–{Math.min(inicio + porPag, filtrados.length)} de {filtrados.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPagina(1)} disabled={paginaActual === 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-dark-border
                text-gray-400 hover:border-primary/40 hover:text-primary transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronsLeft size={13} />
            </button>
            <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={paginaActual === 1}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-dark-border
                text-gray-400 hover:border-primary/40 hover:text-primary transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronLeft size={13} />
            </button>
            {paginasVisibles().map(n => (
              <button key={n} onClick={() => setPagina(n)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
                  n === paginaActual
                    ? 'bg-primary text-dark-bg'
                    : 'border border-gray-200 dark:border-dark-border text-gray-500 hover:border-primary/40'
                }`}>
                {n}
              </button>
            ))}
            <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-dark-border
                text-gray-400 hover:border-primary/40 hover:text-primary transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronRight size={13} />
            </button>
            <button onClick={() => setPagina(totalPaginas)} disabled={paginaActual === totalPaginas}
              className="p-1.5 rounded-lg border border-gray-200 dark:border-dark-border
                text-gray-400 hover:border-primary/40 hover:text-primary transition-colors
                disabled:opacity-30 disabled:cursor-not-allowed">
              <ChevronsRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
 