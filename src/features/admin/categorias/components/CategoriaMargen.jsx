import { useState, useEffect } from 'react'
import Modal from '@shared/components/Modal'

export default function CategoriaMargen({ modalMargen, setModalMargen, actualizarMargen }) {
  const [margenInput, setMargenInput] = useState('')

  useEffect(() => {
    if (modalMargen.abierto && modalMargen.item) {
      setMargenInput(modalMargen.item.margen ?? 45)
    }
  }, [modalMargen.abierto, modalMargen.item])

  const cerrar = () => setModalMargen({ abierto: false, item: null })

  return (
    <Modal abierto={modalMargen.abierto} onCerrar={cerrar}
      titulo={`Margen — ${modalMargen.item?.nombre}`} ancho="max-w-xs">
      <div className="space-y-4">
        <p className="text-xs text-gray-400">
          El margen se aplica al costo unitario al completar una orden de compra.<br />
          Precio venta = costo x (1 + margen / 100)
        </p>
        <div>
          <label className="campo-label">Margen (%)</label>
          <input type="number" min="0" max="500" step="0.5"
            value={margenInput}
            onChange={e => setMargenInput(e.target.value)}
            className="campo-input" placeholder="45" />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
          <button onClick={cerrar}
            className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">
            Cancelar
          </button>
          <button
            onClick={() => actualizarMargen.mutate(
              { id: modalMargen.item.id, margen: +margenInput },
              { onSuccess: cerrar }
            )}
            disabled={actualizarMargen.isPending}
            className="btn-primary disabled:opacity-50">
            {actualizarMargen.isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}