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
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} bloquearCierre titulo="Detalle de la Marca" ancho="max-w-lg">
      {item && (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            {item.logo
              ? <img src={item.logo} alt="" className="w-16 h-16 object-contain rounded-xl border border-gray-200"
                  onError={e => e.target.style.display='none'} />
              : <div className="w-16 h-16 rounded-xl border border-gray-200 bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-2xl">{item.nombre?.charAt(0).toUpperCase()}</span>
                </div>
            }
            <div className="flex-1">
              <h3 className="font-semibold text-light-text">{item.nombre}</h3>
              <span className={item.estado ? 'badge-activo' : 'badge-inactivo'}>{item.estado ? 'Activa' : 'Inactiva'}</span>
              {item.descripcion && <p className="text-xs text-gray-400 mt-1">{item.descripcion}</p>}
              {urlFinal && (
                <a href={urlFinal} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline">
                  <ExternalLink size={10} /> {urlFinal}
                </a>
              )}
            </div>
          </div>

          {proveedores.length > 0 && (
            <div>
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