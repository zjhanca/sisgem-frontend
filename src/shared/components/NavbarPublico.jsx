import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
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
 
  const handleBusqueda = e => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      navigate(`/productos?q=${encodeURIComponent(e.target.value.trim())}`)
    }
  }
 
  return (
    <nav className="sticky top-0 z-50 bg-light-card dark:bg-dark-card border-b border-gray-100 dark:border-dark-border shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link to="/" className="text-xl font-bold text-primary shrink-0">SISGEM</Link>
 
        <div className="flex-1 relative max-w-sm hidden sm:block">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          {setBusqueda ? (
            <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-xl border border-gray-200 dark:border-dark-border
                bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text
                focus:outline-none focus:border-primary/60 transition-colors" />
          ) : (
            <input placeholder="Buscar productos..." onKeyDown={handleBusqueda}
              className="w-full pl-8 pr-3 py-1.5 text-sm rounded-xl border border-gray-200 dark:border-dark-border
                bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text
                focus:outline-none focus:border-primary/60 transition-colors" />
          )}
        </div>
 
        <div className="hidden md:flex items-center gap-4 text-sm">
          <Link to="/"          className={isActive('/')}>Inicio</Link>
          <Link to="/productos" className={isActive('/productos')}>Productos</Link>
        </div>
 
        <div className="flex items-center gap-2 ml-auto shrink-0">
          <Link to="/carrito"
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              totalItems > 0
                ? 'bg-primary text-dark-bg hover:bg-primary/90'
                : 'border border-gray-200 dark:border-dark-border text-gray-500 hover:border-primary/40'
            }`}>
            <ShoppingCart size={13} />
            {totalItems > 0 ? (
              <>
                <span className="font-bold">{totalItems}</span>
                <span className="hidden sm:inline">· {formatPrecio(totalMonto)}</span>
              </>
            ) : (
              <span className="hidden sm:inline">Carrito</span>
            )}
          </Link>
 
          {usuario ? (
            <div className="flex items-center gap-1">
              <Link to="/perfil"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border
                  border-gray-200 dark:border-dark-border hover:border-primary/40 transition-colors
                  text-gray-600 dark:text-dark-text/70">
                <User size={12} /> {usuario.nombre}
              </Link>
              {+usuario.rol_id === 1 && (
                <Link to="/admin"
                  className="hidden md:block px-2.5 py-1.5 text-xs rounded-xl border border-primary/40
                    text-primary hover:bg-primary/5 transition-colors">
                  Admin
                </Link>
              )}
              <button onClick={handleLogout}
                className="p-1.5 rounded-xl border border-gray-200 dark:border-dark-border
                  hover:border-red-300 hover:text-red-400 transition-colors text-gray-400">
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5">
              <Link to="/login"
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-primary transition-colors">
                Entrar
              </Link>
              <Link to="/register" className="btn-primary text-xs px-3 py-1.5">
                Crear Cuenta
              </Link>
            </div>
          )}
 
          <button onClick={() => setMenuMovil(!menuMovil)}
            className="md:hidden p-1.5 rounded-xl border border-gray-200 dark:border-dark-border text-gray-500">
            {menuMovil ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>
 
      {menuMovil && (
        <div className="md:hidden border-t border-gray-100 dark:border-dark-border bg-light-card dark:bg-dark-card px-4 py-3 space-y-2">
          <div className="relative sm:hidden mb-2">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            {setBusqueda ? (
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar..." className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border
                  border-gray-200 dark:border-dark-border bg-light-bg dark:bg-dark-bg focus:outline-none" />
            ) : (
              <input placeholder="Buscar..." onKeyDown={handleBusqueda}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-xl border border-gray-200
                  dark:border-dark-border bg-light-bg dark:bg-dark-bg focus:outline-none" />
            )}
          </div>
          <Link to="/"          onClick={() => setMenuMovil(false)} className={`block text-sm py-1.5 ${isActive('/')}`}>Inicio</Link>
          <Link to="/productos" onClick={() => setMenuMovil(false)} className={`block text-sm py-1.5 ${isActive('/productos')}`}>Productos</Link>
          {usuario ? (
            <>
              <Link to="/perfil" onClick={() => setMenuMovil(false)} className="block text-sm py-1.5 text-gray-600 dark:text-dark-text/70">
                Mi Perfil — {usuario.nombre}
              </Link>
              {+usuario.rol_id === 1 && (
                <Link to="/admin" onClick={() => setMenuMovil(false)} className="block text-sm py-1.5 text-primary font-medium">
                  Panel Admin
                </Link>
              )}
              <button onClick={handleLogout} className="block text-sm py-1.5 text-red-400 text-left w-full">
                Cerrar Sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login"    onClick={() => setMenuMovil(false)} className="block text-sm py-1.5 text-gray-600">Entrar</Link>
              <Link to="/register" onClick={() => setMenuMovil(false)} className="block text-sm py-1.5 text-primary font-medium">Crear Cuenta</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}
