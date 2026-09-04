import { useEffect, useRef } from 'react'
import { Search, Scan, X, Plus, Minus, ShoppingCart } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'

export default function ModalBuscadorProducto({
  abierto, onCerrar,
  prodBusqueda, prodsFiltrados,
  buscarProducto, buscarPorCodigo, agregarProducto,
  form, cambiarCantidad, quitarProducto,
}) {
  const inputRef  = useRef(null)
  const codigoRef = useRef(null)

  useEffect(() => {
    if (abierto) setTimeout(() => inputRef.current?.focus(), 100)
    if (!abierto) buscarProducto('')
  }, [abierto])

  useEffect(() => {
    const handler = e => {
      if (e.key === 'Escape' && abierto) onCerrar()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [abierto, onCerrar])

  if (!abierto) return null

  const cantidadEnCarrito = producto_id =>
    form.productos.find(p => p.producto_id === producto_id)?.cantidad || 0

  const indiceEnCarrito = producto_id =>
    form.productos.findIndex(p => p.producto_id === producto_id)

  const handleAgregar = p => {
    agregarProducto(p)
    // No cierra — el cajero sigue agregando
  }

  const sumar = p => {
    const idx = indiceEnCarrito(p.id)
    if (idx >= 0) {
      cambiarCantidad(idx, (+form.productos[idx].cantidad || 0) + 1)
    } else {
      agregarProducto(p)
    }
  }

  const restar = p => {
    const idx = indiceEnCarrito(p.id)
    if (idx < 0) return
    const cant = +form.productos[idx].cantidad || 0
    if (cant <= 1) {
      quitarProducto(idx)
    } else {
      cambiarCantidad(idx, cant - 1)
    }
  }

  const totalItems = form.productos.reduce((s, p) => s + (+p.cantidad || 0), 0)
  const totalVenta = form.productos.reduce(
    (s, p) => s + p.precio_unitario * (+p.cantidad || 0), 0
  )

  // Productos a mostrar — si hay búsqueda muestra filtrados, si no muestra los del carrito
  const mostrarCarrito  = !prodBusqueda && form.productos.length > 0
  const mostrarResultados = prodBusqueda.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCerrar} />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl
        border border-gray-200 shadow-xl flex flex-col"
        style={{ maxHeight: '88vh' }}>

        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={prodBusqueda}
            onChange={e => buscarProducto(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && prodsFiltrados.length === 1) { sumar(prodsFiltrados[0]); buscarProducto('') } }}
            placeholder="Buscar producto por nombre..."
            className="flex-1 text-sm outline-none bg-transparent text-light-text placeholder:text-gray-400" />
          {prodBusqueda && (
            <button type="button" onClick={() => buscarProducto('')}
              className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
          <button type="button" onClick={onCerrar}
            className="ml-1 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Código de barras */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50 shrink-0">
          <Scan size={13} className="text-gray-400 shrink-0" />
          <input
            ref={codigoRef}
            placeholder="Código de barras + Enter para agregar"
            inputMode="numeric"
            className="flex-1 text-xs outline-none bg-transparent text-light-text placeholder:text-gray-400"
            onInput={e => { e.target.value = e.target.value.replace(/\D/g, '') }}
            onKeyDown={e => {
              if (e.key === 'Enter' && e.target.value) {
                buscarPorCodigo(e.target.value)
                e.target.value = ''
              }
            }} />
        </div>

        {/* Resultados búsqueda */}
        {mostrarResultados && (
          <div className="flex-1 overflow-y-auto">
            {prodsFiltrados.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400">
                Sin resultados para "{prodBusqueda}"
              </div>
            ) : (
              prodsFiltrados.map(p => {
                const cant = cantidadEnCarrito(p.id)
                return (
                  <div key={p.id}
                    className="flex items-center justify-between px-4 py-3
                      border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0 mr-3">
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
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-bold text-primary">{formatPrecio(p.precio)}</span>
                      {cant > 0 ? (
                        <div className="flex items-center gap-1.5">
                          <button type="button" onClick={() => restar(p)}
                            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-red-50
                              flex items-center justify-center transition-colors">
                            <Minus size={13} className="text-gray-600" />
                          </button>
                          <span className="w-6 text-center text-sm font-bold text-primary">{cant}</span>
                          <button type="button" onClick={() => sumar(p)}
                            disabled={p.stock <= cant}
                            className="w-7 h-7 rounded-full bg-primary flex items-center justify-center
                              hover:bg-primary/90 disabled:opacity-40 transition-colors">
                            <Plus size={13} className="text-white" />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => handleAgregar(p)}
                          className="w-7 h-7 rounded-full bg-primary flex items-center justify-center
                            hover:bg-primary/90 transition-colors">
                          <Plus size={13} className="text-white" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Carrito actual cuando no hay búsqueda */}
        {mostrarCarrito && !mostrarResultados && (
          <div className="flex-1 overflow-y-auto">
            <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Productos agregados
            </p>
            {form.productos.map((p, idx) => (
              <div key={`${p.producto_id}-${idx}`}
                className="flex items-center justify-between px-4 py-3
                  border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-medium truncate">{p.nombre}</p>
                  <p className="text-xs text-gray-400">{formatPrecio(p.precio_unitario)} c/u</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {formatPrecio(p.precio_unitario * (+p.cantidad || 0))}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button type="button"
                      onClick={() => {
                        if (+p.cantidad <= 1) quitarProducto(idx)
                        else cambiarCantidad(idx, +p.cantidad - 1)
                      }}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-red-50
                        flex items-center justify-center transition-colors">
                      <Minus size={13} className="text-gray-600" />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-primary">
                      {p.cantidad}
                    </span>
                    <button type="button"
                      onClick={() => cambiarCantidad(idx, +p.cantidad + 1)}
                      className="w-7 h-7 rounded-full bg-primary flex items-center justify-center
                        hover:bg-primary/90 transition-colors">
                      <Plus size={13} className="text-white" />
                    </button>
                  </div>
                  <button type="button" onClick={() => quitarProducto(idx)}
                    className="text-gray-300 hover:text-red-400 transition-colors ml-1">
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Placeholder vacío */}
        {!mostrarResultados && !mostrarCarrito && (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-gray-400">
            <ShoppingCart size={36} className="mb-3 opacity-30" />
            <p className="text-xs">Busca un producto o escanea el código</p>
            <p className="text-xs mt-1 text-gray-300">Presiona Esc para cerrar</p>
          </div>
        )}

        {/* Footer — total y cerrar */}
        <div className="px-4 py-3 border-t border-gray-100 shrink-0 flex items-center justify-between bg-gray-50 rounded-b-2xl">
          <div>
            {totalItems > 0 ? (
              <>
                <p className="text-xs text-gray-400">{totalItems} producto{totalItems !== 1 ? 's' : ''}</p>
                <p className="text-base font-bold text-primary">{formatPrecio(totalVenta)}</p>
              </>
            ) : (
              <p className="text-xs text-gray-400">Sin productos aún</p>
            )}
          </div>
          <button type="button" onClick={onCerrar}
            className="btn-primary px-5">
            {totalItems > 0 ? 'Listo' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  )
}