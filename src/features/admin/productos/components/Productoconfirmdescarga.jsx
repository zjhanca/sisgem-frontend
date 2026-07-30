import { useState } from 'react'
import Modal from '@shared/components/Modal'
import { Download, Loader2, FileText, FileSpreadsheet } from 'lucide-react'

export default function ProductoConfirmDescarga({ abierto, setAbierto, descargarReporte }) {
  const [descargando, setDescargando] = useState(false)
  const [formato, setFormato] = useState('pdf')

  const cerrar = () => {
    if (descargando) return
    setAbierto(false)
    setFormato('pdf')
  }

  const confirmar = async () => {
    setDescargando(true)
    try {
      await descargarReporte({ formato })
    } finally {
      setDescargando(false)
      cerrar()
    }
  }

  return (
    <Modal abierto={abierto} onCerrar={cerrar} bloquearCierre titulo="Descargar Reporte" ancho="max-w-sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          ¿Deseas descargar el <span className="font-semibold text-light-text">reporte de productos</span>?
        </p>

        <div>
          <p className="campo-label mb-1.5">Formato</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setFormato('pdf')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-colors ${
                formato === 'pdf' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-500 hover:border-primary/40'
              }`}>
              <FileText size={13} /> PDF
            </button>
            <button type="button" onClick={() => setFormato('excel')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-colors ${
                formato === 'excel' ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-500 hover:border-primary/40'
              }`}>
              <FileSpreadsheet size={13} /> Excel
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button onClick={confirmar} disabled={descargando} className="btn-primary disabled:opacity-50 flex items-center gap-1.5">
            {descargando ? <><Loader2 size={13} className="animate-spin" /> Descargando...</> : <><Download size={13} /> Descargar</>}
          </button>
        </div>
      </div>
    </Modal>
  )
}