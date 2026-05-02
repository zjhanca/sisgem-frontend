import { useState } from 'react'
import { Search } from 'lucide-react'

export default function Tabla({ columnas, datos, acciones, onBuscar }) {
  const [busqueda, setBusqueda] = useState('')

  const filtrados = datos.filter(fila =>
    Object.values(fila).some(v =>
      String(v).toLowerCase().includes(busqueda.toLowerCase())
    )
  )

  return (
    <div>
      <div className='relative mb-3'>
        <Search size={14} className='absolute left-3 top-2.5 text-dark-text/40' />
        <input value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder='buscar...'
          className='w-full pl-8 pr-3 py-2 text-sm bg-dark-bg dark:bg-dark-bg
            bg-light-bg border border-dark-border rounded-lg text-dark-text
            dark:text-dark-text text-light-text placeholder:text-dark-text/40
            focus:outline-none focus:border-primary'
        />
      </div>
      <div className='overflow-x-auto rounded-lg border border-dark-border'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='bg-dark-card dark:bg-dark-card bg-light-card border-b border-dark-border'>
              {columnas.map(col => (
                <th key={col.key} className='px-3 py-2.5 text-left font-medium
                  text-primary/80 text-xs uppercase tracking-wide'>
                  {col.label}
                </th>
              ))}
              {acciones && <th className='px-3 py-2.5 text-right'>acciones</th>}
            </tr>
          </thead>
          <tbody>
            {filtrados.map((fila, i) => (
              <tr key={fila.id || i}
                className='border-b border-dark-border/50 hover:bg-primary/5
                  transition-colors'>
                {columnas.map(col => (
                  <td key={col.key} className='px-3 py-2 text-dark-text
                    dark:text-dark-text text-light-text'>
                    {col.render ? col.render(fila) : fila[col.key]}
                  </td>
                ))}
                {acciones && (
                  <td className='px-3 py-2 text-right'>
                    <div className='flex justify-end gap-1'>
                      {acciones(fila)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr><td colSpan={columnas.length + 1}
                className='px-3 py-8 text-center text-dark-text/40 text-sm'>
                sin resultados
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
