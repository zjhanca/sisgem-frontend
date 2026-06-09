import { useState, useEffect } from 'react'
import Modal from '@shared/components/Modal'
import { Edit2, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'

export default function ProductoDetalle({ modalDetalle, setModalDetalle, abrirModal }) {
  const item = modalDetalle.item
  const cerrar = () => setModalDetalle({ abierto: false, item: null })
  const [imgIdx, setImgIdx] = useState(0)

  // resetear índice cada vez que cambia el producto
  useEffect(() => { setImgIdx(0) }, [item?.id])

  // reconstruir array de imágenes — soporta array, JSON string, o imagen_url suelta
  const imagenes = (() => {
    if (!item) return []
    let imgs = item.imagenes
    // si llega como string JSON, parsear
    if (typeof imgs === 'string') {
      try { imgs = JSON.parse(imgs) } catch { imgs = [] }
    }
    if (Array.isArray(imgs) && imgs.length > 0) {
      // filtrar urls vacías
      const limpias = imgs.filter(Boolean)
      if (limpias.length > 0) return limpias
    }
    // fallback a imagen_url
    return item.imagen_url ? [item.imagen_url] : []
  })()

  const prev = () => setImgIdx(i => (i - 1 + imagenes.length) % imagenes.length)
  const next = () => setImgIdx(i => (i + 1) % imagenes.length)

  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} titulo="Detalle del Producto">
      {item && (
        <div className="space-y-3">

          {/* galería */}
          {imagenes.length > 0 && (
            <div className="relative">
              <img
                src={imagenes[imgIdx]} alt=""
                className="w-full h-48 object-cover rounded-xl"
                onError={e => e.target.style.display = 'none'}
              />
              {imagenes.length > 1 && (<>
                <button type="button" onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button type="button" onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
                  <ChevronRight size={16} />
                </button>
                {/* puntos indicadores */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {imagenes.map((_, i) => (
                    <button key={i} type="button" onClick={() => setImgIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} />
                  ))}
                </div>
                <div className="absolute top-2 right-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full">
                  {imgIdx + 1} / {imagenes.length}
                </div>
              </>)}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="campo-label">Nombre</p><p className="font-medium">{item.nombre}</p></div>
            <div><p className="campo-label">Estado</p><span className={item.estado ? 'badge-activo' : 'badge-inactivo'}>{item.estado ? 'Activo' : 'Inactivo'}</span></div>
            <div><p className="campo-label">Precio</p><p className="text-primary font-bold">{formatPrecio(item.precio)}</p></div>
            <div><p className="campo-label">Stock</p><p className={item.stock <= 5 ? 'text-red-400 font-semibold' : ''}>{item.stock} uds</p></div>
            <div><p className="campo-label">Categoría</p><p>{item.categoria || '—'}</p></div>
            <div><p className="campo-label">Marca</p><p>{item.marca || '—'}</p></div>
            <div><p className="campo-label">Código Barras</p><p className="font-mono text-xs">{item.codigo_barras || '—'}</p></div>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => { cerrar(); abrirModal(item) }} className="btn-outline text-xs">
              <Edit2 size={12} /> Editar
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}