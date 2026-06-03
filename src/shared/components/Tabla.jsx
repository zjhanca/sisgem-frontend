import { useState, useMemo } from 'react'
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
 
export default function Tabla({
  columnas = [],
  datos = [],
  acciones,
  sinBusqueda = false,
  porPagina = 10,
  filtros,
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
    <div className="space-y-3 animate-fadeIn">
      {/* barra superior */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap flex-1">
          {!sinBusqueda && (
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                value={busqueda}
                onChange={e => handleBusqueda(e.target.value)}
                placeholder="Buscar..."
                className="pl-8 pr-3 py-1.5 text-sm rounded-lg border
                  bg-light-bg dark:bg-dark-bg/60
                  border-gray-200 dark:border-dark-border
                  text-light-text dark:text-dark-text
                  placeholder:text-gray-400/60
                  focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10
                  transition-all duration-150 w-52"
              />
            </div>
          )}
          {filtros && filtros}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-400 dark:text-dark-text/35">
            {filtrados.length} registro{filtrados.length !== 1 ? 's' : ''}
          </span>
          <select value={porPag} onChange={e => handlePorPag(e.target.value)}
            className="campo-input w-[90px] text-xs py-1 h-7">
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n} / pág</option>)}
          </select>
        </div>
      </div>
 
      {/* tabla */}
      <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-dark-border/60 shadow-sm dark:shadow-none">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-light-bg dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border/60">
              {columnas.map(col => (
                <th key={col.key} className="tabla-header">{col.label}</th>
              ))}
              {acciones && (
                <th className="tabla-header text-right">Acciones</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-dark-border/30">
            {filasPagina.length === 0 ? (
              <tr>
                <td colSpan={columnas.length + (acciones ? 1 : 0)}
                  className="text-center py-12 text-sm text-gray-400 dark:text-dark-text/30">
                  {busqueda ? `Sin resultados para "${busqueda}"` : 'Sin registros'}
                </td>
              </tr>
            ) : filasPagina.map((fila, i) => (
              <tr key={fila.id ?? i}
                className="bg-light-card dark:bg-dark-card hover:bg-primary/4 transition-colors duration-100">
                {columnas.map(col => (
                  <td key={col.key} className="tabla-celda">
                    {col.render ? col.render(fila) : (fila[col.key] ?? '—')}
                  </td>
                ))}
                {acciones && (
                  <td className="tabla-celda">
                    <div className="flex items-center justify-end gap-0.5">
                      {acciones(fila)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
 
      {/* paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <p className="text-xs text-gray-400 dark:text-dark-text/35">
            {inicio + 1}–{Math.min(inicio + porPag, filtrados.length)} de {filtrados.length}
          </p>
          <div className="flex items-center gap-1">
            {[
              { icon: ChevronsLeft,  action: () => setPagina(1),                      disabled: paginaActual === 1 },
              { icon: ChevronLeft,   action: () => setPagina(p => Math.max(1, p - 1)), disabled: paginaActual === 1 },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} disabled={btn.disabled}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-dark-border
                  text-gray-400 hover:border-primary/40 hover:text-primary
                  transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed">
                <btn.icon size={12} />
              </button>
            ))}
            {paginasVisibles().map(n => (
              <button key={n} onClick={() => setPagina(n)}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-all duration-150 ${
                  n === paginaActual
                    ? 'bg-primary text-dark-bg shadow-sm'
                    : 'border border-gray-200 dark:border-dark-border text-gray-500 hover:border-primary/40 hover:text-primary'
                }`}>
                {n}
              </button>
            ))}
            {[
              { icon: ChevronRight,  action: () => setPagina(p => Math.min(totalPaginas, p + 1)), disabled: paginaActual === totalPaginas },
              { icon: ChevronsRight, action: () => setPagina(totalPaginas),                       disabled: paginaActual === totalPaginas },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} disabled={btn.disabled}
                className="p-1.5 rounded-lg border border-gray-200 dark:border-dark-border
                  text-gray-400 hover:border-primary/40 hover:text-primary
                  transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed">
                <btn.icon size={12} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}