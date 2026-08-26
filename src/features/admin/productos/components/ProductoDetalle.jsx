import { useState, useEffect } from 'react'
import Modal from '@shared/components/Modal'
import { Edit2, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'

export default function ProductoDetalle({ modalDetalle, setModalDetalle, abrirModal }) {
  const item = modalDetalle.item
  const cerrar = () => setModalDetalle({ abierto: false, item: null })
  const [imgIdx, setImgIdx] = useState(0)

  useEffect(() => { setImgIdx(0) }, [item?.id])

  const imagenes = (() => {
    if (!item) return []
    let imgs = item.imagenes
    if (typeof imgs === 'string') { try { imgs = JSON.parse(imgs) } catch { imgs = [] } }
    if (Array.isArray(imgs) && imgs.length > 0) {
      const limpias = imgs.filter(Boolean)
      if (limpias.length > 0) return limpias
    }
    return item.imagen_url ? [item.imagen_url] : []
  })()

  const prev = () => setImgIdx(i => (i - 1 + imagenes.length) % imagenes.length)
  const next = () => setImgIdx(i => (i + 1) % imagenes.length)

  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} bloquearCierre
      titulo="Detalle del Producto" ancho="max-w-lg">
      {item && (
        <div className="space-y-3">

          {/* imagen + datos básicos */}
          <div className="flex gap-3">
            {imagenes.length > 0 ? (
              <div className="relative shrink-0 w-32 h-32 rounded-xl overflow-hidden bg-gray-100">
                <img src={imagenes[imgIdx]} alt="" className="w-full h-full object-cover"
                  onError={e => e.target.style.display='none'} />
                {imagenes.length > 1 && (<>
                  <button type="button" onClick={prev}
                    className="absolute left-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-black/40 text-white hover:bg-black/60">
                    <ChevronLeft size={13} />
                  </button>
                  <button type="button" onClick={next}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded-full bg-black/40 text-white hover:bg-black/60">
                    <ChevronRight size={13} />
                  </button>
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                    {imagenes.map((_, i) => (
                      <button key={i} type="button" onClick={() => setImgIdx(i)}
                        className={`w-1 h-1 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} />
                    ))}
                  </div>
                </>)}
              </div>
            ) : (
              <div className="shrink-0 w-32 h-32 rounded-xl bg-primary/10 flex items-center justify-center text-primary/30 text-xs">
                Sin imagen
              </div>
            )}

            <div className="flex-1 min-w-0 grid grid-cols-3 gap-x-2 gap-y-2 text-sm content-start">
              <div className="col-span-3">
                <p className="campo-label">Nombre</p>
                <p className="font-medium truncate">{item.nombre}</p>
              </div>
              <div>
                <p className="campo-label">Precio venta</p>
                <p className="text-primary font-bold">{formatPrecio(item.precio)}</p>
              </div>
              <div>
                <p className="campo-label">Stock</p>
                <p className={item.stock <= 5 ? 'text-red-400 font-semibold' : ''}>{item.stock} uds</p>
              </div>
              <div>
                <p className="campo-label">Margen</p>
                <p className="font-medium">{item.margen != null ? `${item.margen}%` : '—'}</p>
              </div>
              <div>
                <p className="campo-label">Categoría</p>
                <p className="truncate">{item.categoria || '—'}</p>
              </div>
              <div>
                <p className="campo-label">Marca</p>
                <p className="truncate">{item.marca || '—'}</p>
              </div>
              <div>
                <p className="campo-label">Referencia</p>
                <p className="font-mono text-xs">{item.codigo_barras || '—'}</p>
              </div>
            </div>
          </div>

          {item.descripcion && (
            <div className="pt-2 border-t border-gray-100">
              <p className="campo-label">Descripción</p>
              <p className="text-sm text-gray-600">{item.descripcion}</p>
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