import { Link } from 'react-router-dom'
import { MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-100 dark:border-dark-border bg-light-card dark:bg-dark-card">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">

        {/* marca */}
        <div>
          <h4 className="font-extrabold text-primary text-2xl mb-3">SISGEM</h4>
          <p className="text-gray-500 dark:text-dark-text/50 text-xs leading-relaxed mb-4">
            Tu minimercado de confianza en Medellín. Calidad y frescura en cada producto.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
            <MapPin size={12} /> Medellín, Colombia
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Phone size={12} /> Línea de atención: 01 8000 000 000
          </div>
        </div>

        {/* tienda */}
        <div>
          <h4 className="font-bold text-sm text-light-text dark:text-dark-text mb-4">Tienda</h4>
          <ul className="space-y-2.5 text-xs text-gray-500 dark:text-dark-text/50">
            <li><Link to="/"          className="hover:text-primary transition-colors">Inicio</Link></li>
            <li><Link to="/productos" className="hover:text-primary transition-colors">Productos</Link></li>
            <li><Link to="/productos" className="hover:text-primary transition-colors">Categorías</Link></li>
            <li><Link to="/productos" className="hover:text-primary transition-colors">Marcas</Link></li>
          </ul>
        </div>

        {/* cuenta */}
        <div>
          <h4 className="font-bold text-sm text-light-text dark:text-dark-text mb-4">Mi Cuenta</h4>
          <ul className="space-y-2.5 text-xs text-gray-500 dark:text-dark-text/50">
            <li><Link to="/login"    className="hover:text-primary transition-colors">Iniciar Sesión</Link></li>
            <li><Link to="/register" className="hover:text-primary transition-colors">Crear Cuenta</Link></li>
            <li><Link to="/perfil"   className="hover:text-primary transition-colors">Mis Pedidos</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-dark-border text-center py-4 text-xs text-gray-400">
        © {new Date().getFullYear()} SISGEM — Todos los derechos reservados
      </div>
    </footer>
  )
}