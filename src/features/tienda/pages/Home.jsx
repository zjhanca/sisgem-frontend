import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '@shared/services/api'
import NavbarPublico from '@shared/components/NavbarPublico'
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'
 
const BANNERS = [
  { id: 1, titulo: 'Frescos todos los días', subtitulo: 'Frutas y verduras del campo a tu mesa', desde: '#1D6B2B', hasta: '#2D8F50', emoji: '🥑' },
  { id: 2, titulo: 'Ofertas de temporada',   subtitulo: 'Descuentos en productos seleccionados',  desde: '#1D3326', hasta: '#2D8F50', emoji: '🛒' },
  { id: 3, titulo: 'Domicilios en Medellín', subtitulo: 'Pedidos a domicilio rápidos y seguros',   desde: '#1A4A7A', hasta: '#2E6EBF', emoji: '🛵' },
]
 
function useCarrusel(largo, intervalo = 4000) {
  const [idx, setIdx] = useState(0)
  const timer = useRef(null)
  useEffect(() => {
    if (largo <= 1) return
    timer.current = setInterval(() => setIdx(i => (i + 1) % largo), intervalo)
    return () => clearInterval(timer.current)
  }, [largo, intervalo])
  const next = () => setIdx(i => (i + 1) % largo)
  const prev = () => setIdx(i => (i - 1 + largo) % largo)
  return { idx, next, prev, ir: setIdx }
}
 
