import Modal from '@shared/components/Modal'
import { CheckCircle, Clock, XCircle, Download, Edit2 } from 'lucide-react'
import { formatPrecio, formatFecha } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'

export default function OrdenDetalle({
  modalDetalle, setModalDetalle,
  cambiarEstado, ESTADOS_ORDEN, getEstadoId, getKeyEstado,
  abrirEditar, setModalAnular,
}) {
  const orden = modalDetalle.orden
  const cerrar = () => setModalDetalle({ abierto: false, orden: null })
  const esAnulada = getKeyEstado(orden?.estado) === 'anulado'

  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} titulo={`Orden #${orden?.id}`} ancho="max-w-lg">
      {orden && (
        <div className="space-y-3">
          {/* info general */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><p className="campo-label">Proveedor</p><p className="font-medium">{orden.proveedor}</p></div>
            <div><p className="campo-label">Total</p><p className="text-primary font-bold text-sm">{formatPrecio(orden.total)}</p></div>
            <div><p className="campo-label">Fecha Compra</p><p>{formatFecha(orden.fecha_compra || orden.created_at)}</p></div>
            {orden.metodo_pago      && <div><p className="campo-label">Método Pago</p><p>{orden.metodo_pago}</p></div>}
            {orden.fecha_limite_pago && <div><p className="campo-label">Límite Pago</p><p>{formatFecha(orden.fecha_limite_pago)}</p></div>}
            {(orden.registrado_por_nombre || orden.registrado_por) && <div><p className="campo-label">Registrado por</p><p>{orden.registrado_por_nombre || orden.registrado_por}</p></div>}
            {orden.notas && <div className="col-span-2"><p className="campo-label">Notas</p><p className="text-gray-500 italic">{orden.notas}</p></div>}
          </div>

          {/* estado actual */}
          <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
            <p className="campo-label mb-1">Estado</p>
            {esAnulada
              ? <span className="badge-anulado">Anulado</span>
              : getKeyEstado(orden.estado) === 'activo'
                ? <span className="badge-activo">Completado</span>
                : <span className="badge-pendiente">Pendiente</span>
            }
          </div>

          {/* acciones */}
          <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => descargarPDF(`/reportes/ordenes/${orden.id}`, `orden-${orden.id}.pdf`)}
              className="btn-outline text-xs">
              <Download size={12} /> Descargar
            </button>
            {!esAnulada && (<>
              <button onClick={() => { cerrar(); abrirEditar(orden) }} className="btn-outline text-xs">
                <Edit2 size={12} /> Editar
              </button>
            </>)}
          </div>
        </div>
      )}
    </Modal>
  )
}