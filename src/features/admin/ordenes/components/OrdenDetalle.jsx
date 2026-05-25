import Modal from '@shared/components/Modal'
import { CheckCircle, Clock, XCircle, Download, Truck, Edit2 } from 'lucide-react'
import { formatPrecio, formatFecha } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
 
const ICONOS = { pendiente: Clock, entregado: Truck, pagada: CheckCircle, anulado: XCircle }
const ESTILOS = {
  pendiente: 'bg-yellow-500/20 border-yellow-500 text-yellow-500',
  entregado: 'bg-blue-500/20 border-blue-500 text-blue-500',
  pagada:    'bg-green-500/20 border-green-500 text-green-500',
  anulado:   'bg-red-500/20 border-red-400 text-red-400',
}
 
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
            {orden.metodo_pago && <div><p className="campo-label">Método Pago</p><p>{orden.metodo_pago}</p></div>}
            {orden.fecha_limite_pago && <div><p className="campo-label">Límite Pago</p><p>{formatFecha(orden.fecha_limite_pago)}</p></div>}
            {orden.registrado_por && <div><p className="campo-label">Registrado por</p><p>{orden.registrado_por}</p></div>}
            {orden.notas && <div className="col-span-2"><p className="campo-label">Notas</p><p className="text-gray-500 italic">{orden.notas}</p></div>}
          </div>
 
          {/* cambiar estado — solo si no está anulada */}
          {!esAnulada && (
            <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
              <p className="campo-label mb-2">Cambiar Estado</p>
              <div className="flex gap-2 flex-wrap">
                {ESTADOS_ORDEN.filter(e => e.key !== 'vencida' && e.key !== 'anulado').map(({ key, label }) => {
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
          )}
 
          {esAnulada && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20 text-xs text-red-500">
              Esta orden está anulada y no puede ser modificada.
            </div>
          )}
 
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
              <button onClick={() => { cerrar(); setModalAnular({ abierto: true, orden }) }}
                className="px-3 py-1.5 text-xs border border-red-400/40 text-red-400 rounded-lg hover:bg-red-400/10 transition-colors">
                <XCircle size={12} className="inline mr-1" /> Anular
              </button>
            </>)}
          </div>
        </div>
      )}
    </Modal>
  )
}
