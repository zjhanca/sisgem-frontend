import { useState } from 'react'
import Modal from './Modal'
import { Download, Loader2, FileText, FileSpreadsheet } from 'lucide-react'

const PERIODOS = [
  { key: 'dia',    label: 'Día' },
  { key: 'semana', label: 'Semana' },
  { key: 'mes',    label: 'Mes' },
  { key: 'rango',  label: 'Personalizado' },
]

/**
 * Modal único de descarga de reportes: elige período (día / semana / mes /
 * personalizado) y formato (PDF / Excel) en un solo lugar.
 *
 * descargarReporte({ tipo, formato, desde, hasta }) — misma firma que ya
 * usa el Dashboard, para reutilizar los mismos endpoints del backend.
 */
export default function ReporteDescargaModal({ abierto, setAbierto, descargarReporte, nombreEntidad = 'reporte' }) {
  const [periodo, setPeriodo]         = useState('dia')
  const [formato, setFormato]         = useState('pdf')
  const [desde, setDesde]             = useState('')
  const [hasta, setHasta]             = useState('')
  const [descargando, setDescargando] = useState(false)
  const hoy = new Date().toISOString().split('T')[0]

  const esRango = periodo === 'rango'

  const cerrar = () => {
    if (descargando) return
    setAbierto(false)
    setPeriodo('dia'); setFormato('pdf'); setDesde(''); setHasta('')
  }

  const confirmar = async () => {
    if (esRango && (!desde || !hasta)) return
    setDescargando(true)
    try {
      await descargarReporte({ tipo: periodo, formato, desde, hasta })
    } finally {
      setDescargando(false)
      cerrar()
    }
  }

  return (
    <Modal abierto={abierto} onCerrar={cerrar} bloquearCierre
      titulo={`Descargar reporte de ${nombreEntidad}`} ancho="max-w-sm">
      <div className="space-y-4">
        <div>
          <p className="campo-label mb-1.5">Periodo</p>
          <div className="grid grid-cols-4 gap-1.5">
            {PERIODOS.map(p => (
              <button key={p.key} type="button" onClick={() => setPeriodo(p.key)}
                className={`px-2 py-1.5 text-xs rounded-lg border transition-colors ${
                  periodo === p.key ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-500 hover:border-primary/40'
                }`}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

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
    </Modal>
  )
}