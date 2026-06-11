import Modal from '@shared/components/Modal'
import { Download, Clock } from 'lucide-react'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'

function proximoAbono(fechaVenta) {
  if (!fechaVenta) return null
  const fecha = new Date(fechaVenta)
  fecha.setDate(fecha.getDate() + 15)
  return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

function diasRestantes(fechaVenta) {
  if (!fechaVenta) return null
  const hoy = new Date()
  const limite = new Date(fechaVenta)
  limite.setDate(limite.getDate() + 15)
  return Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24))
}

export default function VentaDetalle({ modalDetalle, setModalDetalle, setModalAnular, getBadge }) {
  const venta = modalDetalle.venta
  const cerrar = () => setModalDetalle({ abierto: false, venta: null })
  const esFiado = venta?.permite_fiado && venta?.estado?.toLowerCase().includes('pendiente')
  const dias = esFiado ? diasRestantes(venta?.fecha_pedido) : null
  const vencida = dias !== null && dias < 0

  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} bloquearCierre titulo={`Venta #${venta?.id}`}>
      {venta && (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="campo-label">Cliente</p><p className="font-medium">{venta.cliente}</p></div>
            <div><p className="campo-label">Tipo</p>
              <span className="inline-block w-20 text-center">
                <span className="badge bg-primary/20 text-green-700">Mostrador</span>
              </span>
            </div>
            <div><p className="campo-label">Estado</p>
              <span className="inline-block w-20 text-center">
                <span className={getBadge(venta.estado)}>{venta.estado}</span>
              </span>
            </div>
            <div><p className="campo-label">Total</p><p className="text-primary font-bold text-sm">{formatPrecio(venta.total)}</p></div>
            <div className="col-span-2"><p className="campo-label">Fecha</p><p>{formatFechaHora(venta.fecha_pedido)}</p></div>
          </div>

          {esFiado && (
            <div className={`flex items-start gap-2 p-3 rounded-lg border text-xs ${
              vencida ? 'bg-red-500/10 border-red-400/30' : dias <= 3 ? 'bg-amber-500/10 border-amber-400/30' : 'bg-amber-500/5 border-amber-400/20'
            }`}>
              <Clock size={14} className={`shrink-0 mt-0.5 ${vencida ? 'text-red-400' : 'text-amber-500'}`} />
              <div className="flex-1">
                <p className={`font-semibold ${vencida ? 'text-red-400' : 'text-amber-500'}`}>
                  {vencida ? 'Abono vencido' : 'Venta a crédito — Fiado'}
                </p>
                <p className="text-gray-400 mt-0.5">
                  Próximo abono: <span className={`font-medium ${vencida ? 'text-red-400' : 'text-amber-500'}`}>
                    {proximoAbono(venta.fecha_pedido)}
                  </span>
                </p>
                <p className={`mt-0.5 ${vencida ? 'text-red-400' : dias <= 3 ? 'text-amber-400' : 'text-gray-400'}`}>
                  {vencida ? `Vencido hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`
                    : dias === 0 ? 'Vence hoy'
                    : `Faltan ${dias} día${dias !== 1 ? 's' : ''}`}
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-gray-100">
            <button onClick={() => descargarPDF(`/reportes/pedido/${venta.id}`, `comprobante-${venta.id}.pdf`)}
              className="btn-outline text-xs"><Download size={12} /> Comprobante</button>
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