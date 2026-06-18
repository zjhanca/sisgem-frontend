import Modal from '@shared/components/Modal'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'

export default function PagoDetalle({ modalDetalle, setModalDetalle, setModalAnular, esAnulado }) {
  const pago = modalDetalle.pago
  const cerrar = () => setModalDetalle({ abierto: false, pago: null })
  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} bloquearCierre titulo={`Pago #${pago?.id}`}>
      {pago && (
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="campo-label">Pedido</p><p className="font-medium">#{pago.pedido_id}</p></div>
            <div><p className="campo-label">Cliente</p><p>{pago.cliente || '—'}</p></div>
            <div><p className="campo-label">Monto</p><p className="text-primary font-bold text-base">{formatPrecio(pago.monto)}</p></div>
            <div><p className="campo-label">Método</p><p className="capitalize">{pago.metodo}</p></div>
            <div className="col-span-2"><p className="campo-label">Fecha</p><p>{formatFechaHora(pago.fecha)}</p></div>
          </div>
          {!esAnulado(pago.estado) && (
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button onClick={() => { cerrar(); setModalAnular({ abierto: true, pago }) }}
                className="px-3 py-1.5 text-xs border border-red-400/40 text-red-400 rounded-lg hover:bg-red-400/10">
                Anular Pago
              </button>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}