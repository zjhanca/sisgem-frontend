import Modal from '@shared/components/Modal'
import { formatPrecio, formatFecha } from '@shared/utils/validaciones'
import { Plus, CreditCard } from 'lucide-react'

export default function CarteraDetalle({ cliente, deuda, onCerrar, onAbono }) {
  if (!cliente || !deuda) return null

  const pedidosPendientes = [...(deuda.pedidos || [])]
    .filter(p => p.pendiente > 0)
    .sort((a, b) => new Date(a.fecha_pedido) - new Date(b.fecha_pedido))

  return (
    <Modal abierto={!!cliente} onCerrar={onCerrar} bloquearCierre
      titulo={`Cartera — ${cliente.nombre} ${cliente.apellido}`} ancho="max-w-md">
      <div className="space-y-4">

        {/* Resumen */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 border border-red-100">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-red-500" />
            <span className="text-sm font-semibold text-red-600">Deuda total</span>
          </div>
          <span className="text-lg font-bold text-red-600">{formatPrecio(deuda.total_deuda)}</span>
        </div>

        {/* Pedidos pendientes */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Pedidos con saldo pendiente
          </p>
          {pedidosPendientes.map(p => (
            <div key={p.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50 text-sm">
              <div>
                <p className="font-medium">Pedido #{p.id}</p>
                <p className="text-xs text-gray-400">{formatFecha(p.fecha_pedido)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Total pedido: {formatPrecio(p.total)}</p>
                <p className="font-bold text-red-500">{formatPrecio(p.pendiente)} pendiente</p>
              </div>
            </div>
          ))}
        </div>

        {/* Botón abono */}
        <button onClick={() => onAbono(cliente)}
          className="w-full btn-primary justify-center gap-2">
          <Plus size={14} /> Registrar abono
        </button>
      </div>
    </Modal>
  )
}