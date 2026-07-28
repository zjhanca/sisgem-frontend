import { useState } from 'react'
import Modal from '@shared/components/Modal'
import { Download, Loader2, FileText, FileSpreadsheet } from 'lucide-react'

/**
 * confirmDescarga: null | { tipo: 'dia' } | { tipo: 'semana' } | { tipo: 'mes' } | { tipo: 'rango' }
 */
export default function DashboardConfirmDescarga({ confirmDescarga, setConfirmDescarga, descargarReporte }) {
  const [descargando, setDescargando] = useState(false)
  const [formato, setFormato] = useState('pdf')
  const [desde, setDesde]     = useState('')
  const [hasta, setHasta]     = useState('')
  const hoy = new Date().toISOString().split('T')[0]

  const esRango = confirmDescarga?.tipo === 'rango'

  const cerrar = () => {
    if (descargando) return
    setConfirmDescarga(null)
    setFormato('pdf'); setDesde(''); setHasta('')
  }

  const confirmar = async () => {
    if (!confirmDescarga) return
    if (esRango && (!desde || !hasta)) return
    setDescargando(true)
    try {
      await descargarReporte({ tipo: confirmDescarga.tipo, formato, desde, hasta })
    } finally {
      setDescargando(false)
      cerrar()
    }
  }

  const etiquetas = {
    dia: 'el reporte diario de ventas',
    semana: 'el reporte semanal de ventas',
    mes: 'el reporte mensual de ventas',
    rango: 'el reporte de ventas del rango seleccionado',
  }
  const etiqueta = etiquetas[confirmDescarga?.tipo] || 'el reporte de ventas'

  return (
    <Modal abierto={!!confirmDescarga} onCerrar={cerrar} bloquearCierre titulo="Descargar Reporte" ancho="max-w-sm">
      {confirmDescarga && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Deseas descargar <span className="font-semibold text-light-text">{etiqueta}</span>?
          </p>

          {esRango && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="campo-label">Desde</label>
                <input type="date" value={desde} max={hasta || hoy}
                  onChange={e => setDesde(e.target.value)} className="campo-input text-xs" />
              </div>
              <div>
                <label className="campo-label">Hasta</label>
                <input type="date" value={hasta} min={desde} max={hoy}
                  onChange={e => setHasta(e.target.value)} className="campo-input text-xs" />
              </div>
            </div>
          )}

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
            <button onClick={confirmar} disabled={descargando || (esRango && (!desde || !hasta))}
              className="btn-primary disabled:opacity-50 flex items-center gap-1.5">
              {descargando ? <><Loader2 size={13} className="animate-spin" /> Descargando...</> : <><Download size={13} /> Descargar</>}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}