import Modal from '@shared/components/Modal'
import { Edit2 } from 'lucide-react'
import { formatFecha, formatPrecio } from '@shared/utils/validaciones'

export default function ClienteDetalle({ modalDetalle, setModalDetalle, abrirModal, historial }) {
  const item = modalDetalle.item
  const cerrar = () => setModalDetalle({ abierto: false, item: null })

  // Usar los campos calculados por el backend
  const limiteFiado     = item?.limite_fiado        ? +item.limite_fiado        : null
  const deudaActual     = item?.deuda_fiado_actual   ? +item.deuda_fiado_actual  : null
  const cupoDisponible  = item?.cupo_fiado_disponible != null
    ? +item.cupo_fiado_disponible : null

  // Fallback: calcular manualmente si el backend no los devuelve
  const fiadoConsumido  = deudaActual ?? historial
    .filter(p => {
      const est = p.estado?.toLowerCase() || ''
      return !est.includes('anula') && !est.includes('complet') && !est.includes('paga')
    })
    .reduce((s, p) => s + parseFloat(p.total || 0) - parseFloat(p.total_pagado || 0), 0)

  const fiadoDisponible = cupoDisponible ?? (
    limiteFiado != null ? Math.max(0, limiteFiado - fiadoConsumido) : null
  )

  const fiadoPorcentaje = limiteFiado && fiadoConsumido
    ? Math.min(100, (fiadoConsumido / limiteFiado) * 100)
    : 0

  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} bloquearCierre
      titulo="Detalle del Cliente" ancho="max-w-lg">
      {item && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="campo-label">Nombre</p>
              <p className="font-medium">{item.nombre} {item.apellido}</p></div>
            <div><p className="campo-label">Correo</p><p>{item.email || '—'}</p></div>
            <div><p className="campo-label">Documento</p>
              <p>{item.tipo_documento}: {item.numero_documento || '—'}</p></div>
            <div><p className="campo-label">Teléfono</p><p>{item.telefono || '—'}</p></div>
          </div>

          {/* sección fiado */}
          <div className={`p-3 rounded-xl border text-sm ${
            item.permite_fiado
              ? 'bg-amber-500/5 border-amber-500/20'
              : 'bg-light-bg dark:bg-dark-bg border-gray-200 dark:border-dark-border'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <p className="campo-label mb-0">Crédito</p>
              <span className={item.permite_fiado ? 'badge-activo' : 'text-xs text-gray-400'}>
                {item.permite_fiado ? 'Habilitado' : 'No habilitado'}
              </span>
            </div>
            {item.permite_fiado && limiteFiado != null && (
              <div className="space-y-1.5 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Deuda actual</span>
                  <span className="text-amber-600 font-medium">
                    {formatPrecio(fiadoConsumido)}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      fiadoPorcentaje >= 100 ? 'bg-red-400'
                      : fiadoPorcentaje > 70  ? 'bg-amber-400'
                      : 'bg-primary'
                    }`}
                    style={{ width: `${Math.min(100, fiadoPorcentaje)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Cupo disponible</span>
                  <span className={`font-semibold ${
                    fiadoDisponible === 0 ? 'text-red-400' : 'text-primary'
                  }`}>
                    {fiadoDisponible === 0
                      ? 'Sin cupo disponible'
                      : formatPrecio(fiadoDisponible)}
                  </span>
                </div>
                <div className="flex justify-between text-xs pt-0.5 border-t border-amber-200/50">
                  <span className="text-gray-400">Límite total</span>
                  <span className="text-amber-500 font-medium">
                    {formatPrecio(limiteFiado)}
                  </span>
                </div>
              </div>
            )}
            {item.permite_fiado && !limiteFiado && (
              <p className="text-xs text-gray-400 mt-1">Sin límite configurado</p>
            )}
          </div>

          <div>
            <p className="campo-label mb-2">Historial de Pedidos ({historial.length})</p>
            {historial.length === 0
              ? <p className="text-xs text-center text-gray-400 py-3">Sin pedidos</p>
              : (
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {historial.map(p => {
                    const est        = p.estado?.toLowerCase() || ''
                    const esCredito  = p.es_fiado === true || p.es_fiado === 'true'
                    const badgeClass = est.includes('anula')
                      ? 'badge-anulado'
                      : est.includes('paga') || est.includes('complet')
                        ? 'badge-activo'
                        : 'badge-pendiente'
                    const badgeLabel = est.includes('anula')
                      ? 'Anulado'
                      : est.includes('paga') || est.includes('complet')
                        ? 'Pagado'
                        : 'Pendiente'
                    return (
                      <div key={p.id}
                        className="flex items-center justify-between text-xs p-2
                          rounded bg-light-bg dark:bg-dark-bg gap-2">
                        <span className="font-medium shrink-0">#{p.id}</span>
                        <span className="text-gray-400 shrink-0">
                          {formatFecha(p.fecha_pedido)}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className={badgeClass}>{badgeLabel}</span>
                          {esCredito && (
                            <span className="inline-flex items-center px-1.5 py-0.5
                              rounded-full text-[10px] font-medium
                              bg-amber-500/15 border border-amber-500/30 text-amber-500">
                              Crédito
                            </span>
                          )}
                        </div>
                        <span className={`font-medium shrink-0 ${
                          est.includes('anula')
                            ? 'text-gray-400 line-through'
                            : 'text-primary'
                        }`}>
                          {formatPrecio(p.total)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )
            }
          </div>
        </div>
      )}
    </Modal>
  )
}