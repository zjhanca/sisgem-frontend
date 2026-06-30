import { useState, useCallback, useRef } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/contexts/AuthContext'
import api from '@shared/services/api'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, BarChart2,
  Package, Tag, Grid3X3, Users, Shield,
  Building2, ClipboardList, CreditCard, Menu, X,
  LogOut, ChevronDown, ChevronRight,
  KeyRound, Eye, EyeOff, CheckCircle, XCircle
} from 'lucide-react'

const MENU = [
  {
    id: 'configuracion',
    label: 'Configuración',
    items: [
      { to: '/admin/roles', label: 'Roles', icon: Shield },
    ]
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    items: [
      { to: '/admin/usuarios', label: 'Usuarios', icon: Users },
    ]
  },
  {
    id: 'compras',
    label: 'Compras',
    items: [
      { to: '/admin/categorias', label: 'Categorías',       icon: Grid3X3 },
      { to: '/admin/marcas',     label: 'Marcas',           icon: Tag },
      { to: '/admin/productos',  label: 'Productos',        icon: Package },
      { to: '/admin/proveedores',label: 'Proveedores',      icon: Building2 },
      { to: '/admin/ordenes',    label: 'Órdenes de Compra',icon: ClipboardList },
    ]
  },
  {
    id: 'ventas',
    label: 'Ventas',
    items: [
      { to: '/admin/clientes', label: 'Clientes', icon: Users },
      { to: '/admin/ventas',   label: 'Ventas',   icon: BarChart2 },
      { to: '/admin/pagos',    label: 'Pagos',    icon: CreditCard },
    ]
  },
]

const estadoInicial = () => {
  try {
    const saved = localStorage.getItem('sisgem-menu-grupos')
    if (saved) return JSON.parse(saved)
  } catch {}
  return MENU.reduce((acc, g) => ({ ...acc, [g.id]: true }), {})
}

