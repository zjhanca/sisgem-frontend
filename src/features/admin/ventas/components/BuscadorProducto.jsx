import { Search, Scan } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'

export default function BuscadorProducto({ prodBusqueda, prodsFiltrados, buscarProducto, buscarPorCodigo, agregarProducto }) {
  return (
    <div className="flex gap-2">
      <div className="flex-1 relative">
        <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
        <input value={prodBusqueda} onChange={e => buscarProducto(e.target.value)}
          className="campo-input pl-8 text-xs"
          placeholder="Buscar por nombre o referencia..." />
        {prodsFiltrados.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-20 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
            {prodsFiltrados.map(p => (
              <button key={p.id} type="button" onClick={() => agregarProducto(p)}
                className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 flex justify-between">
                <div>
                  <span>{p.nombre}</span>
                  {p.codigo_barras && <span className="text-gray-400 font-mono ml-2">{p.codigo_barras}</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-gray-400">Stock: {p.stock}</span>
                  <span className="text-primary">{formatPrecio(p.precio)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="relative">
        <input placeholder="Referencia" className="campo-input w-28 text-xs pr-7"
          inputMode="numeric"
          onInput={e => { e.target.value = e.target.value.replace(/\D/g, '') }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              buscarPorCodigo(e.target.value)
              e.target.value = ''
            }
          }} />
        <Scan size={12} className="absolute right-2 top-2.5 text-gray-400" />
      </div>
    </div>
  )
}