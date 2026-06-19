import Modal from '@shared/components/Modal'
import { Edit2, ExternalLink } from 'lucide-react'
import { normalizarUrl } from '../hooks/useMarcas'

export default function MarcaDetalle({ modalDetalle, setModalDetalle, abrirModal }) {
  const item = modalDetalle.item
  const cerrar = () => setModalDetalle({ abierto: false, item: null })
  const urlFinal = item?.sitio_web ? normalizarUrl(item.sitio_web) : ''

  const proveedores = (() => {
    if (!item) return []
    let p = item.proveedores
    if (typeof p === 'string') { try { p = JSON.parse(p) } catch { return [] } }
    return Array.isArray(p) ? p : []
  })()

  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} bloquearCierre titulo="Detalle de la Marca" ancho="max-w-sm">
      {item && (
        <div className="space-y-3 text-sm">

          {/* logo + datos en dos columnas */}
          <div className="flex gap-3">
            {item.logo
              ? <img src={item.logo} alt="" className="w-20 h-20 object-contain rounded-xl border border-gray-200 shrink-0"
                  onError={e => e.target.style.display='none'} />
              : <div className="w-20 h-20 rounded-xl border border-gray-200 bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-3xl">{item.nombre?.charAt(0).toUpperCase()}</span>
                </div>
            }

            <div className="flex-1 min-w-0 space-y-1.5 content-start">
              <div>
                <p className="campo-label">Nombre</p>
                <p className="font-semibold truncate">{item.nombre}</p>
              </div>
              <div>
                <p className="campo-label">Estado</p>
                <span className={item.estado ? 'badge-activo' : 'badge-inactivo'}>{item.estado ? 'Activa' : 'Inactiva'}</span>
              </div>
              {urlFinal && (
                <div>
                  <p className="campo-label">Sitio web</p>
                  <a href={urlFinal} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary flex items-center gap-1 hover:underline truncate">
                    <ExternalLink size={10} className="shrink-0" /> {urlFinal}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* descripción */}
          {item.descripcion && (
            <div className="pt-2 border-t border-gray-100">
              <p className="campo-label">Descripción</p>
              <p className="text-xs text-gray-500">{item.descripcion}</p>
            </div>
          )}

          {/* proveedores */}
          {proveedores.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <p className="campo-label mb-1.5">Proveedores relacionados</p>
              <div className="flex flex-wrap gap-1.5">
                {proveedores.map(p => (
                  <span key={p.id} className="inline-flex items-center px-2 py-0.5 rounded-full
                    bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
                    {p.nombre}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button onClick={() => { cerrar(); abrirModal(item) }} className="btn-outline text-xs">
              <Edit2 size={12} /> Editar
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}