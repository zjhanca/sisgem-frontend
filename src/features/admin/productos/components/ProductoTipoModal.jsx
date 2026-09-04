import Modal from '@shared/components/Modal'
import { Package, PackagePlus } from 'lucide-react'

export default function ProductoTipoModal({ abierto, onCerrar, onSeleccionar }) {
  return (
    <Modal abierto={abierto} onCerrar={onCerrar} bloquearCierre={false}
      titulo="Nuevo Producto" ancho="max-w-sm">
      <div className="space-y-3">
        <p className="text-xs text-gray-500">
          ¿Cómo deseas registrar el producto?
        </p>
        <div className="grid grid-cols-1 gap-3">

          <button type="button" onClick={() => onSeleccionar('sin_stock')}
            className="flex items-start gap-3 p-4 rounded-xl border border-gray-200
              hover:border-primary/40 hover:bg-primary/5 transition-all text-left group">
            <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-primary/10
              flex items-center justify-center shrink-0 transition-colors">
              <Package size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-sm font-semibold text-light-text">Producto sin stock</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Solo información básica. El stock y precio se asignan
                cuando registres una compra.
              </p>
            </div>
          </button>

          <button type="button" onClick={() => onSeleccionar('con_stock')}
            className="flex items-start gap-3 p-4 rounded-xl border border-gray-200
              hover:border-primary/40 hover:bg-primary/5 transition-all text-left group">
            <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-primary/10
              flex items-center justify-center shrink-0 transition-colors">
              <PackagePlus size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-sm font-semibold text-light-text">Producto con stock existente</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Ya tienes unidades en inventario. Registra stock y precio
                de venta desde el inicio.
              </p>
            </div>
          </button>

        </div>
      </div>
    </Modal>
  )
}