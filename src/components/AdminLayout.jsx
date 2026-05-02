import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTema } from '../context/ThemeContext'
import { Sun, Moon, LogOut, LayoutDashboard, Package,
  Users, ShoppingCart, Truck, CreditCard, MapPin,
  ClipboardList, Tag, UserCog, ShieldCheck } from 'lucide-react'

const menu = [
  { to: '/admin',            label: 'dashboard',      icon: LayoutDashboard, exact: true },
  { to: '/admin/pedidos',    label: 'pedidos',        icon: ShoppingCart },
  { to: '/admin/productos',  label: 'productos',      icon: Package },
  { to: '/admin/categorias', label: 'categorias',     icon: Tag },
  { to: '/admin/proveedores',label: 'proveedores',    icon: Truck },
  { to: '/admin/ordenes',    label: 'compras',        icon: ClipboardList },
  { to: '/admin/clientes',   label: 'clientes',       icon: Users },
  { to: '/admin/pagos',      label: 'pagos',          icon: CreditCard },
  { to: '/admin/domicilios', label: 'domicilios',     icon: MapPin },
  { to: '/admin/usuarios',   label: 'usuarios',       icon: UserCog },
  { to: '/admin/roles',      label: 'roles',          icon: ShieldCheck },
]

export default function AdminLayout() {
  const { usuario, logout } = useAuth()
  const { tema, toggleTema } = useTema()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className='flex h-screen bg-dark-bg dark:bg-dark-bg bg-light-bg overflow-hidden'>
      {/* sidebar */}
      <aside className='w-56 bg-dark-card dark:bg-dark-card bg-light-card
        border-r border-dark-border flex flex-col py-4 shrink-0'>
        <div className='px-4 mb-6'>
          <span className='text-primary font-bold text-xl'>sisgem</span>
        </div>
        <nav className='flex-1 px-2 space-y-0.5 overflow-y-auto'>
          {menu.map(item => (
            <NavLink key={item.to} to={item.to}
              end={item.exact}
              className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-lg
                text-sm transition-colors ${isActive
                  ? 'bg-primary text-dark-bg font-medium'
                  : 'text-dark-text hover:bg-dark-border'}`}
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className='px-4 pt-4 border-t border-dark-border'>
          <p className='text-xs text-dark-text/60 mb-1'>{usuario?.nombre}</p>
          <p className='text-xs text-primary/70 mb-3'>{usuario?.rol}</p>
          <div className='flex gap-2'>
            <button onClick={toggleTema}
              className='p-1.5 rounded-lg bg-dark-border text-dark-text hover:text-primary'>
              {tema === 'dark' ? <Sun size={14}/> : <Moon size={14}/>}
            </button>
            <button onClick={handleLogout}
              className='flex items-center gap-1 text-xs text-red-400 hover:text-red-300'>
              <LogOut size={14}/> salir
            </button>
          </div>
        </div>
      </aside>

      {/* contenido principal */}
      <main className='flex-1 overflow-y-auto p-6'>
        <Outlet />
      </main>
    </div>
  )
}
