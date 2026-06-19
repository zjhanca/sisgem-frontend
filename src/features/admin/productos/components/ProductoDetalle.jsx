import { useState, useEffect } from 'react'
import Modal from '@shared/components/Modal'
import { Edit2, ChevronLeft, ChevronRight, Layers } from 'lucide-react'
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

  const loteActivo = item?.stock_lote_activo != null ? {
    stock: item.stock_lote_activo,
    costo: item.costo_lote_activo,
    precio_venta: item.precio,
  } : null
  const loteEnCola = item?.siguiente_lote || null

  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} bloquearCierre
      titulo="Detalle del Producto" ancho="max-w-lg">
      {item && (
        <div className="space-y-3">

          {/* imagen + datos básicos en dos columnas */}
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

            <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-3 gap-y-2 text-sm content-start">
              <div className="col-span-2">
                <p className="campo-label">Nombre</p>
                <p className="font-medium truncate">{item.nombre}</p>
              </div>
              <div>
                <p className="campo-label">Precio venta</p>
                <p className="text-primary font-bold">{formatPrecio(item.precio)}</p>
              </div>
              <div>
                <p className="campo-label">Stock total</p>
                <p className={item.stock <= 5 ? 'text-red-400 font-semibold' : ''}>{item.stock} uds</p>
              </div>
              <div>
                <p className="campo-label">Categoría</p>
                <p className="truncate">{item.categoria || '—'}</p>
              </div>
              <div>
                <p className="campo-label">Marca</p>
                <p className="truncate">{item.marca || '—'}</p>
              </div>
              {item.codigo_barras && (
                <div className="col-span-2">
                  <p className="campo-label">Código Barras</p>
                  <p className="font-mono text-xs">{item.codigo_barras}</p>
                </div>
              )}
            </div>
          </div>

          {/* lotes de costo */}
          {(loteActivo || loteEnCola) && (
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <p className="text-xs font-semibold text-light-text flex items-center gap-1.5">
                <Layers size={12} className="text-primary" /> Lotes de costo
              </p>

              <div className="grid grid-cols-2 gap-2">
                {loteActivo && (
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-primary">Lote activo</span>
                      <span className="badge-activo">Vigente</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="campo-label">Stock</span>
                        <span className="font-medium">{loteActivo.stock} uds</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="campo-label">Costo</span>
                        <span className="font-medium">{loteActivo.costo ? formatPrecio(loteActivo.costo) : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="campo-label">Precio venta</span>
                        <span className="font-bold text-primary">{formatPrecio(loteActivo.precio_venta)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {loteEnCola && (
                  <div className="rounded-lg border border-amber-400/20 bg-amber-50 p-2.5 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-600">En cola</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 text-xs font-medium">Espera</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="campo-label">Stock</span>
                        <span className="font-medium">{loteEnCola.cantidad_disponible} uds</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="campo-label">Costo</span>
                        <span className="font-medium">{formatPrecio(loteEnCola.costo_unitario)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="campo-label">Precio proyectado</span>
                        <span className="font-bold text-amber-600">{formatPrecio(loteEnCola.precio_venta_proyectado)}</span>
                      </div>
                    </div>
                    <p className="text-amber-500 text-xs">Activa al agotar {loteActivo?.stock ?? '?'} uds del lote actual.</p>
                  </div>
                )}
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