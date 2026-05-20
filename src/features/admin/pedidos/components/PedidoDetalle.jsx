import Modal from '@shared/components/Modal'
import { Download, MapPin } from 'lucide-react'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
import DomicilioEstado  from './DomicilioEstado'
import DomicilioAsignar from './DomicilioAsignar'
 
export default function PedidoDetalle({
  modalDetalle, setModalDetalle, estados, domDetalle,
  cambiarEstado, cambiarEstadoDom, asignarDomicilio, anular,
  ESTADOS_DOM, getKeyEstadoDom, getEstadoDomId,
  formDomDetalle, setFormDomDetalle, handleAsignarDomDetalle,
  tarifas, dirsDetalle, puedeAnular, anulando, asignando,
}) {
  const pedido = modalDetalle.pedido
  const cerrar = () => setModalDetalle({ abierto: false, pedido: null })
 
  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} titulo={`Pedido #${pedido?.id}`} ancho="max-w-lg">
      {pedido && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><p className="campo-label">Cliente</p><p className="font-medium">{pedido.cliente}</p></div>
            <div><p className="campo-label">Tipo</p>
              <span className={`badge ${pedido.tipo_venta==='domicilio' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-primary/20 text-green-700 dark:text-primary'}`}>
                {pedido.tipo_venta==='domicilio' ? '🛵 Domicilio' : '🏪 Mostrador'}
              </span>
            </div>
            <div><p className="campo-label">Total</p><p className="text-primary font-bold text-sm">{formatPrecio(pedido.total)}</p></div>
            <div><p className="campo-label">Fecha</p><p>{formatFechaHora(pedido.fecha_pedido)}</p></div>
          </div>
 
          <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
            <p className="campo-label mb-1">Estado del Pedido</p>
            <div className="flex flex-wrap gap-1">
              {estados.map(e => (
                <button key={e.id} type="button"
                  onClick={() => cambiarEstado.mutate({ id: pedido.id, estado_id: e.id })}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${pedido.estado_id===e.id ? 'bg-primary text-dark-bg border-primary' : 'border-gray-200 dark:border-dark-border text-gray-500 hover:border-primary/40'}`}>
                  {e.nombre}
                </button>
              ))}
            </div>
          </div>
 
          {pedido.tipo_venta === 'domicilio' && (
            <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
              <div className="flex items-center gap-2 mb-2"><MapPin size={13} className="text-blue-500" /><p className="campo-label">Domicilio</p></div>
              {domDetalle ? (
                <DomicilioEstado
                  domDetalle={domDetalle} ESTADOS_DOM={ESTADOS_DOM}
                  getKeyEstadoDom={getKeyEstadoDom} getEstadoDomId={getEstadoDomId}
                  cambiarEstadoDom={cambiarEstadoDom}
                />
              ) : (
                <DomicilioAsignar
                  formDomDetalle={formDomDetalle} setFormDomDetalle={setFormDomDetalle}
                  dirsDetalle={dirsDetalle} tarifas={tarifas}
                  clienteDetallId={pedido.cliente_id_ref}
                  handleAsignarDomDetalle={handleAsignarDomDetalle}
                  asignando={asignando}
                />
              )}
            </div>
          )}
 
          <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => descargarPDF(`/reportes/pedido/${pedido.id}`, `comprobante-${pedido.id}.pdf`)}
              className="btn-outline text-xs"><Download size={12} /> Comprobante</button>
            {puedeAnular(pedido) && (
              <button onClick={() => anular.mutate(pedido.id)} disabled={anulando}
                className="px-3 py-1.5 text-xs border border-red-400/40 text-red-400 rounded-lg hover:bg-red-400/10">
                {anulando ? 'Anulando...' : 'Anular Pedido'}
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}
 
