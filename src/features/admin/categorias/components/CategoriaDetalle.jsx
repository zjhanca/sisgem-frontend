import Modal from '@shared/components/Modal'
import { Edit2 } from 'lucide-react'
import { formatFecha } from '@shared/utils/validaciones'

export default function CategoriaDetalle({ modalDetalle, setModalDetalle, abrirModal, toggleEstado }) {
  const item = modalDetalle.item
  const cerrar = () => setModalDetalle({ abierto: false, item: null })

  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} titulo="Detalle de Categoría">
      {item && (
        <div className="space-y-3">

          {/* ícono */}
          {item.icono && (
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center overflow-hidden shadow-md shadow-primary/20">
                <img src={item.icono} alt={item.nombre}
                  className="w-12 h-12 object-contain"
                  onError={e => e.target.style.display='none'} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="campo-label">Nombre</p>
              <p className="font-medium text-light-text dark:text-dark-text">{item.nombre}</p>
            </div>
            <div>
              <p className="campo-label">Estado</p>
              <span className={item.estado ? 'badge-activo' : 'badge-inactivo'}>
                {item.estado ? 'Activa' : 'Inactiva'}
              </span>
            </div>
            <div>
              <p className="campo-label">Margen</p>
              <p className="font-medium text-light-text dark:text-dark-text">{item.margen ?? 45}%</p>
            </div>
            <div>
              <p className="campo-label">Creada</p>
              <p className="text-light-text dark:text-dark-text">{formatFecha(item.created_at)}</p>
            </div>
            <div className="col-span-2">
              <p className="campo-label">Descripción</p>
              <p className="text-light-text dark:text-dark-text">{item.descripcion || 'Sin descripción'}</p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => toggleEstado.mutate(item.id)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                item.estado
                  ? 'border-red-400/40 text-red-400 hover:bg-red-400/10'
                  : 'border-primary/40 text-primary hover:bg-primary/10'
              }`}>
              {item.estado ? 'Desactivar' : 'Activar'}
            </button>
            <button onClick={() => { cerrar(); abrirModal(item) }} className="btn-outline text-xs">
              <Edit2 size={12} /> Editar
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}