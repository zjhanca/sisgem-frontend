import { useState } from 'react'
import Modal from '@shared/components/Modal'
import { formatPrecio } from '@shared/utils/validaciones'
import { AlertTriangle } from 'lucide-react'

export default function VentaAnular({ modalAnular, setModalAnular, anular, anulando }) {
  const [nota, setNota] = useState('')
  const venta = modalAnular.venta

  const cerrar = () => {
    setModalAnular({ abierto: false, venta: null })
    setNota('')
  }

  const handleAnular = () => {
    if (!nota.trim()) return
    anular.mutate({ id: venta.id, nota: nota.trim() })
    setNota('')
  }

  return (
    <Modal abierto={modalAnular.abierto} onCerrar={cerrar} bloquearCierre
      titulo="Confirmar Anulación" ancho="max-w-sm">
      <div className="space-y-4">

        {/* Info venta */}
        <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">
            ¿Anular la venta{' '}
            <span className="font-semibold">#{venta?.id}</span>{' '}
            por{' '}
            <span className="font-semibold">{formatPrecio(venta?.total)}</span>?
            Esta acción no se puede deshacer.
          </p>
        </div>

        {/* Nota obligatoria */}
        <div>
          <label className="campo-label">
            Motivo de anulación <span className="text-red-400">*</span>
          </label>
          <textarea
            value={nota}
            onChange={e => setNota(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="Ej: Error en los productos, solicitud del cliente, producto sin stock..."
            className="campo-input resize-none text-sm"
          />
          <div className="flex justify-between mt-1">
            {!nota.trim() && (
              <p className="text-xs text-red-400">El motivo es obligatorio</p>
            )}
            <span className="text-xs text-gray-400 ml-auto">{nota.length}/300</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button onClick={cerrar}
            className="flex-1 py-2 text-sm border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button
            onClick={handleAnular}
            disabled={anulando || !nota.trim()}
            className="flex-1 py-2 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50 hover:bg-red-600 transition-colors">
            {anulando ? 'Anulando...' : 'Anular venta'}
          </button>
        </div>
      </div>
    </Modal>
  )
}