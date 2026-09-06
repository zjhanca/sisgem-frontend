import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowLeft, Package, Tag, BarChart2 } from 'lucide-react'
import NavbarPublico from '@shared/components/NavbarPublico'
import Footer from '../components/Footer'
import BotonFlotante from '../components/BotonFlotante'
import { useProductoDetalle } from '../hooks/useProductoDetalle'
import { formatPrecio } from '@shared/utils/validaciones'

export default function ProductoDetalle() {
  const { producto, isLoading } = useProductoDetalle()
  const navigate = useNavigate()
  const [imgIdx, setImgIdx] = useState(0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <NavbarPublico />
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
            <div className="aspect-square bg-gray-100 rounded-3xl" />
            <div className="space-y-4 pt-4">
              <div className="h-3 bg-gray-100 rounded w-1/3" />
              <div className="h-8 bg-gray-100 rounded w-2/3" />
              <div className="h-10 bg-gray-100 rounded w-1/3" />
              <div className="h-20 bg-gray-100 rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <NavbarPublico />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Package size={36} className="text-gray-300" />
          </div>
          <h2 className="text-xl font-black text-gray-800 mb-2">Producto no encontrado</h2>
          <p className="text-sm text-gray-400 mb-6">Puede que ya no esté disponible</p>
          <Link to="/productos"
            className="inline-flex items-center gap-2 bg-primary text-white
              font-bold px-6 py-3 rounded-full hover:bg-green-700 transition-all">
            Ver Productos
          </Link>
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
    <div className="min-h-screen bg-white flex flex-col">
      <NavbarPublico />

      {/* Breadcrumb con fondo verde suave */}
      <div className="bg-[#f0fdf4] border-b border-primary/10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
            <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/productos" className="hover:text-primary transition-colors">Productos</Link>
            {producto.categoria && (
              <>
                <span>/</span>
                <Link to={`/productos?categoria=${producto.categoria_id}`}
                  className="hover:text-primary transition-colors">
                  {producto.categoria}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-gray-700 font-medium truncate max-w-xs">
              {producto.nombre}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 py-8 flex-1">
        <button onClick={() => navigate(-1)}
          className="md:hidden flex items-center gap-1.5 text-xs text-gray-400
            hover:text-primary mb-5 transition-colors">
          <ArrowLeft size={13} /> Volver
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* ── Galería ── */}
          <div className="flex gap-3">
            {/* Miniaturas */}
            {imagenes.length > 1 && (
              <div className="hidden sm:flex flex-col gap-2 shrink-0">
                {imagenes.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 bg-gray-50
                      p-1 transition-all ${
                      i === imgIdx
                        ? 'border-primary shadow-md'
                        : 'border-gray-200 hover:border-primary/40'
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-contain"
                      onError={e => e.target.style.display = 'none'} />
                  </button>
                ))}
              </div>
            )}

            {/* Imagen principal */}
            <div className="relative flex-1 aspect-square rounded-3xl overflow-hidden
              bg-gray-50 border border-gray-100 p-6 shadow-sm">
              {imagenes.length > 0 ? (
                <>
                  <img src={imagenes[imgIdx]} alt={producto.nombre}
                    className="w-full h-full object-contain"
                    onError={e => e.target.style.display = 'none'} />
                  {imagenes.length > 1 && (<>
                    <button onClick={prev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
                        bg-white shadow-md flex items-center justify-center
                        text-gray-500 hover:text-primary transition-colors border border-gray-100">
                      <ChevronLeft size={18} />
                    </button>
                    <button onClick={next}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full
                        bg-white shadow-md flex items-center justify-center
                        text-gray-500 hover:text-primary transition-colors border border-gray-100">
                      <ChevronRight size={18} />
                    </button>
                    <div className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {imagenes.map((_, i) => (
                        <span key={i}
                          className={`rounded-full transition-all ${
                            i === imgIdx ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-gray-300'
                          }`} />
                      ))}
                    </div>
                  </>)}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={64} className="text-gray-200" />
                </div>
              )}

              {producto.stock === 0 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-3xl">
                  <span className="text-white font-bold bg-black/60 px-5 py-2 rounded-full text-sm">
                    Agotado
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Info ── */}
          <div className="space-y-5 pt-2">

            {/* Categoría / marca */}
            {(producto.categoria || producto.marca) && (
              <div className="flex items-center gap-2 flex-wrap">
                {producto.categoria && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium
                    text-primary bg-primary/10 px-3 py-1 rounded-full">
                    <Tag size={10} /> {producto.categoria}
                  </span>
                )}
                {producto.marca && (
                  <span className="text-xs text-gray-400 font-medium">{producto.marca}</span>
                )}
              </div>
            )}

            {/* Nombre */}
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
              {producto.nombre}
            </h1>

            {/* Código */}
            {producto.codigo_barras && (
              <p className="text-xs text-gray-400 font-mono flex items-center gap-1.5">
                <BarChart2 size={12} /> {producto.codigo_barras}
              </p>
            )}

            {/* Precio */}
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-primary">
                {formatPrecio(producto.precio)}
              </p>
            </div>

            {/* Stock badge */}
            <div>
              {producto.stock === 0 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold
                  text-red-500 bg-red-50 px-4 py-2 rounded-full">
                  Sin stock disponible
                </span>
              ) : producto.stock <= 5 ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold
                  text-orange-500 bg-orange-50 px-4 py-2 rounded-full">
                  ¡Solo quedan {producto.stock} unidades!
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold
                  text-primary bg-primary/10 px-4 py-2 rounded-full">
                  ✓ Disponible en tienda
                </span>
              )}
            </div>

            {/* Descripción */}
            {producto.descripcion && (
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Descripción
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {producto.descripcion}
                </p>
              </div>
            )}

            {/* Aviso compra */}
            <div className="p-4 rounded-2xl bg-[#f0fdf4] border border-primary/20">
              <p className="text-xs text-gray-500 leading-relaxed">
                Este producto se puede reservar o comprar directamente en tienda.
                La compra en línea está disponible únicamente desde la aplicación móvil.
              </p>
            </div>

            {/* Volver */}
            <Link to="/productos"
              className="inline-flex items-center gap-1.5 text-sm font-semibold
                text-primary hover:gap-3 transition-all">
              <ArrowLeft size={14} /> Volver a productos
            </Link>
          </div>
        </div>
      </div>

      <Footer />
      <BotonFlotante />
    </div>
  )
}