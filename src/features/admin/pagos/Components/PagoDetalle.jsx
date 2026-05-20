import Modal from '@shared/components/Modal'
import { CheckCircle, XCircle } from 'lucide-react'
import { formatPrecio, formatFecha } from '@shared/utils/validaciones'
 
export default function PagoDetalle({ modalDetalle, setModalDetalle, setModalAnular, esAnulado }) {
  const pago = modalDetalle.pago
  const cerrar = () => setModalDetalle({ abierto: false, pago: null })
  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} titulo={`Pago #${pago?.id}`}>
      {pago && (
        <div className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="campo-label">Pedido</p><p className="font-medium">#{pago.pedido_id}</p></div>
            <div><p className="campo-label">Cliente</p><p>{pago.cliente || '—'}</p></div>
            <div><p className="campo-label">Monto</p><p className="text-primary font-bold text-base">{formatPrecio(pago.monto)}</p></div>
            <div><p className="campo-label">Método</p><p className="capitalize">{pago.metodo}</p></div>
            <div><p className="campo-label">Estado</p>
              <div className="flex items-center gap-1">
                {esAnulado(pago.estado) ? <XCircle size={13} className="text-red-400" /> : <CheckCircle size={13} className="text-green-400" />}
                <span className={esAnulado(pago.estado) ? 'badge-anulado' : 'badge-activo'}>
                  {esAnulado(pago.estado) ? 'Anulado' : 'Pagado'}
                </span>
              </div>
            </div>
            <div><p className="campo-label">Fecha</p><p>{formatFecha(pago.created_at)}</p></div>
          </div>
          {!esAnulado(pago.estado) && (
            <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-dark-border">
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
