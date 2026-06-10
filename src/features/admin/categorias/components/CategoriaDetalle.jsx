import Modal from '@shared/components/Modal'
import { Edit2 } from 'lucide-react'
import { formatFecha } from '@shared/utils/validaciones'

export default function CategoriaDetalle({ modalDetalle, setModalDetalle, abrirModal, toggleEstado }) {
  const item = modalDetalle.item
  const cerrar = () => setModalDetalle({ abierto: false, item: null })

  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} titulo="Detalle de Categoría">
      {item && (
        <div className="space-y-4">

          {/* header: ícono + nombre + estado */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-light-bg dark:bg-dark-bg">
            <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary/20
              flex items-center justify-center shrink-0 overflow-hidden">
              {item.icono
                ? <img src={item.icono} alt={item.nombre}
                    className="w-9 h-9 object-contain"
                    onError={e => e.target.style.display='none'} />
                : <span className="text-xl font-bold text-primary">
                    {item.nombre?.charAt(0).toUpperCase()}
                  </span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-light-text dark:text-dark-text truncate">{item.nombre}</p>
              <p className="text-xs text-gray-400 mt-0.5">{item.descripcion || 'Sin descripción'}</p>
            </div>
            <span className={`shrink-0 ${item.estado ? 'badge-activo' : 'badge-inactivo'}`}>
              {item.estado ? 'Activa' : 'Inactiva'}
            </span>
          </div>

          {/* datos */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="campo-label">Margen</p>
              <p className="font-semibold text-primary">{item.margen ?? 45}%</p>
            </div>
            <div>
              <p className="campo-label">Creada</p>
              <p className="text-light-text dark:text-dark-text">{formatFecha(item.created_at)}</p>
            </div>
            <div>
              <p className="campo-label">Última actualización</p>
              <p className="text-light-text dark:text-dark-text">{formatFecha(item.updated_at)}</p>
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