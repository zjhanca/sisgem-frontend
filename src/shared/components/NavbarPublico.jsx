import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, LogOut } from 'lucide-react'

export default function NavbarPublico() {
  const { usuario, logout } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [menuMovil, setMenuMovil] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }
  const esAdmin   = usuario && +usuario.rol_id === 1
  const esCliente = usuario && +usuario.rol_id !== 1
  const enAdmin   = location.pathname.startsWith('/admin')
  const enPerfil  = location.pathname === '/perfil'

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-4">

        <Link to="/" className="shrink-0 flex items-center gap-2">
          <img src="/logo.png" alt="Sisgem"
            className="h-9 w-auto object-contain"
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }} />
          <span style={{display:'none'}} className="text-xl font-bold text-primary">Sisgem</span>
        </Link>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {usuario ? (
            <div className="flex items-center gap-2">

              {/* saludo — no clickeable */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center
                  text-white text-xs font-bold shrink-0">
                  {usuario.nombre?.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-light-text">
                  Hola, {usuario.nombre}
                </span>
              </div>

              {/* Panel Admin — mismo estilo que Mi Panel, no clickeable si ya está en /admin */}
              {esAdmin && (
                enAdmin ? (
                  <span className="hidden md:block px-3 py-1.5 text-xs rounded-lg
                    border border-primary/30 text-primary/40 font-medium cursor-default select-none">
                    Panel Admin
                  </span>
                ) : (
                  <Link to="/admin"
                    className="hidden md:block px-3 py-1.5 text-xs rounded-lg
                      border border-primary/30 text-primary hover:bg-primary/5 transition-colors font-medium">
                    Panel Admin
                  </Link>
                )
              )}

              {/* Mi Panel — oculto cuando ya está en /perfil */}
              {esCliente && !enPerfil && (
                <Link to="/perfil"
                  className="hidden md:block px-3 py-1.5 text-xs rounded-lg
                    border border-primary/30 text-primary hover:bg-primary/5 transition-colors font-medium">
                  Mi Panel
                </Link>
              )}

              <button onClick={handleLogout}
                className="p-1.5 rounded-lg border border-gray-200
                  hover:border-red-200 hover:text-red-400 transition-colors text-gray-400">
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login"
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-primary transition-colors font-medium">
                Entrar
              </Link>
              <Link to="/register" className="btn-primary text-xs px-3 py-1.5">
                Crear Cuenta
              </Link>
            </div>
          )}

          <button onClick={() => setMenuMovil(!menuMovil)}
            className="md:hidden p-1.5 rounded-lg border border-gray-200 text-gray-500">
            {menuMovil ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>
      </div>

      {menuMovil && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-2">
          {usuario ? (
            <>
              <div className="flex items-center gap-2 py-1.5">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                  {usuario.nombre?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-light-text">Hola, {usuario.nombre}</span>
              </div>
              {esAdmin && (
                <Link to="/admin" onClick={() => setMenuMovil(false)}
                  className="block text-sm py-1.5 text-primary font-medium">Panel Admin</Link>
              )}
              {esCliente && !enPerfil && (
                <Link to="/perfil" onClick={() => setMenuMovil(false)}
                  className="block text-sm py-1.5 text-primary font-medium">Mi Panel</Link>
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