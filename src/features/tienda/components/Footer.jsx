import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@shared/contexts/AuthContext'

export default function Footer() {
  const { usuario } = useAuth()
  const location  = useLocation()
  const esCliente = usuario && +usuario.rol_id !== 1
  const enPerfil  = location.pathname === '/perfil'

  return (
    <footer className="mt-0">
      {/* Ola superior */}
      <div className="bg-white">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,24 C360,0 1080,48 1440,24 L1440,48 L0,48 Z" fill="#0F1C22" />
        </svg>
      </div>

      <div className="bg-[#0F1C22]">
        <div className="max-w-6xl mx-auto px-6 py-12
          grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* Marca */}
          <div className="space-y-4 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-primary">SISGEM</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Tu minimercado de confianza en Medellín. Productos frescos y de calidad cada día.
            </p>
            {/* Redes sociales */}
            <div className="flex gap-2 pt-1">
              {['Facebook', 'Instagram', 'WhatsApp'].map(red => (
                <div key={red}
                  className="w-8 h-8 rounded-full border border-gray-600
                    flex items-center justify-center text-gray-400
                    hover:border-primary hover:text-primary transition-all
                    cursor-pointer text-xs font-bold">
                  {red[0]}
                </div>
              ))}
            </div>
          </div>

          {/* Tienda */}
          <div className="space-y-4">
            <p className="text-xs font-black text-white uppercase tracking-widest">
              Tienda
            </p>
            <ul className="space-y-2.5">
              <li>
                <Link to="/"
                  className="text-xs text-gray-400 hover:text-primary transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/productos"
                  className="text-xs text-gray-400 hover:text-primary transition-colors">
                  Productos
                </Link>
              </li>
            </ul>
          </div>

          {/* Mi Cuenta */}
          <div className="space-y-4">
            <p className="text-xs font-black text-white uppercase tracking-widest">
              Mi Cuenta
            </p>
            <ul className="space-y-2.5">
              {usuario ? (
                !enPerfil && esCliente && (
                  <li>
                    <Link to="/perfil"
                      className="text-xs text-gray-400 hover:text-primary transition-colors">
                      Mi Panel
                    </Link>
                  </li>
                )
              ) : (
                <>
                  <li>
                    <Link to="/login"
                      className="text-xs text-gray-400 hover:text-primary transition-colors">
                      Iniciar Sesión
                    </Link>
                  </li>
                  <li>
                    <Link to="/register"
                      className="text-xs text-gray-400 hover:text-primary transition-colors">
                      Crear Cuenta
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contacto */}
          <div className="space-y-4">
            <p className="text-xs font-black text-white uppercase tracking-widest">
              Contacto
            </p>
            <ul className="space-y-2.5">
              <li className="text-xs text-gray-400"> Medellín, Colombia</li>
              <li className="text-xs text-gray-400 hover:text-primary cursor-pointer transition-colors">
                 App disponible
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700/50">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center
            justify-between flex-wrap gap-2">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} Sisgem — Todos los derechos reservados
            </p>
            <p className="text-xs text-gray-600">
              Sistema de Gestión para Minimercado
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}