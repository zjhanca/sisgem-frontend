import Modal from '@shared/components/Modal'
import { Edit2, Shield, Lock } from 'lucide-react'
 
export default function RolDetalle({ modalDetalle, setModalDetalle, abrirModal, esAdmin }) {
  const item = modalDetalle.item
  const cerrar = () => setModalDetalle({ abierto: false, item: null })
  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} titulo="Detalle del Rol">
      {item && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="campo-label">Nombre</p><p className="font-medium">{item.nombre}</p></div>
            <div><p className="campo-label">Estado</p><span className={item.estado ? 'badge-activo' : 'badge-inactivo'}>{item.estado ? 'Activo' : 'Inactivo'}</span></div>
            <div><p className="campo-label">Usuarios Asignados</p><span className="badge-proceso">{item.total_usuarios}</span></div>
            {item.descripcion && <div className="col-span-2"><p className="campo-label">Descripción</p><p className="text-xs text-gray-500">{item.descripcion}</p></div>}
          </div>
          {esAdmin(item.id) ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 text-xs text-yellow-600 dark:text-yellow-400">
              <Lock size={13} /> Este rol es el administrador principal y no puede ser modificado.
            </div>
          ) : (
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
              <button onClick={() => { cerrar(); abrirModal(item) }} className="btn-outline text-xs"><Edit2 size={12} /> Editar</button>
              <button onClick={() => { cerrar(); abrirModal(item).then?.(() => {}) }} className="btn-outline text-xs"><Shield size={12} /> Permisos</button>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
