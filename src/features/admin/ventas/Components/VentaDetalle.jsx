import Modal from '@shared/components/Modal'
import { Download } from 'lucide-react'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
 
export default function VentaDetalle({ modalDetalle, setModalDetalle, setModalAnular, getBadge }) {
  const venta = modalDetalle.venta
  const cerrar = () => setModalDetalle({ abierto: false, venta: null })
  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} titulo={`Venta #${venta?.id}`}>
      {venta && (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="campo-label">Cliente</p><p className="font-medium">{venta.cliente}</p></div>
            <div><p className="campo-label">Tipo</p><span className="badge bg-primary/20 text-green-700 dark:text-primary">🏪 Mostrador</span></div>
            <div><p className="campo-label">Estado</p><span className={getBadge(venta.estado)}>{venta.estado}</span></div>
            <div><p className="campo-label">Total</p><p className="text-primary font-bold text-sm">{formatPrecio(venta.total)}</p></div>
            <div className="col-span-2"><p className="campo-label">Fecha</p><p>{formatFechaHora(venta.fecha_pedido)}</p></div>
          </div>
          <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => descargarPDF(`/reportes/pedido/${venta.id}`, `comprobante-${venta.id}.pdf`)} className="btn-outline text-xs"><Download size={12} /> Comprobante</button>
            {!venta.estado?.toLowerCase().includes('anula') && (
              <button onClick={() => { cerrar(); setModalAnular({ abierto: true, venta }) }}
                className="px-3 py-1.5 text-xs border border-red-400/40 text-red-400 rounded-lg hover:bg-red-400/10">
                Anular Venta
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
