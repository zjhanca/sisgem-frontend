import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { ShoppingCart, Sun, Moon, Store, Search, X, Tag } from 'lucide-react'
import { useTema } from '../context/ThemeContext'
import { formatPrecio } from '../utils/validaciones'

function useCarrito() {
  const [carrito, setCarrito] = useState(() =>
    JSON.parse(localStorage.getItem('sisgem_carrito') || '[]')
  )
  const guardar = items => {
    setCarrito(items)
    localStorage.setItem('sisgem_carrito', JSON.stringify(items))
  }
  const agregar = producto => {
    const nuevo = [...carrito]
    const idx = nuevo.findIndex(p => p.id === producto.id)
    if (idx > -1) nuevo[idx].cantidad++
    else nuevo.push({ ...producto, cantidad: 1 })
    guardar(nuevo)
  }
  const total = carrito.reduce((s, p) => s + p.cantidad, 0)
  return { carrito, agregar, total }
}

export default function Catalogo() {
  const { tema, toggleTema }  = useTema()
  const { agregar, total }    = useCarrito()
  const [busqueda, setBusqueda]             = useState('')
  const [categoriaActiva, setCategoriaActiva] = useState('')
  const [productoDetalle, setProductoDetalle] = useState(null)

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['catalogo'],
    queryFn: () => api.get('/catalogo').then(r => r.data.datos)
  })

  // extraer categorias directamente del catalogo sin llamar a /categorias
  const categorias = [...new Map(
    items
      .filter(i => i.categoria_id && i.categoria)
      .map(i => [i.categoria_id, { id: i.categoria_id, nombre: i.categoria, estado: true }])
  ).values()]

  const destacados = [...items]
    .sort((a, b) => parseFloat(b.precio) - parseFloat(a.precio))
    .slice(0, 4)

  const filtrados = items.filter(item => {
    const coincideBusqueda = !busqueda ||
      item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (item.descripcion || '').toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = !categoriaActiva ||
      item.categoria_id === +categoriaActiva
    return coincideBusqueda && coincideCategoria
  })

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">

      {/* navbar */}
      <nav className="sticky top-0 z-10 bg-light-card dark:bg-dark-card
        border-b border-gray-200 dark:border-dark-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 mr-auto">
            <Store size={18} className="text-primary" />
            <span className="font-bold text-primary">sisgem</span>
          </div>
          <div className="relative hidden sm:block">
            <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="buscar productos..."
              className="pl-8 pr-3 py-2 text-sm bg-light-bg dark:bg-dark-bg
                border border-gray-200 dark:border-dark-border rounded-lg w-48
                text-light-text dark:text-dark-text
                focus:outline-none focus:border-primary transition-colors" />
          </div>
          <button onClick={toggleTema} className="btn-ghost">
            {tema === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link to="/carrito" className="relative btn-ghost">
            <ShoppingCart size={18} />
            {total > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-dark-bg
                text-xs rounded-full flex items-center justify-center font-bold">
                {total}
              </span>
            )}
          </Link>
          <Link to="/login"
            className="text-xs text-gray-400 dark:text-dark-text/50 hover:text-primary transition-colors">
            ingresar
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">

        {/* banner promocional */}
        {items.length > 0 && (
          <div className="relative rounded-2xl overflow-hidden bg-dark-card
            border border-dark-border p-6 flex items-center justify-between">
            <div className="z-10">
              <p className="text-xs text-primary/70 mb-1">bienvenido a sisgem</p>
              <h2 className="text-xl font-bold text-dark-text mb-2">
                productos frescos y de calidad
              </h2>
              <p className="text-sm text-dark-text/60 mb-4">
                encuentra todo lo que necesitas en un solo lugar
              </p>
              <button
                onClick={() => document.getElementById('productos-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary text-sm">
                ver productos
              </button>
            </div>
            <div className="hidden sm:flex items-center justify-center w-32 h-32
              rounded-full bg-primary/10 shrink-0">
              <Store size={48} className="text-primary/40" />
            </div>
          </div>
        )}

        {/* productos destacados */}
        {destacados.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-light-text dark:text-dark-text mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full inline-block" />
              productos destacados
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {destacados.map(item => (
                <div key={item.id}
                  className="bg-light-card dark:bg-dark-card rounded-xl border
                    border-gray-200 dark:border-dark-border overflow-hidden
                    hover:border-primary/40 transition-colors cursor-pointer"
                  onClick={() => setProductoDetalle(item)}>
                  {item.imagen ? (
                    <img src={item.imagen} alt={item.nombre}
                      className="w-full h-28 object-cover" />
                  ) : (
                    <div className="w-full h-28 bg-primary/10 flex items-center justify-center">
                      <Store size={20} className="text-primary/30" />
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs font-medium text-light-text dark:text-dark-text
                      line-clamp-1">{item.nombre}</p>
                    <p className="text-primary font-semibold text-xs mt-0.5">
                      {formatPrecio(item.precio)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* categorias */}
        {categorias.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-light-text dark:text-dark-text mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary rounded-full inline-block" />
              categorias que manejamos
            </h2>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setCategoriaActiva('')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
                  border transition-colors ${!categoriaActiva
                    ? 'bg-primary text-dark-bg border-primary'
                    : 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-text/60 hover:border-primary/40'
                  }`}>
                <Tag size={11} /> todas
              </button>
              {categorias.map(cat => (
                <button key={cat.id}
                  onClick={() => setCategoriaActiva(
                    categoriaActiva === cat.id ? '' : cat.id
                  )}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs
                    border transition-colors ${categoriaActiva === cat.id
                      ? 'bg-primary text-dark-bg border-primary'
                      : 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-text/60 hover:border-primary/40'
                    }`}>
                  <Tag size={11} /> {cat.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* todos los productos */}
        <div id="productos-section">
          <h2 className="text-sm font-medium text-light-text dark:text-dark-text mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-primary rounded-full inline-block" />
            {categoriaActiva
              ? categorias.find(c => c.id === +categoriaActiva)?.nombre || 'productos'
              : 'todos los productos'}
            <span className="text-xs text-gray-400 dark:text-dark-text/40 font-normal">
              ({filtrados.length})
            </span>
          </h2>

          <div className="relative mb-4 sm:hidden">
            <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="buscar productos..."
              className="w-full pl-8 pr-3 py-2 text-sm campo-input" />
          </div>

          {isLoading && (
            <div className="text-center py-20 text-gray-400 dark:text-dark-text/40 text-sm">
              cargando productos...
            </div>
          )}

          {!isLoading && filtrados.length === 0 && (
            <div className="text-center py-20 text-gray-400 dark:text-dark-text/40 text-sm">
              {busqueda ? `sin resultados para "${busqueda}"` : 'sin productos disponibles'}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtrados.map(item => (
              <div key={item.id}
                className="bg-light-card dark:bg-dark-card rounded-xl border
                  border-gray-200 dark:border-dark-border overflow-hidden
                  hover:border-primary/40 transition-colors">
                <div className="cursor-pointer" onClick={() => setProductoDetalle(item)}>
                  {item.imagen ? (
                    <img src={item.imagen} alt={item.nombre}
                      className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-primary/10 flex items-center justify-center">
                      <Store size={24} className="text-primary/20" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-light-text dark:text-dark-text
                    line-clamp-1 mb-0.5 cursor-pointer"
                    onClick={() => setProductoDetalle(item)}>
                    {item.nombre}
                  </p>
                  {item.descripcion && (
                    <p className="text-xs text-gray-400 dark:text-dark-text/50
                      line-clamp-2 mb-2">{item.descripcion}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-semibold text-sm">
                      {formatPrecio(item.precio)}
                    </span>
                    <button onClick={() => agregar(item)}
                      className="text-xs px-2 py-1 bg-primary text-dark-bg rounded-lg
                        hover:bg-primary-mid transition-colors font-medium">
                      agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* modal detalle */}
      {productoDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setProductoDetalle(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 w-full max-w-sm bg-light-card dark:bg-dark-card
            rounded-2xl border border-gray-200 dark:border-dark-border shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}>
            {productoDetalle.imagen ? (
              <img src={productoDetalle.imagen} alt={productoDetalle.nombre}
                className="w-full h-48 object-cover" />
            ) : (
              <div className="w-full h-48 bg-primary/10 flex items-center justify-center">
                <Store size={40} className="text-primary/20" />
              </div>
            )}
            <button onClick={() => setProductoDetalle(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-black/40 rounded-full
                flex items-center justify-center text-white hover:bg-black/60 transition-colors">
              <X size={14} />
            </button>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-light-text dark:text-dark-text">
                  {productoDetalle.nombre}
                </h3>
                {productoDetalle.descripcion && (
                  <p className="text-xs text-gray-400 dark:text-dark-text/50 mt-1">
                    {productoDetalle.descripcion}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between pt-2
                border-t border-gray-200 dark:border-dark-border">
                <div>
                  <p className="text-primary font-bold text-lg">
                    {formatPrecio(productoDetalle.precio)}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-dark-text/40">
                    stock disponible: {productoDetalle.stock}
                  </p>
                </div>
                <button onClick={() => {
                  agregar(productoDetalle)
                  setProductoDetalle(null)
                }} className="btn-primary">
                  agregar al carrito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}