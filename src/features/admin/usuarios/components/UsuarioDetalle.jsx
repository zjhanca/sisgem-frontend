import Modal from '@shared/components/Modal'
import { Edit2 } from 'lucide-react'
 
export default function UsuarioDetalle({ modalDetalle, setModalDetalle, abrirModal }) {
  const item = modalDetalle.item
  const cerrar = () => setModalDetalle({ abierto: false, item: null })
  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} bloquearCierre titulo="Detalle del Usuario">
      {item && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="campo-label">Nombre</p><p className="font-medium">{item.nombre} {item.apellido}</p></div>
            <div><p className="campo-label">Estado</p>
              <span className={item.estado ? 'badge-activo' : 'badge-inactivo'}>{item.estado ? 'Activo' : 'Inactivo'}</span></div>
            <div><p className="campo-label">Documento</p><p>{item.tipo_documento}: {item.numero_documento || '—'}</p></div>
            <div><p className="campo-label">Rol</p><p>{item.rol}</p></div>
            <div className="col-span-2"><p className="campo-label">Correo</p><p>{item.email}</p></div>
          </div>
          <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => { cerrar(); abrirModal(item) }} className="btn-outline text-xs"><Edit2 size={12} /> Editar</button>
          </div>
        </div>
      )}
    </Modal>
  )
}