import { useState } from 'react'
import Modal from '@shared/components/Modal'
import { Download, Loader2, FileText, Receipt } from 'lucide-react'
import { descargarPDF } from '@shared/utils/reportes'

export default function PagoConfirmDescarga({ confirmDescarga, setConfirmDescarga }) {
  const [descargando, setDescargando] = useState(false)
  const [formato, setFormato]         = useState('tirilla')
  const cerrar = () => { if (!descargando) { setConfirmDescarga(null); setFormato('tirilla') } }

  const confirmar = async () => {
    if (!confirmDescarga) return
    setDescargando(true)
    try {
      if (confirmDescarga.tipo === 'pago') {
        if (formato === 'tirilla') {
          await descargarPDF(
            `/reportes/pagos/pedido/${confirmDescarga.id}/tirilla`,
            `pagos-pedido-${confirmDescarga.id}.pdf`
          )
        } else {
          await descargarPDF(
            `/reportes/pagos/pedido/${confirmDescarga.id}`,
            `pagos-pedido-${confirmDescarga.id}.pdf`
          )
        }
      } else {
        await descargarPDF('/reportes/pagos', 'reporte-pagos.pdf')
      }
    } finally {
      setDescargando(false)
      setConfirmDescarga(null)
      setFormato('tirilla')
    }
  }

  const etiqueta = confirmDescarga?.tipo === 'pago'
    ? `historial de pagos de la venta ${confirmDescarga.id}`
    : 'reporte de pagos'

  return (
    <Modal abierto={!!confirmDescarga} onCerrar={cerrar} bloquearCierre
      titulo="Descargar PDF" ancho="max-w-sm">
      {confirmDescarga && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Descargando <span className="font-semibold text-light-text">{etiqueta}</span>.
          </p>

          {/* Selector formato solo para historial de pagos */}
          {confirmDescarga.tipo === 'pago' && (
            <div>
              <label className="campo-label mb-2">Formato</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setFormato('tirilla')}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all ${
                    formato === 'tirilla'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <Receipt size={18} className={formato === 'tirilla' ? 'text-primary' : 'text-gray-400'} />
                  <span className={`text-xs font-medium ${formato === 'tirilla' ? 'text-primary' : 'text-gray-500'}`}>
                    Tirilla
                  </span>
                  <span className="text-xs text-gray-400">80mm · B&N</span>
                </button>
                <button type="button" onClick={() => setFormato('a4')}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all ${
                    formato === 'a4'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                  <FileText size={18} className={formato === 'a4' ? 'text-primary' : 'text-gray-400'} />
                  <span className={`text-xs font-medium ${formato === 'a4' ? 'text-primary' : 'text-gray-500'}`}>
                    A4
                  </span>
                  <span className="text-xs text-gray-400">Carta · Color</span>
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button onClick={cerrar} disabled={descargando}
              className="px-4 py-1.5 text-sm border border-gray-200 text-gray-500 rounded-lg">
              Cancelar
            </button>
            <button onClick={confirmar} disabled={descargando}
              className="btn-primary disabled:opacity-50 flex items-center gap-1.5">
              {descargando
                ? <><Loader2 size={13} className="animate-spin" /> Descargando...</>
                : <><Download size={13} /> Descargar</>}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}