import Modal from '@shared/components/Modal'
import { CheckCircle, Clock, XCircle, Download, Truck } from 'lucide-react'
import { formatPrecio, formatFecha } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'

const ICONOS = { pendiente: Clock, entregado: Truck, pagada: CheckCircle, anulado: XCircle }
const ESTILOS = {
  pendiente: 'bg-yellow-500/20 border-yellow-500 text-yellow-500',
  entregado: 'bg-blue-500/20 border-blue-500 text-blue-500',
  pagada:    'bg-green-500/20 border-green-500 text-green-500',
  anulado:   'bg-red-500/20 border-red-400 text-red-400',
}

export default function OrdenDetalle({ modalDetalle, setModalDetalle, cambiarEstado, ESTADOS_ORDEN, getEstadoId, getKeyEstado }) {
  const orden = modalDetalle.orden
  const cerrar = () => setModalDetalle({ abierto: false, orden: null })
  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} titulo={`Orden #${orden?.id}`} ancho="max-w-lg">
      {orden && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><p className="campo-label">Proveedor</p><p className="font-medium">{orden.proveedor}</p></div>
            <div><p className="campo-label">Total</p><p className="text-primary font-bold text-sm">{formatPrecio(orden.total)}</p></div>
            <div><p className="campo-label">Fecha Compra</p><p>{formatFecha(orden.fecha_compra || orden.created_at)}</p></div>
            {orden.metodo_pago && <div><p className="campo-label">Método Pago</p><p>{orden.metodo_pago}</p></div>}
            {orden.fecha_limite_pago && <div><p className="campo-label">Límite Pago</p><p>{formatFecha(orden.fecha_limite_pago)}</p></div>}
          </div>
          <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
            <p className="campo-label mb-2">Cambiar Estado</p>
            <div className="flex gap-2 flex-wrap">
              {ESTADOS_ORDEN.map(({ key, label }) => {
                const estado_id = getEstadoId(key)
                if (!estado_id) return null
                const esActual = getKeyEstado(orden.estado) === key
                const Ico = ICONOS[key] || Clock
                return (
                  <button key={key} type="button"
                    onClick={() => cambiarEstado.mutate({ id: orden.id, estado_id })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                      esActual ? ESTILOS[key] : 'border-gray-200 dark:border-dark-border text-gray-500 hover:border-primary/40'
                    }`}>
                    <Ico size={11} /> {label}
                  </button>
                )
              })}
            </div>
            {getKeyEstado(orden.estado) === 'entregado' && (
              <p className="text-xs text-blue-500 mt-2 italic">⚠ Al marcar como entregado, el stock se actualizará automáticamente.</p>
            )}
          </div>
          <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => descargarPDF(`/reportes/ordenes/${orden.id}`, `orden-${orden.id}.pdf`)} className="btn-outline text-xs">
              <Download size={12} /> Descargar
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}