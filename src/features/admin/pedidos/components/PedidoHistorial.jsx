import Modal from '@shared/components/Modal'
import { formatPrecio, formatFecha } from '@shared/utils/validaciones'
 
export default function PedidoHistorial({ modalHistorial, setModalHistorial, historial, getBadge }) {
  const cerrar = () => setModalHistorial({ abierto: false, cliente: null })
  return (
    <Modal abierto={modalHistorial.abierto} onCerrar={cerrar}
      titulo={`Historial — ${modalHistorial.cliente?.nombre || ''}`} ancho="max-w-lg">
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {historial.length === 0 && <p className="text-xs text-center text-gray-400 py-6">Sin pedidos</p>}
        {historial.map(p => (
          <div key={p.id} className="flex justify-between p-3 rounded-lg border border-gray-200 dark:border-dark-border text-xs">
            <div><p className="font-medium">#{p.id}</p><p className="text-gray-400 mt-0.5">{formatFecha(p.fecha_pedido)}</p></div>
            <div className="text-right">
              <p className="text-primary font-medium">{formatPrecio(p.total)}</p>
              <span className={getBadge(p.estado)}>{p.estado}</span>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  )
}
