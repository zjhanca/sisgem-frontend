import { Clock, ChevronDown, ChevronUp, Download } from 'lucide-react'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'
import ProductosPedido from './ProductosPedido'

export default function PedidoCard({ pedido, abierto, onToggle, abonos, descargarComprobante, getBadge }) {
  const abonosPedido = abonos.filter(a => a.pedido_id === pedido.id)

  return (
    <div className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border overflow-hidden">
      <button type="button"
        onClick={onToggle}
        className="w-full p-4 text-left flex items-start justify-between gap-2">
        <div className="space-y-0.5 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-sm text-light-text dark:text-dark-text">Pedido #{pedido.id}</span>
            <span className={getBadge(pedido.estado)}>{pedido.estado || 'Pendiente'}</span>
          </div>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Clock size={10} /> {formatFechaHora(pedido.fecha_pedido)}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <p className="text-primary font-bold text-sm">{formatPrecio(pedido.total)}</p>
          {abierto ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
      </button>

      {abierto && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-dark-border pt-3 space-y-3">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-1">Productos</p>
            <ProductosPedido pedidoId={pedido.id} />
          </div>
          <div className="flex justify-between text-xs font-semibold border-t border-gray-100 pt-2">
            <span>Total</span>
            <span className="text-primary">{formatPrecio(pedido.total)}</span>
          </div>
          {abonosPedido.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1">Pagos</p>
              <div className="space-y-1">
                {abonosPedido.map(a => (
                  <div key={a.id} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-dark-bg rounded px-2 py-1.5">
                    <span className="text-gray-500 capitalize">{a.metodo}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-semibold">{formatPrecio(a.monto)}</span>
                      <button type="button" onClick={() => descargarComprobante(a.id)}
                        title="Descargar comprobante"
                        className="text-gray-400 hover:text-primary transition-colors">
                        <Download size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}