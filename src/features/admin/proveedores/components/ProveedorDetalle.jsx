import Modal from '@shared/components/Modal'
import { Edit2 } from 'lucide-react'
 
export default function ProveedorDetalle({ modalDetalle, setModalDetalle, abrirModal, toggleEstado }) {
  const item = modalDetalle.item
  const cerrar = () => setModalDetalle({ abierto: false, item: null })
  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} bloquearCierre titulo="Detalle del Proveedor">
      {item && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="campo-label">Razón Social</p><p className="font-medium">{item.nombre}</p></div>
            <div><p className="campo-label">Estado</p>
              <span className={item.estado ? 'badge-activo' : 'badge-inactivo'}>{item.estado ? 'Activo' : 'Inactivo'}</span></div>
            <div><p className="campo-label">Tipo Persona</p><p className="capitalize">{item.tipo_persona}</p></div>
            <div><p className="campo-label">Documento</p><p>{item.tipo_documento}: {item.documento}</p></div>
            <div><p className="campo-label">Contacto</p><p>{item.contacto || '—'}</p></div>
            <div><p className="campo-label">Teléfono</p><p>{item.telefono || '—'}</p></div>
            <div><p className="campo-label">Correo</p><p>{item.email || '—'}</p></div>
            <div><p className="campo-label">Dirección</p><p>{item.direccion || '—'}</p></div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => toggleEstado.mutate(item.id)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${item.estado ? 'border-red-400/40 text-red-400 hover:bg-red-400/10' : 'border-primary/40 text-primary hover:bg-primary/10'}`}>
              {item.estado ? 'Desactivar' : 'Activar'}
            </button>
            <button onClick={() => { cerrar(); abrirModal(item) }} className="btn-outline text-xs"><Edit2 size={12} /> Editar</button>
          </div>
        </div>
      )}
    </Modal>
  )
}