function Requisito({ ok, texto }) {
  return (
    <div className={`flex items-center gap-1 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
      {ok ? <CheckCircle size={10} /> : <XCircle size={10} />} {texto}
    </div>
  )
}

function ModalContrasena({ onCerrar }) {
  const [form, setForm] = useState({ actual: '', nueva: '', confirmar: '' })
  const [ver, setVer]   = useState({ actual: false, nueva: false, confirmar: false })
  const [cargando, setCargando] = useState(false)
  const [errores, setErrores]   = useState({})
  const [focusNueva, setFocusNueva] = useState(false)

  const passReqs = {
    largo:     form.nueva.length >= 6,
    mayuscula: /[A-Z]/.test(form.nueva),
    numero:    /[0-9]/.test(form.nueva),
  }

  const validar = () => {
    const e = {}
    if (!form.actual) e.actual = 'Ingresa tu contraseña actual'
    if (!form.nueva || form.nueva.length < 6) e.nueva = 'Mínimo 6 caracteres'
    if (!/[A-Z]/.test(form.nueva)) e.nueva = 'Debe tener al menos una mayúscula'
    if (!/[0-9]/.test(form.nueva)) e.nueva = 'Debe tener al menos un número'
    if (form.nueva !== form.confirmar) e.confirmar = 'Las contraseñas no coinciden'
    return e
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length) { setErrores(e2); return }
    setCargando(true)
    try {
      await api.patch('/usuarios/me/contrasena', { actual: form.actual, nueva: form.nueva })
      toast.success('Contraseña actualizada correctamente')
      onCerrar()
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al actualizar'
      if (msg.toLowerCase().includes('actual')) setErrores({ actual: msg })
      else toast.error(msg)
    } finally { setCargando(false) }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onCerrar}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
      <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-xl animate-slideIn"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-light-text">Cambiar Contraseña</h3>
          <button onClick={onCerrar} className="p-1 rounded-md text-gray-400 hover:text-primary transition-all">
            <X size={15} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="campo-label">Contraseña Actual *</label>
            <div className="relative">
              <input type={ver.actual ? 'text' : 'password'} value={form.actual}
                onChange={e => { setForm(p => ({ ...p, actual: e.target.value })); setErrores(p => ({ ...p, actual: '' })) }}
                className={`campo-input pr-8 ${errores.actual ? 'border-red-400' : ''}`}
                placeholder="Tu contraseña actual" />
              <button type="button" onClick={() => setVer(p => ({ ...p, actual: !p.actual }))}
                className="absolute right-2 top-3 text-gray-400 hover:text-primary">
                {ver.actual ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errores.actual && <p className="campo-error">{errores.actual}</p>}
          </div>

          <div>
            <label className="campo-label">Nueva Contraseña *</label>
            <div className="relative">
              <input type={ver.nueva ? 'text' : 'password'} value={form.nueva}
                onChange={e => { setForm(p => ({ ...p, nueva: e.target.value })); setErrores(p => ({ ...p, nueva: '' })) }}
                onFocus={() => setFocusNueva(true)} onBlur={() => setFocusNueva(false)}
                className={`campo-input pr-8 ${errores.nueva ? 'border-red-400' : ''}`}
                placeholder="Mínimo 6 caracteres" />
              <button type="button" onClick={() => setVer(p => ({ ...p, nueva: !p.nueva }))}
                className="absolute right-2 top-3 text-gray-400 hover:text-primary">
                {ver.nueva ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {(focusNueva || form.nueva) && (
              <div className="mt-1.5 space-y-1 p-2 bg-gray-50 rounded-lg">
                <Requisito ok={passReqs.largo}     texto="Mínimo 6 caracteres" />
                <Requisito ok={passReqs.mayuscula} texto="Una mayúscula" />
                <Requisito ok={passReqs.numero}    texto="Un número" />
              </div>
            )}
            {errores.nueva && <p className="campo-error">{errores.nueva}</p>}
          </div>

          <div>
            <label className="campo-label">Confirmar Nueva *</label>
            <div className="relative">
              <input type={ver.confirmar ? 'text' : 'password'} value={form.confirmar}
                onChange={e => { setForm(p => ({ ...p, confirmar: e.target.value })); setErrores(p => ({ ...p, confirmar: '' })) }}
                className={`campo-input pr-8 ${errores.confirmar ? 'border-red-400' : ''}`}
                placeholder="Repetir nueva contraseña" />
              <button type="button" onClick={() => setVer(p => ({ ...p, confirmar: !p.confirmar }))}
                className="absolute right-2 top-3 text-gray-400 hover:text-primary">
                {ver.confirmar ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errores.confirmar && <p className="campo-error">{errores.confirmar}</p>}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button type="button" onClick={onCerrar}
              className="px-4 py-1.5 text-sm border border-gray-200 text-gray-500 rounded-lg">Cancelar</button>
            <button type="submit" disabled={cargando} className="btn-primary disabled:opacity-50">
              {cargando ? 'Guardando...' : 'Actualizar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SidebarContent({ collapsed, mobile, usuario, handleLogout, toggleCollapse, gruposAbiertos, toggleGrupo, onCambiarContrasena }) {
  const navRef = useRef(null)
  const [perfilAbierto, setPerfilAbierto] = useState(false)

  return (
    <div className={`flex flex-col h-full border-r border-gray-800
      ${mobile ? 'w-72' : collapsed ? 'w-16' : 'w-60'} transition-all duration-200`}
      style={{ backgroundColor: '#0f1e15' }}>

      {/* logo */}
      <div className={`flex items-center gap-2 p-4 border-b border-gray-700 ${collapsed && !mobile ? 'justify-center' : ''}`}>
        <Link to="/" className="flex items-center gap-2 group" title="Ir a la tienda">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain"
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
            <span style={{display:'none'}} className="w-full h-full items-center justify-center text-xs font-bold text-primary">S</span>
          </div>
          {(!collapsed || mobile) && (
            <span className="font-bold text-primary text-base">Sisgem</span>
          )}
        </Link>
        {!mobile && (
          <button onClick={toggleCollapse} className="ml-auto text-gray-400 hover:text-primary transition-colors">
            {collapsed ? <ChevronRight size={14} /> : <ChevronRight size={14} className="rotate-180" />}
          </button>
        )}
      </div>

      {/* dashboard fijo */}
      <div className="px-2 pt-2">
        <NavLink to="/admin" end
          className={({ isActive }) =>
            `flex items-center ${collapsed && !mobile ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2'} rounded-lg text-sm transition-all ${
              isActive ? 'bg-primary text-white font-medium' : 'text-gray-200 hover:bg-white/10 hover:text-primary'
            }`
          }
          title="Dashboard">
          <LayoutDashboard size={15} />
          {(!collapsed || mobile) && <span>Dashboard</span>}
        </NavLink>
      </div>

      {/* menú agrupado */}
      <nav ref={navRef} className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-hide">
        {MENU.map(grupo => {
          const abierto = gruposAbiertos[grupo.id] ?? true

          if (collapsed && !mobile) {
            return (
              <div key={grupo.id} className="mb-1">
                {grupo.items.map(item => (
                  <NavLink key={item.to} to={item.to}
                    className={({ isActive }) =>
                      `flex items-center justify-center p-2.5 rounded-lg transition-all mb-0.5 ${
                        isActive ? 'bg-primary text-white' : 'text-gray-300 hover:bg-white/10 hover:text-primary'
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
            <div key={grupo.id} className="mb-2">
              <button onClick={() => toggleGrupo(grupo.id)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold
                  text-gray-400 uppercase tracking-wider hover:text-gray-200 transition-colors">
                <span>{grupo.label}</span>
                {abierto ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              </button>
              {abierto && (
                <div className="mt-0.5 space-y-0.5">
                  {grupo.items.map(item => (
                    <NavLink key={item.to} to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                          isActive ? 'bg-primary text-white font-medium' : 'text-gray-200 hover:bg-white/10 hover:text-primary'
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
        })}
      </nav>

      {/* footer usuario */}
      <div className={`p-3 border-t border-gray-700 ${collapsed && !mobile ? 'flex flex-col items-center gap-2' : 'space-y-1'}`}>
        {(!collapsed || mobile) && (
          <div className="relative">
            <button type="button" onClick={() => setPerfilAbierto(p => !p)}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-colors text-left">
              <div className="w-7 h-7 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {usuario?.nombre?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{usuario?.nombre} {usuario?.apellido}</p>
                <p className="text-xs text-gray-400 truncate">{usuario?.email}</p>
              </div>
              <ChevronDown size={12} className={`text-gray-400 transition-transform shrink-0 ${perfilAbierto ? 'rotate-180' : ''}`} />
            </button>
            {perfilAbierto && (
              <div className="absolute bottom-full left-0 right-0 mb-1 rounded-xl shadow-xl overflow-hidden animate-fadeIn z-10 border border-gray-700"
                style={{ backgroundColor: '#162210' }}>
                <button type="button"
                  onClick={() => { setPerfilAbierto(false); onCambiarContrasena() }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-gray-200 hover:bg-white/10 hover:text-primary transition-colors">
                  <KeyRound size={13} /> Cambiar Contraseña
                </button>
                <div className="border-t border-gray-700" />
                <button type="button"
                  onClick={() => { setPerfilAbierto(false); handleLogout() }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-red-400 hover:bg-red-400/10 transition-colors">
                  <LogOut size={13} /> Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        )}
        {collapsed && !mobile && (
          <div className="flex flex-col gap-1">
            <button onClick={onCambiarContrasena}
              className="flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-white/10 transition-colors"
              title="Cambiar contraseña">
              <KeyRound size={13} />
            </button>
            <button onClick={handleLogout}
              className="flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors">
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed]             = useState(false)
  const [menuMovil, setMenuMovil]             = useState(false)
  const [gruposAbiertos, setGruposAbiertos]   = useState(estadoInicial)
  const [modalContrasena, setModalContrasena] = useState(false)

  const toggleGrupo = useCallback(id => {
    setGruposAbiertos(prev => {
      const nuevo = { ...prev, [id]: !prev[id] }
      try { localStorage.setItem('sisgem-menu-grupos', JSON.stringify(nuevo)) } catch {}
      return nuevo
    })
  }, [])

  const handleLogout   = useCallback(() => { logout(); navigate('/login') }, [logout, navigate])
  const toggleCollapse = useCallback(() => setCollapsed(c => !c), [])
  const cerrarMovil    = useCallback(() => setMenuMovil(false), [])

  const sidebarProps = { usuario, handleLogout, toggleCollapse, gruposAbiertos, toggleGrupo, onCambiarContrasena: () => setModalContrasena(true) }

  return (
    <div className="flex h-screen bg-light-bg overflow-hidden">
      <div className="hidden md:flex shrink-0">
        <SidebarContent {...sidebarProps} collapsed={collapsed} mobile={false} />
      </div>

      {menuMovil && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={cerrarMovil} />
          <div className="absolute left-0 top-0 bottom-0 flex">
            <SidebarContent {...sidebarProps} collapsed={false} mobile />
            <button onClick={cerrarMovil} className="mt-4 ml-2 p-1.5 text-white"><X size={18} /></button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-white">
          <button onClick={() => setMenuMovil(true)} className="text-gray-500"><Menu size={18} /></button>
          <Link to="/"><span className="font-bold text-primary">Sisgem</span></Link>
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-light-bg">
          <Outlet />
        </main>
      </div>

      {modalContrasena && <ModalContrasena onCerrar={() => setModalContrasena(false)} />}
    </div>
  )
}