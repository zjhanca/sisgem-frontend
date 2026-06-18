import { useState } from 'react'
import Modal from '@shared/components/Modal'
import { Download, Loader2 } from 'lucide-react'
import { descargarPDF } from '@shared/utils/reportes'

/**
 * confirmDescarga: null | { tipo: 'reporte' } | { tipo: 'pago', id }
 * Para tipo 'pago', el id corresponde al pedido_id de la venta (no a un pago individual),
 * ya que la vista de Pagos ahora está agrupada por venta.
 */
export default function PagoConfirmDescarga({ confirmDescarga, setConfirmDescarga }) {
  const [descargando, setDescargando] = useState(false)
  const cerrar = () => { if (!descargando) setConfirmDescarga(null) }

  const confirmar = async () => {
    if (!confirmDescarga) return
    setDescargando(true)
    try {
      if (confirmDescarga.tipo === 'pago') {
        await descargarPDF(`/reportes/pagos/pedido/${confirmDescarga.id}`, `pagos-pedido-${confirmDescarga.id}.pdf`)
      } else {
        await descargarPDF('/reportes/pagos', 'reporte-pagos.pdf')
      }
    } finally {
      setDescargando(false)
      setConfirmDescarga(null)
    }
  }

  const etiqueta = confirmDescarga?.tipo === 'pago'
    ? `el historial de pagos de la venta #${confirmDescarga.id}`
    : 'el reporte de pagos'

  return (
    <Modal abierto={!!confirmDescarga} onCerrar={cerrar} bloquearCierre titulo="Descargar PDF" ancho="max-w-sm">
      {confirmDescarga && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Deseas descargar <span className="font-semibold text-light-text">{etiqueta}</span> en formato PDF?
          </p>
          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button onClick={confirmar} disabled={descargando} className="btn-primary disabled:opacity-50 flex items-center gap-1.5">
              {descargando ? <><Loader2 size={13} className="animate-spin" /> Descargando...</> : <><Download size={13} /> Descargar</>}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}