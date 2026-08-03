import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowLeft, Package } from 'lucide-react'
import NavbarPublico from '@shared/components/NavbarPublico'
import Footer from '../components/Footer'
import { useProductoDetalle } from '../hooks/useProductoDetalle'
import { formatPrecio } from '@shared/utils/validaciones'

export default function ProductoDetalle() {
  const { producto, isLoading } = useProductoDetalle()
  const navigate = useNavigate()
  const [imgIdx, setImgIdx] = useState(0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
        <NavbarPublico />
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
            <div className="h-96 bg-gray-200 dark:bg-dark-border rounded-2xl" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 dark:bg-dark-border rounded w-1/3" />
              <div className="h-8 bg-gray-200 dark:bg-dark-border rounded w-2/3" />
              <div className="h-8 bg-gray-200 dark:bg-dark-border rounded w-1/4" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col">
        <NavbarPublico />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <Package size={48} className="text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-light-text dark:text-dark-text mb-1">Producto no encontrado</h2>
          <p className="text-sm text-gray-400 mb-6">Puede que ya no esté disponible</p>
          <Link to="/productos" className="btn-primary">Ver Productos</Link>
        </div>
        <Footer />
      </div>
    )
  }

  const imagenes = (() => {
    let imgs = producto.imagenes
    if (typeof imgs === 'string') { try { imgs = JSON.parse(imgs) } catch { imgs = [] } }
    if (Array.isArray(imgs) && imgs.length > 0) {
      const limpias = imgs.filter(Boolean)
      if (limpias.length > 0) return limpias
    }
    return producto.imagen_url ? [producto.imagen_url] : []
  })()

  const prev = () => setImgIdx(i => (i - 1 + imagenes.length) % imagenes.length)
  const next = () => setImgIdx(i => (i + 1) % imagenes.length)

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col">
      <NavbarPublico />

      <div className="max-w-6xl mx-auto w-full px-4 py-6 flex-1">

        {/* breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-5 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
          <span>/</span>
          <Link to="/productos" className="hover:text-primary transition-colors">Productos</Link>
          {producto.categoria && (
            <>
              <span>/</span>
              <Link to={`/productos?categoria=${producto.categoria_id}`} className="hover:text-primary transition-colors">
                {producto.categoria}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-light-text dark:text-dark-text font-medium">{producto.nombre}</span>
        </div>

        <button onClick={() => navigate(-1)}
          className="md:hidden flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary mb-4 transition-colors">
          <ArrowLeft size={13} /> Volver
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* galería de imágenes */}
          <div className="flex gap-3">
            {imagenes.length > 1 && (
              <div className="hidden sm:flex flex-col gap-2 shrink-0">
                {imagenes.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === imgIdx ? 'border-primary' : 'border-gray-200 dark:border-dark-border hover:border-primary/40'
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display='none'} />
                  </button>
                ))}
              </div>
            )}

            <div className="relative flex-1 aspect-square rounded-2xl overflow-hidden bg-light-card dark:bg-dark-card border border-gray-100 dark:border-dark-border">
              {imagenes.length > 0 ? (
                <>
                  <img src={imagenes[imgIdx]} alt={producto.nombre} className="w-full h-full object-cover"
                    onError={e => e.target.style.display='none'} />
                  {imagenes.length > 1 && (<>
                    <button onClick={prev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-dark-card/90
                        shadow-md flex items-center justify-center text-gray-600 dark:text-dark-text hover:text-primary transition-colors">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={next}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 dark:bg-dark-card/90
                        shadow-md flex items-center justify-center text-gray-600 dark:text-dark-text hover:text-primary transition-colors">
                      <ChevronRight size={18} />
                    </button>
                    <div className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {imagenes.map((_, i) => (
                        <span key={i} className={`rounded-full transition-all ${i === imgIdx ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-white/70'}`} />
                      ))}
                    </div>
                  </>)}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-dark-border">
                  <Package size={64} />
                </div>
              )}
              {producto.stock === 0 && (
                <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold bg-black/60 px-4 py-2 rounded-full">Agotado</span>
                </div>
              )}
            </div>
          </div>

          {/* información del producto */}
          <div className="space-y-4">
            <div>
              {(producto.categoria || producto.marca) && (
                <p className="text-xs text-gray-400">
                  {producto.categoria}{producto.categoria && producto.marca ? ' · ' : ''}{producto.marca}
                </p>
              )}
              <h1 className="text-2xl font-bold text-light-text dark:text-dark-text mt-1">{producto.nombre}</h1>
              {producto.codigo_barras && (
                <p className="text-xs text-gray-400 font-mono mt-1">Código: {producto.codigo_barras}</p>
              )}
            </div>

            <div className="pt-2">
              <p className="text-3xl font-extrabold text-primary">{formatPrecio(producto.precio)}</p>
            </div>

            <div>
              {producto.stock === 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-500 bg-red-50 dark:bg-red-400/10 px-3 py-1.5 rounded-lg">
                  Sin stock disponible
                </span>
              ) : producto.stock <= 5 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-500 bg-orange-50 dark:bg-orange-400/10 px-3 py-1.5 rounded-lg">
                  Quedan solo {producto.stock} unidades
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
                  Disponible en tienda
                </span>
              )}
            </div>

            {producto.descripcion && (
              <div className="pt-3 border-t border-gray-100 dark:border-dark-border">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Descripción</p>
                <p className="text-sm text-light-text dark:text-dark-text leading-relaxed">{producto.descripcion}</p>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 dark:border-dark-border">
              <p className="text-xs text-gray-400 leading-relaxed">
                Este producto se puede reservar o comprar directamente en tienda. La compra en línea está disponible únicamente desde la aplicación móvil.
              </p>
            </div>

            <Link to="/productos" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline pt-1">
              <ArrowLeft size={14} /> Volver a productos
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}