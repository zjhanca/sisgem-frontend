import Modal from '@shared/components/Modal'
import { Edit2 } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'
 
export default function ProductoDetalle({ modalDetalle, setModalDetalle, abrirModal }) {
  const item = modalDetalle.item
  const cerrar = () => setModalDetalle({ abierto: false, item: null })
  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} titulo="Detalle del Producto">
      {item && (
        <div className="space-y-3">
          {item.imagen_url && <img src={item.imagen_url} alt="" className="w-full h-40 object-cover rounded-xl" onError={e => e.target.style.display='none'} />}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="campo-label">Nombre</p><p className="font-medium">{item.nombre}</p></div>
            <div><p className="campo-label">Estado</p><span className={item.estado ? 'badge-activo' : 'badge-inactivo'}>{item.estado ? 'Activo' : 'Inactivo'}</span></div>
            <div><p className="campo-label">Precio</p><p className="text-primary font-bold">{formatPrecio(item.precio)}</p></div>
            <div><p className="campo-label">Stock</p><p className={item.stock <= 5 ? 'text-red-400 font-semibold' : ''}>{item.stock} uds</p></div>
            <div><p className="campo-label">Categoría</p><p>{item.categoria || '—'}</p></div>
            <div><p className="campo-label">Marca</p><p>{item.marca || '—'}</p></div>
            <div><p className="campo-label">Proveedor</p><p>{item.proveedor || '—'}</p></div>
            <div><p className="campo-label">Código Barras</p><p className="font-mono text-xs">{item.codigo_barras || '—'}</p></div>
          </div>
          <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => { cerrar(); abrirModal(item) }} className="btn-outline text-xs"><Edit2 size={12} /> Editar</button>
          </div>
        </div>
      )}
    </Modal>
  )
}
