import { useEffect, useRef, useState } from 'react'
import { Search, Scan, Trash2, ShoppingBag, Pencil, Check } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'
import { useBarcodeScanner } from '@shared/hooks/useBarcodeScanner'

export default function ModalBuscadorOrden({
  abierto, onCerrar,
  productos, prodBusqueda, prodsFiltrados,
  buscarProducto, buscarPorCodigo,
  form, itemForm, setItemForm,
  agregarItem, quitarItem,
  itemEditando, iniciarEdicionItem, guardarEdicionItem, cancelarEdicionItem,
  setProdBusqueda, setProdsFiltrados, onCrearProducto,
}) {
  const codigoRef = useRef(null)
  const nombreRef = useRef(null)
  const costoRef  = useRef(null)
  const [modo, setModo] = useState('codigo')

  useEffect(() => {
    if (abierto) {
      buscarProducto('')
      setTimeout(() => codigoRef.current?.focus(), 80)
    }
  }, [abierto])

  useEffect(() => {
    const handler = e => { if (e.key === 'Escape' && abierto) onCerrar() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [abierto, onCerrar])

  // Pistola — activa solo cuando el modal está abierto
  useBarcodeScanner({
    activo: abierto,
    soloNumeros: true,
    onScan: codigo => {
      buscarPorCodigo(codigo)
      setTimeout(() => costoRef.current?.focus(), 200)
    },
  })

  if (!abierto) return null

  const prodActual   = productos.find(p => p.id === +itemForm.producto_id)
  const precioActual = prodActual?.precio ? +prodActual.precio : 0
  const costoNum     = +itemForm.costo_unitario || 0
  const precioVNum   = +itemForm.precio_venta   || 0
  const errMenorCosto  = precioVNum > 0 && costoNum > 0 && precioVNum < costoNum
  const errMenorActual = precioVNum > 0 && precioActual > 0 && precioVNum < precioActual
  const modoEdicion    = itemEditando !== null && itemEditando !== undefined

  const seleccionarProducto = p => {
    setItemForm(f => ({ ...f, producto_id: p.id, costo_unitario: '', precio_venta: p.precio || '' }))
    setProdBusqueda(p.nombre)
    setProdsFiltrados([])
    setTimeout(() => costoRef.current?.focus(), 50)
  }

  const handleCodigoKeyDown = e => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      buscarPorCodigo(e.target.value.trim())
      e.target.value = ''
      e.target.focus()
      setTimeout(() => costoRef.current?.focus(), 200)
    }
  }

  const handleNombreKeyDown = e => {
    if (e.key === 'Enter' && prodsFiltrados.length === 1) {
      seleccionarProducto(prodsFiltrados[0])
      buscarProducto('')
    }
  }

  const handleAgregarKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (modoEdicion) guardarEdicionItem()
      else agregarItem()
    }
  }

  const totalOrden    = form.productos.reduce((s, p) => s + p.costo_unitario * p.cantidad, 0)
  const hayResultados = modo === 'nombre' && prodBusqueda.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCerrar} />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl
        shadow-xl flex flex-col border border-gray-200" style={{ maxHeight: '90vh' }}>

        {/* Tabs */}
        <div className="flex shrink-0 border-b border-gray-100">
          {[
            { key: 'codigo', label: 'Cód. de barras / Pistola', icon: Scan   },
            { key: 'nombre', label: 'Buscar nombre',             icon: Search },
          ].map(t => (
            <button key={t.key} type="button"
              onClick={() => {
                setModo(t.key)
                buscarProducto('')
                setTimeout(() => (t.key === 'codigo' ? codigoRef : nombreRef).current?.focus(), 50)
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium
                transition-colors border-b-2 ${
                modo === t.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-600'
              }`}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
          <button type="button" onClick={onCerrar}
            className="px-4 text-gray-400 hover:text-gray-600 text-lg leading-none font-light">
            ✕
          </button>
        </div>

        {/* Input código de barras */}
        {modo === 'codigo' && (
          <div className="px-4 py-3 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-primary/40
              bg-primary/5 focus-within:border-primary transition-colors">
              <Scan size={16} className="text-primary shrink-0" />
              <input ref={codigoRef}
                placeholder="Escanea con pistola o escribe el código de barras + Enter"
                className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
                onInput={e => { e.target.value = e.target.value.replace(/\D/g, '') }}
                onKeyDown={handleCodigoKeyDown} />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 text-center">
              La pistola funciona automáticamente · también puedes escribir el código
            </p>
          </div>
        )}

        {/* Input nombre */}
        {modo === 'nombre' && (
          <div className="px-4 py-3 border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-primary/40
              bg-primary/5 focus-within:border-primary transition-colors">
              <Search size={16} className="text-primary shrink-0" />
              <input ref={nombreRef}
                value={prodBusqueda}
                onChange={e => buscarProducto(e.target.value)}
                onKeyDown={handleNombreKeyDown}
                placeholder="Nombre del producto... Enter si hay 1 resultado"
                className="flex-1 text-sm outline-none bg-transparent placeholder:text-gray-400" />
              {prodBusqueda && (
                <button type="button"
                  onClick={() => { buscarProducto(''); nombreRef.current?.focus() }}
                  className="text-gray-400 hover:text-red-400 text-base leading-none">
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Resultados */}
        {hayResultados && (
          <div className="overflow-y-auto" style={{ maxHeight: '180px' }}>
            {prodsFiltrados.length === 0 ? (
              <div className="py-6 text-center text-xs text-gray-400">Sin resultados</div>
            ) : prodsFiltrados.map(p => (
              <button key={p.id} type="button"
                onClick={() => seleccionarProducto(p)}
                className="w-full flex items-center justify-between px-4 py-3
                  border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors text-left">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.nombre}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {p.codigo_barras && (
                      <span className="text-xs font-mono text-gray-400">{p.codigo_barras}</span>
                    )}
                    <span className="text-xs text-gray-400">Precio venta: {formatPrecio(p.precio)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Formulario item */}
        <div className="px-4 py-3 border-b border-gray-100 shrink-0 space-y-2">
          {itemForm.producto_id && !modoEdicion && (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg
              border border-primary/40 bg-primary/5 text-xs">
              <span className="font-medium text-primary truncate">
                {productos.find(p => p.id === +itemForm.producto_id)?.nombre}
              </span>
              <button type="button"
                onClick={() => { setItemForm(f => ({ ...f, producto_id: '', costo_unitario: '', precio_venta: '' })); setProdBusqueda('') }}
                className="text-gray-400 hover:text-red-400 ml-2 shrink-0 text-base leading-none">
                ✕
              </button>
            </div>
          )}

          {modoEdicion && (
            <div className="px-3 py-2 rounded-lg border border-amber-300 bg-amber-50 text-xs font-medium text-amber-700">
              ✏️ Editando: {form.productos[itemEditando]?.nombre}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="campo-label">Costo *</label>
              <input ref={costoRef} type="number" step="1" min="0"
                value={itemForm.costo_unitario}
                onChange={e => setItemForm(p => ({ ...p, costo_unitario: e.target.value }))}
                onKeyDown={handleAgregarKeyDown}
                className="campo-input text-xs" placeholder="0" />
            </div>
            <div>
              <label className="campo-label">Precio venta *</label>
              <input type="number" step="1" min="0"
                value={itemForm.precio_venta}
                onChange={e => setItemForm(p => ({ ...p, precio_venta: e.target.value }))}
                onKeyDown={handleAgregarKeyDown}
                className={`campo-input text-xs ${errMenorCosto || errMenorActual ? 'border-red-400' : ''}`}
                placeholder="0" />
              {errMenorCosto && <p className="campo-error">Menor al costo</p>}
              {!errMenorCosto && errMenorActual && (
                <p className="campo-error">Mínimo {formatPrecio(precioActual)}</p>
              )}
            </div>
            <div>
              <label className="campo-label">Cantidad</label>
              <input type="number" min="1"
                value={itemForm.cantidad}
                onChange={e => setItemForm(p => ({ ...p, cantidad: e.target.value }))}
                onKeyDown={handleAgregarKeyDown}
                className="campo-input text-xs" />
            </div>
          </div>

          <div className="flex gap-2">
            {modoEdicion ? (
              <>
                <button type="button" onClick={guardarEdicionItem}
                  className="flex-1 btn-primary justify-center text-xs gap-1">
                  <Check size={13} /> Guardar
                </button>
                <button type="button" onClick={cancelarEdicionItem}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-gray-500 text-xs hover:text-red-400">
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <button type="button" onClick={agregarItem}
                  className="flex-1 btn-primary justify-center text-xs">
                  Agregar producto
                </button>
                {onCrearProducto && (
                  <button type="button" onClick={onCrearProducto}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-xs
                      text-primary/70 hover:text-primary hover:border-primary/40 transition-colors">
                    + Nuevo
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Lista productos */}
        {form.productos.length > 0 ? (
          <div className="flex-1 overflow-y-auto">
            <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Productos en esta compra
            </p>
            {form.productos.map((p, i) => (
              <div key={i}
                className={`flex items-center justify-between px-4 py-3
                  border-b border-gray-50 last:border-0 text-xs ${
                  itemEditando === i ? 'bg-amber-50' : 'hover:bg-gray-50'
                }`}>
                <div className="flex-1 min-w-0 mr-2">
                  <p className="font-medium truncate">{p.nombre}</p>
                  <p className="text-gray-400 mt-0.5">
                    {p.cantidad} × {formatPrecio(p.costo_unitario)} → venta: {formatPrecio(p.precio_venta)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-primary">
                    {formatPrecio(p.costo_unitario * p.cantidad)}
                  </span>
                  {itemEditando !== i && (
                    <button type="button" onClick={() => iniciarEdicionItem(i)}
                      className="text-gray-400 hover:text-primary transition-colors">
                      <Pencil size={12} />
                    </button>
                  )}
                  <button type="button" onClick={() => quitarItem(i)}
                    className="text-gray-300 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-8 text-gray-400">
            <ShoppingBag size={32} className="mb-2 opacity-30" />
            <p className="text-xs">Busca y agrega productos a la compra</p>
            <p className="text-xs mt-1 text-gray-300">Esc para cerrar</p>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 shrink-0
          flex items-center justify-between bg-gray-50 rounded-b-2xl">
          <div>
            {form.productos.length > 0 ? (
              <>
                <p className="text-xs text-gray-400">
                  {form.productos.length} producto{form.productos.length !== 1 ? 's' : ''}
                </p>
                <p className="text-base font-bold text-primary">{formatPrecio(totalOrden)}</p>
              </>
            ) : (
              <p className="text-xs text-gray-400">Sin productos aún</p>
            )}
          </div>
          <button type="button" onClick={onCerrar} className="btn-primary px-6">
            {form.productos.length > 0 ? 'Listo ✓' : 'Cerrar'}
          </button>
        </div>
      </div>
    </div>
  )
}