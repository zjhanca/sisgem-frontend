import Modal from '@shared/components/Modal'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'
import { CheckCircle, Store } from 'lucide-react'

export default function PedidoDetalle({
  modalDetalle, setModalDetalle,
  getColorEstado, getLabelEstado,
  onConfirmarEntrega,
}) {
  const pedido = modalDetalle.pedido
  const cerrar = () => setModalDetalle({ abierto: false, pedido: null })

  if (!pedido) return null

  const estado      = pedido.estado || ''
  const esPendiente = estado.toLowerCase().includes('pendiente')
  const esAnulado   = estado.toLowerCase().includes('anula')
  const esEntregado = estado.toLowerCase().includes('complet') || estado.toLowerCase().includes('paga')
  const esSinRecoger = estado.toLowerCase().includes('sin recoger')

  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} bloquearCierre
      titulo={`Pedido #${pedido.id}`} ancho="max-w-md">
      <div className="space-y-4">

        {/* Badge estado */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center justify-center h-6 px-3 rounded-full text-white text-xs font-semibold ${getColorEstado(estado)}`}>
            {getLabelEstado(estado)}
          </span>
          <span className="text-xs text-gray-400">{formatFechaHora(pedido.fecha_pedido)}</span>
        </div>

        {/* Aviso sin recoger */}
        {esSinRecoger && (
          <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-600">
            El cliente no recogió el pedido en las 6 horas establecidas.
          </div>
        )}

        {/* Info cliente */}
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 text-xs">Cliente</span>
            <span className="font-medium text-xs">{pedido.cliente || 'Sin nombre'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 text-xs">Tipo entrega</span>
            <span className="flex items-center gap-1 text-xs font-medium">
              <Store size={11} /> Recoger en tienda
            </span>
          </div>
          {pedido.es_fiado && (
            <div className="flex justify-between">
              <span className="text-gray-500 text-xs">Modalidad</span>
              <span className="text-xs font-medium text-amber-500">Fiado / Crédito</span>
            </div>
          )}
          <div className="flex justify-between pt-1 border-t border-gray-200">
            <span className="text-gray-500 text-xs">Total</span>
            <span className="font-bold text-primary">{formatPrecio(pedido.total)}</span>
          </div>
        </div>

        {/* Botón confirmar entrega */}
        {(esPendiente || esSinRecoger) && !esAnulado && (
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
            Entregado
          </div>
        )}
      </div>
    </Modal>
  )
}