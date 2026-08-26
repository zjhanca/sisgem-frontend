import { Trash2 } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'

export default function ListaProductosVenta({ productos, totalPorProducto, cambiarCantidad, quitarProducto }) {
  return (
    <div className="space-y-1 max-h-48 overflow-y-auto">
      {productos.map((p, i) => {
        const stock      = p.stock ?? Infinity
        const cantInvalida = !p.cantidad || +p.cantidad < 1
        const totalProd  = totalPorProducto[p.producto_id] || 0
        const excede     = !cantInvalida && stock !== Infinity && totalProd > stock
        const hayError   = cantInvalida || excede

        return (
          <div key={`${p.producto_id}-${i}`} className="flex flex-col">
            <div className="flex flex-col gap-1 text-xs p-2 rounded bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="flex-1 truncate font-medium">{p.nombre}</span>
                <button type="button" onClick={() => quitarProducto(i)}
                  className="text-red-400 hover:text-red-500 shrink-0 ml-2">
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">{formatPrecio(p.precio_unitario)} c/u</span>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1">
                    <button type="button"
                      onClick={() => cambiarCantidad(i, Math.max(1, (+p.cantidad || 2) - 1))}
                      disabled={!p.cantidad || +p.cantidad <= 1}
                      className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center text-xs font-bold disabled:opacity-40 hover:bg-primary/20">−</button>
                    <input type="text" inputMode="numeric" value={p.cantidad}
                      onChange={e => {
                        const v = e.target.value
                        if (v === '') { cambiarCantidad(i, ''); return }
                        if (/^\d+$/.test(v)) cambiarCantidad(i, v)
                      }}
                      className={`w-10 text-center text-xs rounded border px-1 py-0.5 bg-transparent focus:outline-none focus:ring-1 ${
                        hayError ? 'border-red-400 focus:ring-red-400/30 text-red-400' : 'border-gray-200 focus:ring-primary/20'
                      }`} />
                    <button type="button"
                      onClick={() => cambiarCantidad(i, (+p.cantidad || 0) + 1)}
                      disabled={stock !== Infinity && totalProd >= stock}
                      className="w-5 h-5 rounded bg-gray-200 flex items-center justify-center text-xs font-bold disabled:opacity-40 hover:bg-primary/20">+</button>
                  </div>
                  <span className={`font-semibold w-16 text-right ${hayError ? 'text-red-400' : 'text-primary'}`}>
                    {formatPrecio(p.precio_unitario * (+p.cantidad || 0))}
                  </span>
                </div>
              </div>
            </div>
            {hayError && (
              <p className="text-xs text-red-400 px-2 pb-0.5">
                ⚠ {cantInvalida ? 'La cantidad debe ser al menos 1' : `Solo hay ${stock} unidades disponibles`}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}