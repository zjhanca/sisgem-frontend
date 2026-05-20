import { Link } from 'react-router-dom'
 
export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-100 dark:border-dark-border bg-light-card dark:bg-dark-card">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
 
        <div>
          <h4 className="font-bold text-primary text-lg mb-2">SISGEM</h4>
          <p className="text-gray-500 text-xs leading-relaxed">
            Tu minimercado de confianza en Medellín.
          </p>
        </div>
 
        <div>
          <h4 className="font-semibold mb-2 text-sm text-light-text dark:text-dark-text">Explorar</h4>
          <ul className="space-y-1.5 text-xs text-gray-500">
            <li><Link to="/productos" className="hover:text-primary transition-colors">Productos</Link></li>
            <li><Link to="/productos" className="hover:text-primary transition-colors">Categorías</Link></li>
            <li><Link to="/productos" className="hover:text-primary transition-colors">Marcas</Link></li>
          </ul>
        </div>
 
        <div>
          <h4 className="font-semibold mb-2 text-sm text-light-text dark:text-dark-text">Mi Cuenta</h4>
          <ul className="space-y-1.5 text-xs text-gray-500">
            <li><Link to="/login"    className="hover:text-primary transition-colors">Iniciar Sesión</Link></li>
            <li><Link to="/register" className="hover:text-primary transition-colors">Crear Cuenta</Link></li>
            <li><Link to="/perfil"   className="hover:text-primary transition-colors">Mi Perfil</Link></li>
          </ul>
        </div>
 
        <div>
          <h4 className="font-semibold mb-2 text-sm text-light-text dark:text-dark-text">Conócenos</h4>
          <ul className="space-y-1.5 text-xs text-gray-500">
            <li>📍 Medellín, Colombia</li>
            <li>🕐 Lun–Sab 7am–8pm</li>
          </ul>
        </div>
 
      </div>
 
      <div className="border-t border-gray-100 dark:border-dark-border text-center py-3 text-xs text-gray-400">
        © {new Date().getFullYear()} SISGEM — Todos los derechos reservados
      </div>
    </footer>
  )
}
