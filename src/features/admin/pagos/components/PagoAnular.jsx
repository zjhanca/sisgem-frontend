import Modal from '@shared/components/Modal'
import { formatPrecio } from '@shared/utils/validaciones'
 
export default function PagoAnular({ modalAnular, setModalAnular, anular, anulando }) {
  const pago = modalAnular.pago
  const cerrar = () => setModalAnular({ abierto: false, pago: null })
  return (
    <Modal abierto={modalAnular.abierto} onCerrar={cerrar} titulo="Confirmar Anulación" ancho="max-w-sm">
      <div className="space-y-4">
        <p className="text-sm">¿Anular el pago
          <span className="font-medium text-primary"> #{pago?.id}</span> de
          <span className="text-primary"> {formatPrecio(pago?.monto)}</span>?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
          <button onClick={cerrar} className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
          <button onClick={() => anular.mutate(pago.id)} disabled={anulando}
            className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50">
            {anulando ? 'Anulando...' : 'Aceptar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}