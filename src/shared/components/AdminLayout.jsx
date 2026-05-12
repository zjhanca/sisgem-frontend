import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTema } from '../contexts/ThemeContext'
import { Award } from 'lucide-react'
import {
  Sun, Moon, LogOut, LayoutDashboard, Package,
  Users, ShoppingCart, Truck, CreditCard, MapPin,
  ClipboardList, Tag, UserCog, ShieldCheck, Store, TrendingUp
} from 'lucide-react'

const menu = [
  { to: '/admin',             label: 'dashboard',   icon: LayoutDashboard, exact: true },
  { to: '/admin/marcas', label: 'marcas', icon: Award },
  { to: '/admin/pedidos',     label: 'pedidos',     icon: ShoppingCart },
  { to: '/admin/ventas',      label: 'ventas',      icon: TrendingUp },
  { to: '/admin/productos',   label: 'productos',   icon: Package },
  { to: '/admin/categorias',  label: 'categorias',  icon: Tag },
  { to: '/admin/proveedores', label: 'proveedores', icon: Truck },
  { to: '/admin/ordenes',     label: 'compras',     icon: ClipboardList },
  { to: '/admin/clientes',    label: 'clientes',    icon: Users },
  { to: '/admin/pagos',       label: 'pagos',       icon: CreditCard },
  { to: '/admin/domicilios',  label: 'domicilios',  icon: MapPin },
  { to: '/admin/usuarios',    label: 'usuarios',    icon: UserCog },
  { to: '/admin/roles',       label: 'roles',       icon: ShieldCheck },
]

export default function AdminLayout() {
  const { usuario, logout } = useAuth()
  const { tema, toggleTema } = useTema()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen bg-light-bg dark:bg-dark-bg overflow-hidden">
      <aside className="w-52 bg-light-card dark:bg-dark-card border-r border-gray-200 dark:border-dark-border flex flex-col shrink-0">
        <div className="px-4 py-4 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center gap-2">
            <Store size={18} className="text-primary" />
            <span className="font-bold text-primary">sisgem</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-dark-text/40 mt-0.5">panel administrativo</p>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {menu.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-dark-bg font-medium'
                    : 'text-gray-500 dark:text-dark-text/70 hover:bg-gray-100 dark:hover:bg-dark-border'
                }`
              }
            >
              <item.icon size={15} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-gray-200 dark:border-dark-border">
          <p className="text-xs font-medium text-light-text dark:text-dark-text truncate">
            {usuario?.nombre} {usuario?.apellido}
          </p>
          <p className="text-xs text-primary/70 mb-3">{usuario?.rol}</p>
          <div className="flex items-center gap-2">
            <button onClick={toggleTema} className="btn-ghost">
              {tema === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <button onClick={() => { logout(); navigate('/login') }}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors">
              <LogOut size={13} /> salir
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-5">
        <Outlet />
      </main>
    </div>
  )
}