export default function Home({ carrito, setCarrito }) {
  const [busqueda, setBusqueda] = useState('')
  const banner  = useCarrusel(BANNERS.length, 4500)
  const marcasCar = useCarrusel(10, 5000)
 
  const { data: productos = [] } = useQuery({
    queryKey: ['catalogo'],
    queryFn: () => api.get('/catalogo').then(r => r.data.datos)
  })
  const { data: categorias = [] } = useQuery({
    queryKey: ['catalogo-cats'],
    queryFn: () => api.get('/catalogo/categorias').then(r => r.data.datos)
  })
  const { data: marcas = [] } = useQuery({
    queryKey: ['catalogo-marcas'],
    queryFn: () => api.get('/catalogo/marcas').then(r => r.data.datos)
  })
 
  const agregarAlCarrito = prod => {
    setCarrito(prev => {
      const existe = prev.find(p => p.id === prod.id)
      if (existe) return prev.map(p => p.id === prod.id ? { ...p, cantidad: p.cantidad + 1 } : p)
      return [...prev, { ...prod, cantidad: 1 }]
    })
  }
 
  const prodDestacados = productos
    .filter(p => !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .slice(0, busqueda ? 20 : 10)
 
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
 
      {/* navbar */}
      <NavbarPublico carrito={carrito} busqueda={busqueda} setBusqueda={setBusqueda} />
 
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-10">
 
        {/* ── CARRUSEL PRINCIPAL ── */}
        <section className="relative rounded-2xl overflow-hidden h-56 sm:h-64 md:h-72 select-none">
          {BANNERS.map((b, i) => (
            <div key={b.id}
              style={{ background: `linear-gradient(135deg, ${b.desde}, ${b.hasta})` }}
              className={`absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6
                transition-opacity duration-700 ${i === banner.idx ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <div className="text-5xl mb-3">{b.emoji}</div>
              <h2 className="text-2xl md:text-3xl font-bold">{b.titulo}</h2>
              <p className="text-sm md:text-base opacity-90 mt-1">{b.subtitulo}</p>
              <Link to="/productos"
                className="mt-4 px-5 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors">
                ver productos →
              </Link>
            </div>
          ))}
          <button onClick={banner.prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/25 hover:bg-black/40
              flex items-center justify-center text-white transition-colors">
            <ChevronLeft size={16} />
          </button>
          <button onClick={banner.next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/25 hover:bg-black/40
              flex items-center justify-center text-white transition-colors">
            <ChevronRight size={16} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {BANNERS.map((_, i) => (
              <button key={i} onClick={() => banner.ir(i)}
                className={`rounded-full transition-all ${i === banner.idx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40'}`} />
            ))}
          </div>
        </section>
 
        {/* ── CARRUSEL CATEGORÍAS ── */}
        {categorias.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-light-text dark:text-dark-text">categorías</h2>
              <Link to="/productos" className="text-xs text-primary hover:underline">ver todas →</Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
              {categorias.map(cat => (
                <Link key={cat.id} to={`/productos?categoria=${cat.id}`}
                  className="shrink-0 snap-start flex flex-col items-center gap-2 p-4 w-28
                    bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border
                    hover:border-primary/50 hover:bg-primary/5 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl">🏪</div>
                  <span className="text-xs text-center font-medium text-light-text dark:text-dark-text line-clamp-2">
                    {cat.nombre}
                  </span>
                  <span className="text-xs text-gray-400">{cat.total_productos}</span>
                </Link>
              ))}
            </div>
          </section>
        )}
 
        {/* ── PRODUCTOS DESTACADOS / BÚSQUEDA ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-light-text dark:text-dark-text">
              {busqueda ? `resultados para "${busqueda}"` : 'productos destacados'}
            </h2>
            {!busqueda && <Link to="/productos" className="text-xs text-primary hover:underline">ver todos →</Link>}
            {busqueda && (
              <button onClick={() => setBusqueda('')} className="text-xs text-red-400 hover:underline">limpiar</button>
            )}
          </div>
 
          {productos.length === 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border animate-pulse">
                  <div className="h-36 bg-gray-200 dark:bg-dark-border rounded-t-xl" />
                  <div className="p-3 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-3/4" />
                    <div className="h-3 bg-gray-200 dark:bg-dark-border rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}
 
          {prodDestacados.length === 0 && busqueda && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">no se encontraron productos para "{busqueda}"</p>
              <Link to="/productos" className="text-primary text-sm mt-2 hover:underline block">
                buscar en el catálogo completo →
              </Link>
            </div>
          )}
 
          {prodDestacados.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {prodDestacados.map(prod => (
                <div key={prod.id}
                  className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border
                    hover:border-primary/40 hover:shadow-sm transition-all group flex flex-col">
                  <div className="relative h-36 rounded-t-xl overflow-hidden bg-gray-50 dark:bg-dark-bg">
                    {prod.imagen_url ? (
                      <img src={prod.imagen_url} alt={prod.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={e => { e.target.style.display = 'none'; e.target.nextSibling?.style && (e.target.nextSibling.style.display = 'flex') }} />
                    ) : null}
                    <div className={`${prod.imagen_url ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-4xl`}>🛒</div>
                    {prod.stock <= 5 && prod.stock > 0 && (
                      <span className="absolute top-2 right-2 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                        quedan {prod.stock}
                      </span>
                    )}
                  </div>
                  <div className="p-2.5 flex flex-col flex-1">
                    <p className="text-xs font-medium text-light-text dark:text-dark-text line-clamp-2 flex-1">{prod.nombre}</p>
                    {prod.marca && <p className="text-xs text-gray-400 mt-0.5">{prod.marca}</p>}
                    <p className="text-sm font-bold text-primary mt-1.5">{formatPrecio(prod.precio)}</p>
                    <button onClick={() => agregarAlCarrito(prod)}
                      className="mt-2 w-full py-1.5 text-xs font-medium rounded-lg border border-primary/40
                        text-primary hover:bg-primary hover:text-dark-bg transition-colors flex items-center justify-center gap-1">
                      <ShoppingCart size={11} /> agregar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
 
        {/* ── BANNERS PROMOCIONALES ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl p-6 text-white flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, #1D6B2B, #2D8F50)' }}>
            <div className="text-4xl shrink-0">🏪</div>
            <div>
              <h3 className="font-bold text-base">Compra en mostrador</h3>
              <p className="text-sm opacity-90 mt-0.5">Visítanos y lleva lo que necesitas</p>
            </div>
          </div>
          <div className="rounded-2xl p-6 text-white flex items-center gap-4"
            style={{ background: 'linear-gradient(135deg, #1A4A7A, #2E6EBF)' }}>
            <div className="text-4xl shrink-0">🛵</div>
            <div>
              <h3 className="font-bold text-base">Domicilios en Medellín</h3>
              <p className="text-sm opacity-90 mt-0.5">Pedidos a domicilio rápidos</p>
            </div>
          </div>
        </section>
 
        {/* ── CARRUSEL MARCAS ── */}
        {marcas.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-light-text dark:text-dark-text">marcas</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {marcas.map(m => (
                <Link key={m.id} to={`/productos?marca=${m.id}`}
                  className="shrink-0 flex flex-col items-center gap-2 p-3 w-24
                    bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border
                    hover:border-primary/40 transition-all">
                  {m.logo ? (
                    <img src={m.logo} alt={m.nombre} className="w-10 h-10 object-contain"
                      onError={e => e.target.style.display = 'none'} />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                      {m.nombre?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-medium text-center line-clamp-1 text-light-text dark:text-dark-text">
                    {m.nombre}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}
 
      </main>
 
      {/* ── FOOTER ── */}
      <footer className="mt-12 border-t border-gray-100 dark:border-dark-border bg-light-card dark:bg-dark-card">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <h4 className="font-bold text-primary text-lg mb-2">SISGEM</h4>
            <p className="text-gray-500 dark:text-dark-text/60 text-xs">Tu minimercado de confianza en Medellín.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-light-text dark:text-dark-text text-sm">Explorar</h4>
            <ul className="space-y-1.5 text-xs text-gray-500 dark:text-dark-text/60">
              <li><Link to="/productos" className="hover:text-primary transition-colors">Productos</Link></li>
              <li><Link to="/productos" className="hover:text-primary transition-colors">Categorías</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-light-text dark:text-dark-text text-sm">Mi cuenta</h4>
            <ul className="space-y-1.5 text-xs text-gray-500 dark:text-dark-text/60">
              <li><Link to="/login"    className="hover:text-primary transition-colors">Iniciar sesión</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">Crear cuenta</Link></li>
              <li><Link to="/perfil"   className="hover:text-primary transition-colors">Mi perfil</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-light-text dark:text-dark-text text-sm">Conócenos</h4>
            <ul className="space-y-1.5 text-xs text-gray-500 dark:text-dark-text/60">
              <li><span className="text-gray-400">Medellín, Colombia</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-100 dark:border-dark-border text-center py-3 text-xs text-gray-400">
          © {new Date().getFullYear()} SISGEM — Todos los derechos reservados
        </div>
      </footer>
 
    </div>
  )
}
 
