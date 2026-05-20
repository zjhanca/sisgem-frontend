import Modal from '@shared/components/Modal'
import { Edit2 } from 'lucide-react'
import { formatFecha, formatPrecio } from '@shared/utils/validaciones'
 
export default function ClienteDetalle({ modalDetalle, setModalDetalle, abrirModal, historial }) {
  const item = modalDetalle.item
  const cerrar = () => setModalDetalle({ abierto: false, item: null })
 
  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar}
      titulo="Detalle del Cliente" ancho="max-w-lg">
      {item && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="campo-label">Nombre</p>
              <p className="font-medium">{item.nombre} {item.apellido}</p></div>
            <div><p className="campo-label">Estado</p>
              <span className={item.estado ? 'badge-activo' : 'badge-inactivo'}>
                {item.estado ? 'Activo' : 'Inactivo'}</span></div>
            <div><p className="campo-label">Documento</p>
              <p>{item.tipo_documento}: {item.numero_documento || '—'}</p></div>
            <div><p className="campo-label">Teléfono</p><p>{item.telefono || '—'}</p></div>
            <div className="col-span-2"><p className="campo-label">Correo</p><p>{item.email || '—'}</p></div>
          </div>
          <div>
            <p className="campo-label mb-2">Historial de Pedidos ({historial.length})</p>
            {historial.length === 0
              ? <p className="text-xs text-center text-gray-400 py-3">Sin pedidos</p>
              : (
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {historial.map(p => (
                    <div key={p.id} className="flex justify-between text-xs p-2 rounded bg-light-bg dark:bg-dark-bg">
                      <span className="font-medium">#{p.id}</span>
                      <span className="text-gray-400">{formatFecha(p.fecha_pedido)}</span>
                      <span className="text-primary">{formatPrecio(p.total)}</span>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
          <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => { cerrar(); abrirModal(item) }} className="btn-outline text-xs">
              <Edit2 size={12} /> Editar
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}
