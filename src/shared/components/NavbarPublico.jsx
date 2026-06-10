import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Menu, X, LogOut } from 'lucide-react'

export default function NavbarPublico() {
  const { usuario, logout } = useAuth()
  const navigate  = useNavigate()
  const [menuMovil, setMenuMovil] = useState(false)

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-4">

        <Link to="/" className="shrink-0 flex items-center gap-2 group">
          <img src="/logo.png" alt="Sisgem"
            className="h-9 w-auto object-contain"
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }} />
          <span style={{display:'none'}} className="text-xl font-bold text-primary">Sisgem</span>
        </Link>

        <div className="flex items-center gap-2 ml-auto shrink-0">
          {usuario ? (
            <div className="flex items-center gap-2">
              {+usuario.rol_id === 1 && (
                <Link to="/admin"
                  className="hidden md:block px-3 py-1.5 text-xs rounded-lg
                    bg-light-text text-white hover:bg-gray-700
                    transition-colors font-medium">
                  Panel Admin
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
              {+usuario.rol_id === 1 && (
                <Link to="/admin" onClick={() => setMenuMovil(false)}
                  className="block text-sm py-1.5 text-light-text font-medium">Panel Admin</Link>
              )}
              <button onClick={handleLogout} className="block text-sm py-1.5 text-red-400 text-left w-full">Cerrar Sesión</button>
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