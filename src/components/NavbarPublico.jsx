import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ShoppingCart, Search, Menu, X, User, LogOut } from 'lucide-react'
import { formatPrecio } from '../utils/validaciones'

export default function NavbarPublico({ carrito = [], busqueda = '', setBusqueda }) {
  const { usuario, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [menuMovil, setMenuMovil] = useState(false)

  const totalItems = carrito.reduce((s, p) => s + p.cantidad, 0)
  const totalMonto = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0)

  const isActive = path =>
    location.pathname === path
      ? 'text-primary font-medium'
      : 'text-gray-600 dark:text-dark-text/70 hover:text-primary transition-colors'

  const handleLogout = () => { logout(); navigate('/') }

  // si setBusqueda no viene (ej: en Catalogo), buscar al presionar Enter
  const handleBusqueda = e => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      navigate(`/productos?q=${encodeURIComponent(e.target.value.trim())}`)
    }
  }

  return (
    <nav className="sticky top-0 z-50 bg-light-card dark:bg-dark-card border-b border-gray-100 dark:border-dark-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">

        {/* logo */}
        <Link to="/" className="text-xl font-bold text-primary shrink-0">SISGEM</Link>

        {/* buscador */}
        <div className="flex-1 relative max-w-sm hidden sm:block">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          {setBusqueda ? (
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="buscar productos..."
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-xl border border-gray-200 dark:border-dark-border
                bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text
                focus:outline-none focus:border-primary/60 transition-colors" />
          ) : (
            <input
              placeholder="buscar productos..."
              onKeyDown={handleBusqueda}
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-xl border border-gray-200 dark:border-dark-border
                bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text
                focus:outline-none focus:border-primary/60 transition-colors" />
          )}
        </div>

        {/* links desktop */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          <Link to="/"          className={isActive('/')}>Inicio</Link>
          <Link to="/productos" className={isActive('/productos')}>Productos</Link>
          <Link to="/nosotros"  className={isActive('/nosotros')}>Conócenos</Link>
        </div>

        {/* acciones derecha */}
        <div className="flex items-center gap-2 ml-auto shrink-0">

          {/* carrito con badge */}
          <Link to="/carrito"
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              totalItems > 0
                ? 'bg-primary text-dark-bg hover:bg-primary/90'
                : 'border border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-text/60 hover:border-primary/40'
            }`}>
            <ShoppingCart size={13} />
            {totalItems > 0 ? (
              <>
                <span className="font-bold">{totalItems}</span>
                <span className="hidden sm:inline">· {formatPrecio(totalMonto)}</span>
              </>
            ) : (
              <span className="hidden sm:inline">carrito</span>
            )}
          </Link>

          {/* perfil o login */}
          {usuario ? (
            <div className="flex items-center gap-1">
              <Link to="/perfil"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-dark-border
                  hover:border-primary/40 transition-colors text-gray-600 dark:text-dark-text/70 hidden sm:flex">
                <User size={12} /> {usuario.nombre}
              </Link>
              {+usuario.rol_id === 1 && (
                <Link to="/admin"
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-primary/40 text-primary hover:bg-primary/5 transition-colors hidden md:block">
                  admin
                </Link>
              )}
              <button onClick={handleLogout}
                className="p-1.5 rounded-xl border border-gray-200 dark:border-dark-border hover:border-red-300 hover:text-red-400 transition-colors text-gray-400">
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link to="/login"
                className="px-3 py-1.5 text-xs text-gray-500 dark:text-dark-text/60 hover:text-primary transition-colors">
                entrar
              </Link>
              <Link to="/register" className="btn-primary text-xs px-3 py-1.5">
                crear cuenta
              </Link>
            </div>
          )}

          {/* hamburguesa móvil */}
          <button onClick={() => setMenuMovil(!menuMovil)}
            className="md:hidden p-1.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-500">
            {menuMovil ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      {/* menú móvil desplegable */}
      {menuMovil && (
        <div className="md:hidden border-t border-gray-100 dark:border-dark-border bg-light-card dark:bg-dark-card px-4 py-3 space-y-2">
          {/* buscador móvil */}
          <div className="relative sm:hidden mb-2">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            {setBusqueda ? (
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                placeholder="buscar productos..."
                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border
                  bg-light-bg dark:bg-dark-bg focus:outline-none focus:border-primary/60" />
            ) : (
              <input placeholder="buscar productos..." onKeyDown={handleBusqueda}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-dark-border
                  bg-light-bg dark:bg-dark-bg focus:outline-none focus:border-primary/60" />
            )}
          </div>

          {[
            { to: '/',          label: 'Inicio' },
            { to: '/productos', label: 'Productos' },
            { to: '/nosotros',  label: 'Conócenos' },
          ].map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMenuMovil(false)}
              className={`block text-sm py-1.5 ${isActive(l.to)}`}>
              {l.label}
            </Link>
          ))}

          {usuario ? (
            <>
              <Link to="/perfil" onClick={() => setMenuMovil(false)}
                className="block text-sm py-1.5 text-gray-600 dark:text-dark-text/70">
                mi perfil — {usuario.nombre}
              </Link>
              {+usuario.rol_id === 1 && (
                <Link to="/admin" onClick={() => setMenuMovil(false)}
                  className="block text-sm py-1.5 text-primary font-medium">
                  panel admin
                </Link>
              )}
              <button onClick={handleLogout} className="block text-sm py-1.5 text-red-400 text-left w-full">
                cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    onClick={() => setMenuMovil(false)} className="block text-sm py-1.5 text-gray-600 dark:text-dark-text/70">entrar</Link>
              <Link to="/register" onClick={() => setMenuMovil(false)} className="block text-sm py-1.5 text-primary font-medium">crear cuenta</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}