import { useQuery } from '@tanstack/react-query'
import Modal from '@shared/components/Modal'
import { Download, Edit2, Loader2, Package, TrendingUp } from 'lucide-react'
import { formatPrecio, formatFecha } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
import { ordenesService } from '../services/ordenesService'

export default function OrdenDetalle({
  modalDetalle, setModalDetalle,
  cambiarEstado, ESTADOS_ORDEN, getEstadoId, getKeyEstado,
  abrirEditar, setModalAnular,
}) {
  const orden = modalDetalle.orden
  const cerrar = () => setModalDetalle({ abierto: false, orden: null })
  const esAnulada    = getKeyEstado(orden?.estado) === 'anulado'
  const esCompletada = getKeyEstado(orden?.estado) === 'activo'

  const { data: detalle, isLoading } = useQuery({
    queryKey: ['orden-detalle', orden?.id],
    queryFn: () => ordenesService.getDetalle(orden.id),
    enabled: !!orden?.id && modalDetalle.abierto,
  })

  const productos = detalle?.productos || []

  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} bloquearCierre
      titulo={`Orden #${orden?.id}`} ancho="max-w-lg">
      {orden && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><p className="campo-label">Proveedor</p><p className="font-medium">{orden.proveedor}</p></div>
            <div><p className="campo-label">Total</p><p className="text-primary font-bold text-sm">{formatPrecio(orden.total)}</p></div>
            <div><p className="campo-label">Fecha Compra</p><p>{formatFecha(orden.fecha_compra || orden.created_at)}</p></div>
            {orden.metodo_pago       && <div><p className="campo-label">Método Pago</p><p>{orden.metodo_pago}</p></div>}
            {orden.fecha_limite_pago && <div><p className="campo-label">Límite Pago</p><p>{formatFecha(orden.fecha_limite_pago)}</p></div>}
            {(orden.registrado_por_nombre || orden.registrado_por) && <div><p className="campo-label">Registrado por</p><p>{orden.registrado_por_nombre || orden.registrado_por}</p></div>}
            {orden.notas && <div className="col-span-2"><p className="campo-label">Notas</p><p className="text-gray-500 italic">{orden.notas}</p></div>}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="campo-label mb-1">Estado</p>
            {esAnulada    ? <span className="badge-anulado">Anulado</span>
             : esCompletada ? <span className="badge-activo">Completado</span>
             : <span className="badge-pendiente">Pendiente</span>}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <p className="campo-label mb-1.5 flex items-center gap-1"><Package size={11} /> Productos comprados al proveedor</p>
            {isLoading ? (
              <div className="flex items-center justify-center py-4 text-gray-400 text-xs">
                <Loader2 size={14} className="animate-spin mr-2" /> Cargando productos...
              </div>
            ) : productos.length === 0 ? (
              <p className="text-center text-gray-400 text-xs py-3">Sin productos registrados</p>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto">
                {productos.map(p => (
                  <div key={p.id} className="p-2.5 rounded-lg bg-gray-50 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{p.producto}</span>
                      <span className="text-gray-400 shrink-0 ml-2">× {p.cantidad}</span>
                    </div>
                    {p.codigo_barras && <p className="text-gray-400 font-mono">{p.codigo_barras}</p>}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-200/70">
                      <div>
                        <span className="text-gray-400">Costo compra: </span>
                        <span className="font-medium">{formatPrecio(p.costo_unitario)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={10} className="text-primary" />
                        <span className="text-gray-400">
                          {esCompletada ? 'Precio aplicado: ' : 'Precio proyectado: '}
                        </span>
                        <span className="font-semibold text-primary">
                          {formatPrecio(esCompletada ? (p.precio_aplicado ?? p.precio_venta_proyectado) : p.precio_venta_proyectado)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end text-gray-400">
                      Subtotal: <span className="text-light-text font-medium ml-1">{formatPrecio(p.subtotal)}</span>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-bold pt-1.5 border-t border-gray-200">
                  <span>Total Orden</span><span className="text-primary">{formatPrecio(orden.total)}</span>
                </div>
                {!esCompletada && !esAnulada && (
                  <p className="text-xs text-gray-400 italic pt-1">
                    El precio proyectado se aplicará automáticamente al producto cuando la orden se marque como Completada (margen del 45%).
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button onClick={() => descargarPDF(`/reportes/ordenes/${orden.id}`, `orden-${orden.id}.pdf`)}
              className="btn-outline text-xs">
              <Download size={12} /> Descargar
            </button>
            {!esAnulada && !esCompletada && (
              <button onClick={() => { cerrar(); abrirEditar(orden) }} className="btn-outline text-xs">
                <Edit2 size={12} /> Editar
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}