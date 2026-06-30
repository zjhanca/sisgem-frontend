import { useQuery } from '@tanstack/react-query'
import Modal from '@shared/components/Modal'
import { Shield, Lock, Loader2 } from 'lucide-react'
import { rolesService } from '../services/rolesService'

const agruparPermisos = permisos => permisos.reduce((acc, p) => {
  if (!acc[p.modulo]) acc[p.modulo] = []
  acc[p.modulo].push(p)
  return acc
}, {})

export default function RolDetalle({ modalDetalle, setModalDetalle, abrirModal, esProtegido }) {
  const item = modalDetalle.item
  const cerrar = () => setModalDetalle({ abierto: false, item: null })

  const { data: detalle, isLoading } = useQuery({
    queryKey: ['rol-detalle', item?.id],
    queryFn: () => rolesService.getById(item.id).then(r => r.data.datos),
    enabled: !!item?.id && modalDetalle.abierto,
  })

  const permisos = detalle?.permisos || []
  const grupos = agruparPermisos(permisos)

  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} bloquearCierre titulo="Detalle del Rol">
      {item && (
        <div className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="campo-label">Nombre</p><p className="font-medium">{item.nombre}</p></div>
            <div>
              <p className="campo-label">Estado</p>
              <span className={item.estado ? 'badge-activo' : 'badge-inactivo'}>{item.estado ? 'Activo' : 'Inactivo'}</span>
              {item.descripcion && <p className="text-xs text-gray-500 mt-1">{item.descripcion}</p>}
            </div>
            <div><p className="campo-label">Usuarios Asignados</p><span className="badge-proceso">{item.total_usuarios}</span></div>
          </div>

          <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
            <p className="campo-label mb-1.5 flex items-center gap-1">
              <Shield size={11} /> Permisos asignados {!isLoading && `(${permisos.length})`}
            </p>
            {isLoading ? (
              <div className="flex items-center justify-center py-4 text-gray-400 text-xs">
                <Loader2 size={14} className="animate-spin mr-2" /> Cargando permisos...
              </div>
            ) : permisos.length === 0 ? (
              <p className="text-xs text-center text-gray-400 py-3">Este rol no tiene permisos asignados</p>
            ) : (
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                {Object.entries(grupos).map(([modulo, perms]) => (
                  <div key={modulo} className="rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden">
                    <div className="px-2.5 py-1.5 bg-gray-50 dark:bg-dark-bg">
                      <span className="text-xs font-semibold capitalize">{modulo}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 p-2">
                      {perms.map(p => (
                        <span key={p.id} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
                          {p.nombre.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {esProtegido(item.id) ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 text-xs text-yellow-600 dark:text-yellow-400">
              <Lock size={13} /> Este rol es del sistema y no puede ser modificado.
            </div>
          ) : (
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
              <button onClick={() => { cerrar(); abrirModal(item) }} className="btn-outline text-xs"><Shield size={12} /> Editar Permisos</button>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}