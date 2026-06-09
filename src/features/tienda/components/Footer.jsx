import { Link } from 'react-router-dom'
import { MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-100 dark:border-dark-border">
      <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
        <div className="col-span-2 sm:col-span-1">
          <span className="font-extrabold text-primary text-xl tracking-tight">SISGEM</span>
          <p className="text-gray-400 dark:text-dark-text/40 text-xs leading-relaxed mt-2 mb-3">
            Tu minimercado de confianza en Medellín.
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-gray-400"><MapPin size={11} /> Medellín, Colombia</div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400"><Phone size={11} /> 01 8000 000 000</div>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wider mb-3">Tienda</p>
          <ul className="space-y-2">
            {[['/', 'Inicio'], ['/productos', 'Productos'], ['/productos', 'Categorías']].map(([to, label]) => (
              <li key={label}><Link to={to} className="text-xs text-gray-400 hover:text-primary transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wider mb-3">Cuenta</p>
          <ul className="space-y-2">
            {[['/login', 'Iniciar Sesión'], ['/register', 'Crear Cuenta'], ['/perfil', 'Mis Pedidos']].map(([to, label]) => (
              <li key={label}><Link to={to} className="text-xs text-gray-400 hover:text-primary transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold text-light-text dark:text-dark-text uppercase tracking-wider mb-3">Legal</p>
          <ul className="space-y-2">
            <li><span className="text-xs text-gray-400">Términos de uso</span></li>
            <li><span className="text-xs text-gray-400">Privacidad</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-dark-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} SISGEM</p>
          <p className="text-xs text-gray-400">Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  )
}