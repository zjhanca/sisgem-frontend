import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  ChevronLeft, ChevronRight, ArrowLeft, Package,
  Tag, Check, Store, Smartphone,
  ChevronRight as Chevron, ShieldCheck, Banknote, MapPin,
} from 'lucide-react'
import NavbarPublico from '@shared/components/NavbarPublico'
import Footer from '../components/Footer'
import BotonFlotante from '../components/BotonFlotante'
import { useProductoDetalle } from '../hooks/useProductoDetalle'
import { formatPrecio } from '@shared/utils/validaciones'

function Skeleton() {
  return (
    <div className="min-h-screen bg-white">
      <NavbarPublico />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-pulse">
          <div className="aspect-square bg-gray-100 rounded-3xl" />
          <div className="space-y-4 pt-4">
            <div className="h-3 bg-gray-100 rounded-full w-1/4" />
            <div className="h-8 bg-gray-100 rounded-full w-3/4" />
            <div className="h-10 bg-gray-100 rounded-full w-1/3" />
            <div className="h-24 bg-gray-100 rounded-2xl" />
            <div className="h-12 bg-gray-100 rounded-full w-1/2" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function ProductoDetalle() {
  const { producto, isLoading } = useProductoDetalle()
  const navigate = useNavigate()
  const [imgIdx, setImgIdx] = useState(0)

  if (isLoading) return <Skeleton />

  if (!producto) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <NavbarPublico />
        <div className="flex-1 flex flex-col items-center justify-center px-4 text-center py-20">
          <div className="w-24 h-24 rounded-3xl bg-gray-50 flex items-center
            justify-center mb-6 border border-gray-100">
            <Package size={40} className="text-gray-300" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">
            Producto no encontrado
          </h2>
          <p className="text-sm text-gray-400 mb-8 max-w-xs leading-relaxed">
            Este producto puede que ya no esté disponible o fue removido del catálogo
          </p>
          <Link to="/productos"
            className="inline-flex items-center gap-2 bg-primary text-white
              font-bold px-8 py-3.5 rounded-full hover:bg-green-700
              transition-all shadow-lg text-sm">
            Ver Catálogo Completo
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
  const disponible = producto.stock > 0

  const INFO_CARDS = [
    { icon: MapPin,      label: 'Tienda física', sub: 'Medellín',                  color: 'bg-primary/10 text-primary'  },
    { icon: ShieldCheck, label: 'Calidad',        sub: 'Garantizada',               color: 'bg-green-50 text-green-600'  },
    { icon: Banknote,    label: 'Pago',           sub: 'Efectivo o transferencia',   color: 'bg-gray-100 text-gray-600'   },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavbarPublico />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 flex-wrap">
            <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
            <Chevron size={12} />
            <Link to="/productos" className="hover:text-primary transition-colors">Productos</Link>
            {producto.categoria && (<>
              <Chevron size={12} />
              <Link to={`/productos?categoria=${producto.categoria_id}`}
                className="hover:text-primary transition-colors">
                {producto.categoria}
              </Link>
            </>)}
            <Chevron size={12} />
            <span className="text-gray-600 font-medium truncate max-w-[180px]">
              {producto.nombre}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 py-8 flex-1">

        <button onClick={() => navigate(-1)}
          className="md:hidden flex items-center gap-1.5 text-xs text-gray-400
            hover:text-primary mb-5 transition-colors font-medium">
          <ArrowLeft size={13} /> Volver
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">

          {/* ── GALERÍA ── */}
          <div className="space-y-3">

            {/* Imagen principal */}
            <div className="relative aspect-square rounded-3xl overflow-hidden
              bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200
              shadow-xl group">

              {imagenes.length > 0 ? (
                <>
                  {/* Fondo decorativo difuminado de la imagen */}
                  <div className="absolute inset-0 scale-110 blur-2xl opacity-20">
                    <img src={imagenes[imgIdx]} alt=""
                      className="w-full h-full object-cover" />
                  </div>

                  {/* Imagen real centrada */}
                  <div className="relative z-10 w-full h-full flex items-center
                    justify-center p-10">
                    <img src={imagenes[imgIdx]} alt={producto.nombre}
                      className="max-w-full max-h-full object-contain
                        drop-shadow-2xl transition-all duration-500
                        group-hover:scale-105"
                      onError={e => e.target.style.display = 'none'} />
                  </div>

                  {/* Navegación flechas */}
                  {imagenes.length > 1 && (<>
                    <button onClick={prev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-20
                        w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm
                        shadow-lg flex items-center justify-center text-gray-500
                        hover:text-primary hover:bg-white hover:shadow-xl
                        transition-all border border-gray-100
                        opacity-0 group-hover:opacity-100">
                      <ChevronLeft size={20} />
                    </button>
                    <button onClick={next}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-20
                        w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm
                        shadow-lg flex items-center justify-center text-gray-500
                        hover:text-primary hover:bg-white hover:shadow-xl
                        transition-all border border-gray-100
                        opacity-0 group-hover:opacity-100">
                      <ChevronRight size={20} />
                    </button>
                  </>)}

                  {/* Badge agotado */}
                  {!disponible && (
                    <div className="absolute inset-0 z-30 bg-black/50
                      flex items-center justify-center backdrop-blur-[2px]">
                      <span className="text-white font-black bg-black/70
                        px-8 py-3 rounded-full text-sm tracking-widest uppercase
                        border border-white/20">
                        Agotado
                      </span>
                    </div>
                  )}

                  {/* Contador */}
                  {imagenes.length > 1 && (
                    <div className="absolute bottom-4 right-4 z-20
                      bg-black/50 backdrop-blur-sm text-white text-xs
                      font-semibold px-3 py-1.5 rounded-full">
                      {imgIdx + 1} / {imagenes.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package size={80} className="text-gray-300" />
                </div>
              )}
            </div>

            {/* Miniaturas horizontales */}
            {imagenes.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {imagenes.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`shrink-0 w-16 h-16 rounded-2xl overflow-hidden
                      border-2 bg-gray-50 p-1 transition-all duration-200 ${
                      i === imgIdx
                        ? 'border-primary shadow-md shadow-primary/20 scale-105'
                        : 'border-gray-200 hover:border-primary/40 opacity-60 hover:opacity-100'
                    }`}>
                    <img src={img} alt=""
                      className="w-full h-full object-contain"
                      onError={e => e.target.style.display = 'none'} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── INFO PRODUCTO ── */}
          <div className="flex flex-col gap-6">

            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              {producto.categoria && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold
                  text-primary bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                  <Tag size={10} /> {producto.categoria}
                </span>
              )}
              {producto.marca && (
                <span className="text-xs font-semibold text-gray-500 bg-gray-100
                  px-3 py-1.5 rounded-full">
                  {producto.marca}
                </span>
              )}
              {disponible && (
                <span className="inline-flex items-center gap-1 text-xs font-bold
                  text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                  <Check size={11} /> Disponible
                </span>
              )}
            </div>

            {/* Nombre */}
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">
                {producto.nombre}
              </h1>
              {producto.codigo_barras && (
                <p className="text-xs text-gray-400 font-mono mt-2 tracking-wider">
                  Ref: {producto.codigo_barras}
                </p>
              )}
            </div>

            {/* Precio */}
            <div className="flex items-baseline gap-3 py-4 border-y border-gray-100">
              <span className="text-4xl md:text-5xl font-black text-primary leading-none">
                {formatPrecio(producto.precio)}
              </span>
              <span className="text-xs text-gray-400 font-medium">IVA incluido</span>
            </div>

            {/* Estado stock */}
            {!disponible ? (
              <div className="flex items-center gap-3 p-4 rounded-2xl
                bg-red-50 border border-red-100">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-500">Producto agotado</p>
                  <p className="text-xs text-red-400 mt-0.5">Pronto habrá más unidades</p>
                </div>
              </div>
            ) : producto.stock <= 5 ? (
              <div className="flex items-center gap-3 p-4 rounded-2xl
                bg-orange-50 border border-orange-100">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-400 shrink-0 animate-pulse" />
                <div>
                  <p className="text-sm font-bold text-orange-500">Pocas unidades disponibles</p>
                  <p className="text-xs text-orange-400 mt-0.5">
                    Solo quedan {producto.stock} en tienda
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-4 rounded-2xl
                bg-green-50 border border-green-100">
                <div className="w-2.5 h-2.5 rounded-full bg-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-green-600">En stock</p>
                  <p className="text-xs text-green-500 mt-0.5">
                    {producto.stock} unidades disponibles en tienda
                  </p>
                </div>
              </div>
            )}

            {/* Descripción */}
            {producto.descripcion && (
              <div>
                <p className="text-xs font-black text-gray-400 uppercase
                  tracking-widest mb-3">
                  Descripción
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {producto.descripcion}
                </p>
              </div>
            )}

            {/* Cómo obtenerlo */}
            <div>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                Cómo obtenerlo
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-3 p-4 rounded-2xl
                  bg-primary/5 border border-primary/15 hover:border-primary/30
                  transition-all group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center
                    justify-center shrink-0 shadow-md
                    group-hover:scale-105 transition-transform">
                    <Store size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Compra en tienda</p>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Visítanos y llévalo el mismo día
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-2xl
                  bg-green-50 border border-green-100 hover:border-green-200
                  transition-all group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center
                    justify-center shrink-0 shadow-md
                    group-hover:scale-105 transition-transform">
                    <Smartphone size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">App móvil</p>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                      Reserva y recoge sin filas
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón volver */}
            <Link to="/productos"
              className="flex items-center justify-center gap-2 border-2 border-primary
                text-primary font-bold py-3.5 rounded-2xl
                hover:bg-primary hover:text-white transition-all text-sm">
              <ArrowLeft size={15} /> Ver más productos
            </Link>

            {/* Info cards */}
            <div className="grid grid-cols-3 gap-3 border-t border-gray-100 pt-4">
              {INFO_CARDS.map((item, i) => (
                <div key={i}
                  className="flex flex-col items-center text-center p-3
                    rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center
                    justify-center ${item.color}`}>
                    <item.icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <BotonFlotante />
    </div>
  )
}