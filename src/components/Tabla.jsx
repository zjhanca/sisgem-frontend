import { useState } from 'react'
import { Search } from 'lucide-react'

export default function Tabla({ columnas, datos = [], acciones, sinBusqueda = false }) {
  const [busqueda, setBusqueda] = useState('')

  const filtrados = busqueda.trim()
    ? datos.filter(fila =>
        Object.values(fila).some(v =>
          String(v ?? '').toLowerCase().includes(busqueda.toLowerCase())
        )
      )
    : datos

  return (
    <div>
      {!sinBusqueda && (
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-2.5 text-gray-400 dark:text-dark-text/40" />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="buscar..."
            className="w-full pl-8 pr-3 py-2 text-sm bg-light-bg dark:bg-dark-bg
              border border-gray-200 dark:border-dark-border rounded-lg
              text-light-text dark:text-dark-text
              placeholder:text-gray-400 dark:placeholder:text-dark-text/30
              focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-dark-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-light-card dark:bg-dark-card border-b border-gray-200 dark:border-dark-border">
              {columnas.map(col => (
                <th key={col.key}
                  className="px-3 py-2.5 text-left text-xs font-medium text-primary/80">
                  {col.label.charAt(0).toUpperCase() + col.label.slice(1)}
                </th>
              ))}
              {acciones && (
                <th className="px-3 py-2.5 text-right text-xs font-medium text-primary/80 pr-4">
                  acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-bg/50">
            {filtrados.map((fila, i) => (
              <tr key={fila.id ?? i}
                className="border-b border-gray-100 dark:border-dark-border/50 hover:bg-primary/5 transition-colors">
                {columnas.map(col => (
                  <td key={col.key} className="px-3 py-2.5 text-sm text-light-text dark:text-dark-text">
                    {col.render ? col.render(fila) : (fila[col.key] ?? '-')}
                  </td>
                ))}
                {acciones && (
                  <td className="px-3 py-2.5 text-right">
                    <div className="flex justify-end gap-1">
                      {acciones(fila)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={columnas.length + (acciones ? 1 : 0)}
                  className="px-3 py-10 text-center text-sm text-gray-400 dark:text-dark-text/40">
                  sin resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtrados.length > 0 && (
        <p className="text-xs text-gray-400 dark:text-dark-text/40 mt-2 text-right">
          {filtrados.length} registro{filtrados.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}