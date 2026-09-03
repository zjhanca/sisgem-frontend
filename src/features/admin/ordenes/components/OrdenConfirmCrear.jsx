import Modal from '@shared/components/Modal'
import { formatPrecio } from '@shared/utils/validaciones'
import { ShoppingCart } from 'lucide-react'

export default function OrdenConfirmCrear({ abierto, onCerrar, onConfirmar, form, totalOrden, creando }) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} bloquearCierre
      titulo="Confirmar Compra" ancho="max-w-sm">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <ShoppingCart size={18} className="text-primary shrink-0" />
          <div>
            <p className="text-sm font-semibold text-primary">¿Registrar esta compra?</p>
            <p className="text-xs text-gray-500">
              Esta acción actualizará el stock y precios de los productos.
            </p>
          </div>
        </div>

        {/* Resumen */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Productos</span>
            <span>{form.productos?.length || 0} ítem(s)</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Método de pago</span>
            <span>{form.metodo_pago || '—'}</span>
          </div>
          <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-100">
            <span>Total</span>
            <span className="text-primary">{formatPrecio(totalOrden)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button type="button" onClick={onCerrar}
            className="px-4 py-1.5 text-sm border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50">
            Cancelar
          </button>
          <button type="button" onClick={onConfirmar} disabled={creando}
            className="btn-primary disabled:opacity-50">
            {creando ? 'Registrando...' : 'Sí, registrar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}