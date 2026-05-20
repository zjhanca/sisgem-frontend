import Modal from '@shared/components/Modal'
import { formatPrecio } from '@shared/utils/validaciones'
 
export default function VentaAnular({ modalAnular, setModalAnular, anular, anulando }) {
  const venta = modalAnular.venta
  const cerrar = () => setModalAnular({ abierto: false, venta: null })
  return (
    <Modal abierto={modalAnular.abierto} onCerrar={cerrar} titulo="Confirmar Anulación" ancho="max-w-sm">
      <div className="space-y-4">
        <p className="text-sm">¿Anular la venta <span className="font-medium text-primary">#{venta?.id}</span> por <span className="text-primary">{formatPrecio(venta?.total)}</span>?</p>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
          <button onClick={cerrar} className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
          <button onClick={() => anular.mutate(venta.id)} disabled={anulando}
            className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50">
            {anulando ? 'Anulando...' : 'Aceptar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
