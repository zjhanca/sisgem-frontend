import { useEffect, useRef } from 'react'
import { Search, Scan, X, Plus } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'

export default function ModalBuscadorProducto({
  abierto, onCerrar,
  prodBusqueda, prodsFiltrados,
  buscarProducto, buscarPorCodigo, agregarProducto,
}) {
  const inputRef = useRef(null)

  useEffect(() => {
    if (abierto) setTimeout(() => inputRef.current?.focus(), 100)
  }, [abierto])

  if (!abierto) return null

  const handleAgregar = p => {
    agregarProducto(p)
    buscarProducto('')
    onCerrar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCerrar} />
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={prodBusqueda}
            onChange={e => buscarProducto(e.target.value)}
            placeholder="Buscar producto por nombre..."
            className="flex-1 text-sm outline-none bg-transparent text-light-text placeholder:text-gray-400" />
          {prodBusqueda && (
            <button type="button" onClick={() => buscarProducto('')}
              className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
          <button type="button" onClick={onCerrar}
            className="ml-1 p-1 rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        {/* Campo código de barras */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50">
          <Scan size={13} className="text-gray-400 shrink-0" />
          <input
            placeholder="Escanear o ingresar código de barras..."
            inputMode="numeric"
            className="flex-1 text-xs outline-none bg-transparent text-light-text placeholder:text-gray-400"
            onInput={e => { e.target.value = e.target.value.replace(/\D/g, '') }}
            onKeyDown={e => {
              if (e.key === 'Enter' && e.target.value) {
                buscarPorCodigo(e.target.value)
                e.target.value = ''
                onCerrar()
              }
            }} />
        </div>

        {/* Resultados */}
        <div className="max-h-72 overflow-y-auto">
          {prodBusqueda && prodsFiltrados.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-400">
              Sin resultados para "{prodBusqueda}"
            </div>
          ) : prodsFiltrados.length > 0 ? (
            prodsFiltrados.map(p => (
              <button key={p.id} type="button" onClick={() => handleAgregar(p)}
                className="w-full flex items-center justify-between px-4 py-3
                  hover:bg-primary/5 border-b border-gray-50 last:border-0 transition-colors text-left">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.nombre}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {p.codigo_barras && (
                      <span className="text-xs font-mono text-gray-400">{p.codigo_barras}</span>
                    )}
                    <span className={`text-xs ${p.stock <= 5 ? 'text-red-400' : 'text-gray-400'}`}>
                      Stock: {p.stock}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-sm font-bold text-primary">{formatPrecio(p.precio)}</span>
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus size={13} className="text-primary" />
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-gray-400">
              Escribe para buscar un producto
            </div>
          )}
        </div>
      </div>
    </div>
  )
}