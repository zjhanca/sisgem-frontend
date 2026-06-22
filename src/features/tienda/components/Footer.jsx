import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-100 dark:border-dark-border">
      <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <span className="font-extrabold text-primary text-base tracking-tight">SISGEM</span>

        <div className="flex items-center gap-5">
          <Link to="/"         className="text-xs text-gray-400 hover:text-primary transition-colors">Inicio</Link>
          <Link to="/productos" className="text-xs text-gray-400 hover:text-primary transition-colors">Productos</Link>
          <Link to="/login"    className="text-xs text-gray-400 hover:text-primary transition-colors">Iniciar Sesión</Link>
        </div>

        <p className="text-xs text-gray-400">© {new Date().getFullYear()} SISGEM · Medellín</p>

      </div>
    </footer>
  )
}