import { useEffect, useRef, useState } from 'react'
import { Search, X, Plus, Minus, ShoppingCart, Scan } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'

export default function ModalBuscadorProducto({
  abierto, onCerrar,
  prodBusqueda, prodsFiltrados,
  buscarProducto, buscarPorCodigo, agregarProducto,
  form, cambiarCantidad, quitarProducto,
}) {
  const codigoRef = useRef(null)
  const nombreRef = useRef(null)
  const [modoActivo, setModoActivo] = useState('codigo') // 'codigo' | 'nombre'

  useEffect(() => {
    if (abierto) {
      buscarProducto('')
      setTimeout(() => codigoRef.current?.focus(), 100)
    }
  }, [abierto])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape' && abierto) onCerrar() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [abierto, onCerrar])

  if (!abierto) return null

  const indiceEnCarrito = pid =>
    form.productos.findIndex(p => p.producto_id === pid)

  const cantidadEnCarrito = pid => {
    const idx = indiceEnCarrito(pid)
    return idx >= 0 ? +form.productos[idx].cantidad || 0 : 0
  }

  const sumar = p => {
    const idx = indiceEnCarrito(p.id)
    if (idx >= 0) cambiarCantidad(idx, +form.productos[idx].cantidad + 1)
    else agregarProducto(p)
  }

  const restar = p => {
    const idx = indiceEnCarrito(p.id)
    if (idx < 0) return
    const cant = +form.productos[idx].cantidad || 0
    if (cant <= 1) quitarProducto(idx)
    else cambiarCantidad(idx, cant - 1)
  }

  const handleCodigoKeyDown = e => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      buscarPorCodigo(e.target.value.trim())
      e.target.value = ''
      e.target.select()
    }
  }

  const handleNombreKeyDown = e => {
    if (e.key === 'Enter' && prodsFiltrados.length === 1) {
      sumar(prodsFiltrados[0])
      buscarProducto('')
      nombreRef.current?.select()
    }
  }

  const totalItems = form.productos.reduce((s, p) => s + (+p.cantidad || 0), 0)
  const totalVenta = form.productos.reduce(
    (s, p) => s + p.precio_unitario * (+p.cantidad || 0), 0
  )

  const mostrarResultados = prodBusqueda.length > 0 && modoActivo === 'nombre'
  const mostrarCarrito    = !mostrarResultados && form.productos.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCerrar} />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl
        border border-gray-200 shadow-xl flex flex-col" style={{ maxHeight: '88vh' }}>

        {/* Tabs modo */}
        <div className="flex border-b border-gray-100 shrink-0">
          <button type="button"
            onClick={() => { setModoActivo('codigo'); buscarProducto(''); setTimeout(() => codigoRef.current?.focus(), 50) }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
              modoActivo === 'codigo'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-gray-600'
            }`}>
            <Scan size={13} /> Código / Pistola
          </button>
          <button type="button"
            onClick={() => { setModoActivo('nombre'); setTimeout(() => nombreRef.current?.focus(), 50) }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors ${
              modoActivo === 'nombre'
                ? 'text-primary border-b-2 border-primary'
                : 'text-gray-400 hover:text-gray-600'
            }`}>
            <Search size={13} /> Buscar por nombre
          </button>
          <button type="button" onClick={onCerrar}
            className="px-4 text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        {/* Input código */}
        {modoActivo === 'codigo' && (
          <div className="px-4 py-3 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-primary/30
              bg-primary/5 focus-within:border-primary transition-colors">
              <Scan size={16} className="text-primary shrink-0" />
              <input
                ref={codigoRef}
                placeholder="Escanea o escribe el código y presiona Enter..."
                className="flex-1 text-sm outline-none bg-transparent text-light-text placeholder:text-gray-400"
                onKeyDown={handleCodigoKeyDown} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-center">
              La pistola escanea directo aquí · también puedes escribir el código manualmente
            </p>
          </div>
        )}

        {/* Input nombre */}
        {modoActivo === 'nombre' && (
          <div className="px-4 py-3 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-primary/30
              bg-primary/5 focus-within:border-primary transition-colors">
              <Search size={16} className="text-primary shrink-0" />
              <input
                ref={nombreRef}
                value={prodBusqueda}
                onChange={e => buscarProducto(e.target.value)}
                onKeyDown={handleNombreKeyDown}
                placeholder="Nombre del producto... (Enter si hay 1 resultado)"
                className="flex-1 text-sm outline-none bg-transparent text-light-text placeholder:text-gray-400" />
              {prodBusqueda && (
                <button type="button" onClick={() => { buscarProducto(''); nombreRef.current?.focus() }}>
                  <X size={14} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Resultados búsqueda por nombre */}
        {mostrarResultados && (
          <div className="flex-1 overflow-y-auto">
            {prodsFiltrados.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-400">
                Sin resultados para "{prodBusqueda}"
              </div>
            ) : prodsFiltrados.map(p => {
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
                      <span className={`text-xs ${p.stock <= 5 ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
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
                      <button type="button" onClick={() => sumar(p)}
                        className="w-7 h-7 rounded-full bg-primary flex items-center justify-center
                          hover:bg-primary/90 transition-colors">
                        <Plus size={13} className="text-white" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Carrito cuando no hay búsqueda */}
        {mostrarCarrito && (
          <div className="flex-1 overflow-y-auto">
            <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Productos en esta venta
            </p>
            {form.productos.map((p, idx) => (
              <div key={`${p.producto_id}-${idx}`}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0 mr-3">
                  <p className="text-sm font-medium truncate">{p.nombre}</p>
                  <p className="text-xs text-gray-400">{formatPrecio(p.precio_unitario)} c/u</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-bold text-primary w-20 text-right">
                    {formatPrecio(p.precio_unitario * (+p.cantidad || 0))}
                  </span>
                  <div className="flex items-center gap-1">
                    <button type="button"
                      onClick={() => { if (+p.cantidad <= 1) quitarProducto(idx); else cambiarCantidad(idx, +p.cantidad - 1) }}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-red-50
                        flex items-center justify-center transition-colors">
                      <Minus size={13} className="text-gray-600" />
                    </button>
                    <input
                      type="text" inputMode="numeric"
                      value={p.cantidad}
                      onChange={e => {
                        const v = e.target.value
                        if (v === '' || /^\d+$/.test(v)) cambiarCantidad(idx, v === '' ? '' : +v)
                      }}
                      className="w-9 text-center text-sm font-bold border border-gray-200
                        rounded-lg py-0.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
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

        {/* Vacío */}
        {!mostrarResultados && !mostrarCarrito && (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-gray-400">
            <ShoppingCart size={36} className="mb-3 opacity-30" />
            <p className="text-xs">
              {modoActivo === 'codigo'
                ? 'Escanea o escribe el código del producto'
                : 'Escribe el nombre del producto'}
            </p>
            <p className="text-xs mt-1 text-gray-300">Presiona Esc para cerrar</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 shrink-0
          flex items-center justify-between bg-gray-50 rounded-b-2xl">
          <div>
            {totalItems > 0 ? (
              <>
                <p className="text-xs text-gray-400">{totalItems} ítem{totalItems !== 1 ? 's' : ''}</p>
                <p className="text-base font-bold text-primary">{formatPrecio(totalVenta)}</p>
              </>
            ) : (
              <p className="text-xs text-gray-400">Sin productos aún</p>
            )}
          </div>
          <button type="button" onClick={onCerrar}
            className="btn-primary px-6">
            {totalItems > 0 ? 'Listo ✓' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  )
}