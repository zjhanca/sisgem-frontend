import { useQuery } from '@tanstack/react-query'
import Modal from '@shared/components/Modal'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'
import { CheckCircle, Store, Package, Loader2 } from 'lucide-react'
import { pedidosService } from '../services/pedidosService'

export default function PedidoDetalle({
  modalDetalle, setModalDetalle,
  getColorEstado, getLabelEstado,
  onConfirmarEntrega,
}) {
  const pedido = modalDetalle.pedido
  const cerrar = () => setModalDetalle({ abierto: false, pedido: null })

  const { data: detalle, isLoading } = useQuery({
    queryKey: ['pedido-detalle', pedido?.id],
    queryFn:  () => pedidosService.getDetalle(pedido.id),
    enabled:  !!pedido?.id && modalDetalle.abierto,
  })

  if (!pedido) return null

  const estado       = pedido.estado || ''
  const esPendiente  = estado.toLowerCase().includes('pendiente')
  const esAnulado    = estado.toLowerCase().includes('anula')
  const esEntregado  = estado.toLowerCase().includes('complet') || estado.toLowerCase().includes('entrega')
  const esSinRecoger = estado.toLowerCase().includes('sin recoger')

  const productos = detalle?.productos || []

  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} bloquearCierre
      titulo={`Pedido #${pedido.id}`} ancho="max-w-md">
      <div className="flex flex-col" style={{ maxHeight: '80vh' }}>
        <div className="overflow-y-auto flex-1 space-y-3 pr-1">

          {/* Badge estado + fecha */}
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center justify-center h-6 px-3 rounded-full
              text-white text-xs font-semibold ${getColorEstado(estado)}`}>
              {getLabelEstado(estado)}
            </span>
            <span className="text-xs text-gray-400">
              {formatFechaHora(pedido.fecha_pedido)}
            </span>
          </div>

          {/* Aviso sin recoger */}
          {esSinRecoger && (
            <div className="p-3 rounded-lg bg-orange-50 border border-orange-200
              text-xs text-orange-600 font-medium">
              ⚠ El cliente no recogió el pedido en las 6 horas establecidas.
              El stock fue devuelto automáticamente.
            </div>
          )}

          {/* Info cliente + venta */}
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Cliente</span>
              <span className="font-semibold">{pedido.cliente || 'Sin nombre'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tipo entrega</span>
              <span className="flex items-center gap-1 font-medium">
                <Store size={10} /> Recoger en tienda
              </span>
            </div>
            {pedido.es_fiado && (
              <div className="flex justify-between">
                <span className="text-gray-400">Modalidad</span>
                <span className="font-medium text-amber-500">Fiado / Crédito</span>
              </div>
            )}
          </div>

          {/* Productos */}
          <div className="pt-1 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-1.5 flex items-center gap-1 font-medium">
              <Package size={11} /> Productos del pedido
            </p>
            {isLoading ? (
              <div className="flex items-center justify-center py-4 text-gray-400 text-xs gap-2">
                <Loader2 size={13} className="animate-spin" /> Cargando...
              </div>
            ) : productos.length === 0 ? (
              <p className="text-center text-gray-400 text-xs py-3">
                Sin productos registrados
              </p>
            ) : (
              <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                {productos.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-100">
                    {p.imagen_url
                      ? <img src={p.imagen_url} alt="" className="w-8 h-8 object-cover rounded shrink-0"
                          onError={e => e.target.style.display = 'none'} />
                      : <div className="w-8 h-8 bg-primary/10 rounded flex items-center
                          justify-center text-xs text-primary/40 shrink-0">—</div>
                    }
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-xs">
                        {p.producto || p.nombre}
                      </p>
                      {p.codigo_barras && (
                        <p className="text-gray-400 font-mono text-xs">{p.codigo_barras}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 text-xs">
                      <p className="text-gray-400">
                        {p.cantidad} × {formatPrecio(p.precio_unitario)}
                      </p>
                      <p className="text-primary font-semibold">
                        {formatPrecio(p.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Total fijo + botón */}
        <div className="pt-3 mt-3 border-t border-gray-100 shrink-0 space-y-3">
          <div className="flex justify-between items-center px-1">
            <span className="text-sm font-semibold">Total pedido</span>
            <span className="text-lg font-bold text-primary">
              {formatPrecio(pedido.total)}
            </span>
          </div>

          {/* Confirmar entrega — solo si es PENDIENTE, nunca si es sin recoger */}
          {esPendiente && !esAnulado && !esSinRecoger && (
            <button
              onClick={() => { cerrar(); onConfirmarEntrega(pedido) }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
                bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
              <CheckCircle size={16} />
              Confirmar entrega al cliente
            </button>
          )}

          {esEntregado && (
            <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl
              bg-primary/10 text-primary text-sm font-semibold">
              <CheckCircle size={16} />
              Pedido entregado
            </div>
          )}

          {esSinRecoger && (
            <div className="flex items-center justify-center gap-2 py-2.5 rounded-xl
              bg-orange-50 border border-orange-200 text-orange-600 text-sm font-semibold">
              ⚠ No recogido — stock devuelto
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}