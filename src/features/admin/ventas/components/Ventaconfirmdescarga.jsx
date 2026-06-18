import { useState } from 'react'
import Modal from '@shared/components/Modal'
import { Download, Loader2 } from 'lucide-react'
import { descargarPDF } from '@shared/utils/reportes'

/**
 * confirmDescarga: null | { tipo: 'reporte' } | { tipo: 'comprobante', id }
 */
export default function VentaConfirmDescarga({ confirmDescarga, setConfirmDescarga }) {
  const [descargando, setDescargando] = useState(false)
  const cerrar = () => { if (!descargando) setConfirmDescarga(null) }

  const confirmar = async () => {
    if (!confirmDescarga) return
    setDescargando(true)
    try {
      if (confirmDescarga.tipo === 'comprobante') {
        await descargarPDF(`/reportes/pedido/${confirmDescarga.id}`, `comprobante-${confirmDescarga.id}.pdf`)
      } else {
        await descargarPDF('/reportes/ventas', 'reporte-ventas.pdf')
      }
    } finally {
      setDescargando(false)
      setConfirmDescarga(null)
    }
  }

  const etiqueta = confirmDescarga?.tipo === 'comprobante'
    ? `el comprobante de la venta #${confirmDescarga.id}`
    : 'el reporte de ventas'

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