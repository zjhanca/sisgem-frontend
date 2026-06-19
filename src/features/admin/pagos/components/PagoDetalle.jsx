import Modal from '@shared/components/Modal'
import { Ban, History, Clock } from 'lucide-react'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'

export default function PagoDetalle({
  modalDetalle, setModalDetalle, grupoDetalle, setModalAnular,
  esAnulado, getEstadoPago, getFechaPago, puedeAnularPago, getLimiteAnulacionVenta,
}) {
  const cerrar = () => setModalDetalle({ abierto: false, pedido_id: null })
  const grupo = grupoDetalle
  const puedeAnular = grupo ? puedeAnularPago(grupo.pedido_id) : false
  const limite = grupo ? getLimiteAnulacionVenta(grupo) : null

  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} bloquearCierre
      titulo={grupo ? `Historial de Pagos — Venta #${grupo.pedido_id}` : 'Historial de Pagos'}>
      {grupo && (
        <div className="space-y-3 text-sm overflow-y-auto max-h-[75vh]">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="campo-label">Cliente</p><p className="font-medium">{grupo.cliente || '—'}</p></div>
            <div><p className="campo-label">Total venta</p><p>{formatPrecio(grupo.total_pedido)}</p></div>
            <div><p className="campo-label">Total pagado</p><p className="text-green-600 font-semibold">{formatPrecio(grupo.total_pagado)}</p></div>
            <div><p className="campo-label">Saldo pendiente</p>
              <p className={grupo.completo ? 'text-green-600 font-semibold' : 'text-primary font-semibold'}>
                {grupo.completo ? '✓ Completamente pagado' : formatPrecio(grupo.saldo_pendiente)}
              </p>
            </div>
          </div>

          {limite && (
            <div className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs ${
              puedeAnular ? 'bg-amber-500/5 border-amber-400/20 text-amber-600' : 'bg-gray-50 border-gray-200 text-gray-400'
            }`}>
              <Clock size={13} className="shrink-0" />
              <span>
                {puedeAnular
                  ? `Los pagos de esta venta se pueden anular hasta el ${formatFechaHora(limite)}`
                  : `El plazo para anular pagos de esta venta venció el ${formatFechaHora(limite)}`}
              </span>
            </div>
          )}

          <div className="pt-2 border-t border-gray-100">
            <p className="campo-label mb-1.5 flex items-center gap-1"><History size={11} /> Movimientos ({grupo.pagos.length})</p>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {grupo.pagos.map(pago => {
                const anulado = esAnulado(pago.estado)
                const { label, clase } = getEstadoPago(pago.estado)
                return (
                  <div key={pago.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${
                      anulado ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-gray-50 border-gray-100'
                    }`}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${anulado ? 'text-gray-400 line-through' : 'text-light-text'}`}>
                          {formatPrecio(pago.monto)}
                        </span>
                        <span className={clase}>{label}</span>
                      </div>
                      <p className="text-gray-400 mt-0.5">
                        {pago.metodo && <span className="capitalize">{pago.metodo}</span>}
                        {pago.metodo && ' · '}
                        {formatFechaHora(getFechaPago(pago))}
                      </p>
                    </div>
                    {!anulado && (
                      puedeAnular ? (
                        <button onClick={() => { cerrar(); setModalAnular({ abierto: true, pago }) }}
                          className="btn-ghost hover:text-red-400 shrink-0" title="Anular este pago">
                          <Ban size={13} />
                        </button>
                      ) : (
                        <button disabled title="El plazo de 72 horas de la venta ya expiró"
                          className="btn-ghost opacity-30 cursor-not-allowed shrink-0">
                          <Ban size={13} />
                        </button>
                      )
                    )}
                  </div>
                )
              })}
              {grupo.pagos.length === 0 && (
                <p className="text-center text-gray-400 py-3">Sin movimientos registrados</p>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}