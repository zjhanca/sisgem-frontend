import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-100 dark:border-dark-border">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-3 gap-8">

        <div className="col-span-2 sm:col-span-1">
          <span className="font-extrabold text-primary text-xl tracking-tight">SISGEM</span>
          <p className="text-gray-400 dark:text-dark-text/40 text-xs leading-relaxed mt-2 mb-3">
            Tu minimercado de confianza en Medellín.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <MapPin size={11} /> Medellín, Colombia
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wider mb-3">Tienda</p>
          <ul className="space-y-2">
            <li><Link to="/" className="text-xs text-gray-400 hover:text-primary transition-colors">Inicio</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wider mb-3">Cuenta</p>
          <ul className="space-y-2">
            <li><Link to="/login"    className="text-xs text-gray-400 hover:text-primary transition-colors">Iniciar Sesión</Link></li>
            <li><Link to="/register" className="text-xs text-gray-400 hover:text-primary transition-colors">Crear Cuenta</Link></li>
          </ul>
        </div>

      </div>

      <div className="border-t border-gray-100 dark:border-dark-border">
        <div className="max-w-6xl mx-auto px-4 py-4 text-center">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} SISGEM — Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  )
}