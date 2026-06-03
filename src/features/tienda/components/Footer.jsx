import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-100 dark:border-dark-border bg-light-card dark:bg-dark-card">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-start justify-between gap-6">

        <div className="max-w-xs">
          <h4 className="font-bold text-primary text-xl mb-2">SISGEM</h4>
          <p className="text-gray-500 text-xs leading-relaxed">
            Tu minimercado de confianza en Medellín. Calidad y frescura en cada producto.
          </p>
          <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
            <MapPin size={11} /> Medellín, Colombia
          </div>
        </div>

        <div className="flex gap-8 text-sm">
          <div>
            <h4 className="font-semibold mb-3 text-sm text-light-text dark:text-dark-text">Mi Cuenta</h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><Link to="/login"    className="hover:text-primary transition-colors">Iniciar Sesión</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">Crear Cuenta</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-sm text-light-text dark:text-dark-text">Tienda</h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><Link to="/"          className="hover:text-primary transition-colors">Inicio</Link></li>
              <li><Link to="/productos" className="hover:text-primary transition-colors">Productos</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-dark-border text-center py-3 text-xs text-gray-400">
        © {new Date().getFullYear()} SISGEM — Todos los derechos reservados
      </div>
    </footer>
  )
}