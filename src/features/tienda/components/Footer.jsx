import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@shared/contexts/AuthContext'
import { MapPin, Phone } from 'lucide-react'

export default function Footer() {
  const { usuario } = useAuth()
  const location = useLocation()
  const esCliente = usuario && +usuario.rol_id !== 1
  const enPerfil  = location.pathname === '/perfil'

  return (
    <footer className="mt-16 bg-light-card dark:bg-dark-card border-t border-gray-100 dark:border-dark-border">

      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">

        {/* marca */}
        <div className="space-y-3">
          <span className="font-extrabold text-primary text-lg tracking-tight">Sisgem</span>
          <p className="text-xs text-gray-400 leading-relaxed">
            Tu minimercado de confianza en Medellín. Productos frescos y de calidad cada día.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <MapPin size={11} className="shrink-0" /> Medellín, Colombia
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Phone size={11} className="shrink-0" /> +57 300 000 0000
          </div>
        </div>

        {/* tienda */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wider">Tienda</p>
          <ul className="space-y-2">
            <li><Link to="/"          className="text-xs text-gray-400 hover:text-primary transition-colors">Inicio</Link></li>
            <li><Link to="/productos" className="text-xs text-gray-400 hover:text-primary transition-colors">Productos</Link></li>
          </ul>
        </div>

        {/* cuenta */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wider">Mi Cuenta</p>
          <ul className="space-y-2">
            {usuario ? (
              !enPerfil && esCliente && (
                <li><Link to="/perfil" className="text-xs text-gray-400 hover:text-primary transition-colors">Mi Panel</Link></li>
              )
            ) : (
              <>
                <li><Link to="/login"    className="text-xs text-gray-400 hover:text-primary transition-colors">Iniciar Sesión</Link></li>
                <li><Link to="/register" className="text-xs text-gray-400 hover:text-primary transition-colors">Crear Cuenta</Link></li>
              </>
            )}
          </ul>
        </div>

      </div>

      <div className="border-t border-gray-100 dark:border-dark-border">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Sisgem — Todos los derechos reservados · Medellín, Colombia</p>
        </div>
      </div>

    </footer>
  )
}