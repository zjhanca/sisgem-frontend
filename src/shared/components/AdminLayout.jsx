import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/contexts/AuthContext'
import { useTema } from '@shared/contexts/ThemeContext'
import {
  LayoutDashboard, ShoppingCart, Truck, BarChart2,
  Package, Tag, Grid3X3, Users, Shield,
  Building2, ClipboardList, CreditCard, Menu, X,
  Sun, Moon, LogOut, ChevronDown, ChevronRight, Store
} from 'lucide-react'
 
const MENU = [
  {
    label: 'Principal',
    items: [
      { to: '/admin',          label: 'Dashboard',  icon: LayoutDashboard, exact: true },
    ]
  },
  {
    label: 'Gestión de Ventas',
    items: [
      { to: '/admin/pedidos',    label: 'Pedidos',    icon: ShoppingCart },
      { to: '/admin/ventas',     label: 'Ventas',     icon: BarChart2 },
      { to: '/admin/domicilios', label: 'Domicilios', icon: Truck },
      { to: '/admin/pagos',      label: 'Pagos',      icon: CreditCard },
    ]
  },
  {
    label: 'Gestión de Productos',
    items: [
      { to: '/admin/productos',  label: 'Productos',  icon: Package },
      { to: '/admin/marcas',     label: 'Marcas',     icon: Tag },
      { to: '/admin/categorias', label: 'Categorías', icon: Grid3X3 },
    ]
  },
  {
    label: 'Gestión de Compras',
    items: [
      { to: '/admin/proveedores', label: 'Proveedores', icon: Building2 },
      { to: '/admin/ordenes',     label: 'Compras',     icon: ClipboardList },
    ]
  },
  {
    label: 'Gestión de Usuarios',
    items: [
      { to: '/admin/clientes', label: 'Clientes', icon: Users },
      { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
      { to: '/admin/roles',    label: 'Roles',    icon: Shield },
    ]
  },
]
 
function GrupoMenu({ grupo, collapsed }) {
  const [abierto, setAbierto] = useState(true)
 
  if (collapsed) {
    return (
      <div className="mb-1">
        {grupo.items.map(item => (
          <NavLink key={item.to} to={item.to} end={item.exact}
            className={({ isActive }) =>
              `flex items-center justify-center p-2.5 rounded-lg transition-all mb-0.5 ${
                isActive ? 'bg-primary text-dark-bg' : 'text-dark-text/60 hover:bg-dark-card hover:text-primary'
              }`
            }
            title={item.label}>
            <item.icon size={16} />
          </NavLink>
        ))}
      </div>
    )
  }
 
  return (
    <div className="mb-2">
      <button onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold
          text-dark-text/40 uppercase tracking-wider hover:text-dark-text/60 transition-colors">
        <span>{grupo.label}</span>
        {abierto ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
      </button>
      {abierto && (
        <div className="mt-0.5 space-y-0.5">
          {grupo.items.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-primary text-dark-bg font-medium'
                    : 'text-dark-text/70 hover:bg-dark-card hover:text-primary'
                }`
              }>
              <item.icon size={15} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}
 
export default function AdminLayout() {
  const { usuario, logout } = useAuth()
  const { tema, toggleTema } = useTema()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [menuMovil, setMenuMovil] = useState(false)
 
  const handleLogout = () => { logout(); navigate('/login') }
 
  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-dark-bg border-r border-dark-border
      ${mobile ? 'w-72' : collapsed ? 'w-16' : 'w-60'} transition-all duration-200`}>
 
      {/* logo */}
      <div className={`flex items-center gap-2 p-4 border-b border-dark-border ${collapsed && !mobile ? 'justify-center' : ''}`}>
        <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
          <Store size={15} className="text-primary" />
        </div>
        {(!collapsed || mobile) && (
          <span className="font-bold text-primary text-base">SISGEM</span>
        )}
        {!mobile && (
          <button onClick={() => setCollapsed(!collapsed)}
            className="ml-auto text-dark-text/40 hover:text-primary transition-colors">
            {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} className="rotate-90" />}
          </button>
        )}
      </div>
 
      {/* menú */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
        {MENU.map(grupo => (
          <GrupoMenu key={grupo.label} grupo={grupo} collapsed={collapsed && !mobile} />
        ))}
      </nav>
 
      {/* footer usuario */}
      <div className={`p-3 border-t border-dark-border ${collapsed && !mobile ? 'flex flex-col items-center gap-2' : 'space-y-2'}`}>
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2 px-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              {usuario?.nombre?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-dark-text truncate">{usuario?.nombre}</p>
              <p className="text-xs text-dark-text/40 truncate">{usuario?.email}</p>
            </div>
          </div>
        )}
        <div className={`flex gap-1 ${collapsed && !mobile ? 'flex-col' : ''}`}>
          <button onClick={toggleTema}
            className="flex-1 flex items-center justify-center gap-1.5 p-1.5 rounded-lg
              text-dark-text/50 hover:text-primary hover:bg-dark-card transition-colors text-xs">
            {tema === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
            {(!collapsed || mobile) && (tema === 'dark' ? 'Claro' : 'Oscuro')}
          </button>
          <button onClick={handleLogout}
            className="flex-1 flex items-center justify-center gap-1.5 p-1.5 rounded-lg
              text-dark-text/50 hover:text-red-400 hover:bg-dark-card transition-colors text-xs">
            <LogOut size={13} />
            {(!collapsed || mobile) && 'Salir'}
          </button>
        </div>
      </div>
    </div>
  )
 
  return (
    <div className="flex h-screen bg-dark-bg overflow-hidden">
 
      {/* sidebar desktop */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>
 
      {/* sidebar móvil */}
      {menuMovil && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuMovil(false)} />
          <div className="absolute left-0 top-0 bottom-0 flex">
            <Sidebar mobile />
            <button onClick={() => setMenuMovil(false)}
              className="mt-4 ml-2 p-1.5 text-white">
              <X size={18} />
            </button>
          </div>
        </div>
      )}
 
      {/* contenido */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* topbar móvil */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3
          border-b border-dark-border bg-dark-bg">
          <button onClick={() => setMenuMovil(true)} className="text-dark-text/60">
            <Menu size={18} />
          </button>
          <span className="font-bold text-primary">SISGEM</span>
        </div>
 
        {/* página */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
