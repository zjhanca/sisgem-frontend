import { useState } from 'react'
import Modal from '@shared/components/Modal'
import { Download, Loader2 } from 'lucide-react'
import { descargarPDF } from '@shared/utils/reportes'

export default function ProveedorConfirmDescarga({ abierto, setAbierto }) {
  const [descargando, setDescargando] = useState(false)
  const cerrar = () => { if (!descargando) setAbierto(false) }

  const confirmar = async () => {
    setDescargando(true)
    try {
      await descargarPDF('/reportes/proveedores', 'reporte-proveedores.pdf')
    } finally {
      setDescargando(false)
      setAbierto(false)
    }
  }

  return (
    <Modal abierto={abierto} onCerrar={cerrar} bloquearCierre titulo="Descargar Reporte" ancho="max-w-sm">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          ¿Deseas descargar el <span className="font-semibold text-light-text">reporte de proveedores</span> en formato PDF?
        </p>
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button onClick={confirmar} disabled={descargando} className="btn-primary disabled:opacity-50 flex items-center gap-1.5">
            {descargando ? <><Loader2 size={13} className="animate-spin" /> Descargando...</> : <><Download size={13} /> Descargar</>}
          </button>
        </div>
      </div>
    </Modal>
  )
}