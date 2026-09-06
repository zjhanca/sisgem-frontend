import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@shared/contexts/AuthContext'
import AdminLayout    from '@shared/components/AdminLayout'
import ScrollToTop    from '@shared/components/ScrollToTop'
import Login          from '@features/autch/pages/Login'
import Register       from '@features/autch/pages/Register'
import Recuperar      from '@features/autch/pages/Recuperar'
import ResetPassword  from '@features/autch/pages/ResetPassword'
import Home           from '@features/tienda/pages/Home'
import Catalogo       from '@features/tienda/pages/Catalogo'
import ProductoDetalle from '@features/tienda/pages/ProductoDetalle'
import PanelCliente   from '@features/tienda/pages/PanelCliente'
import Dashboard      from '@features/admin/dashboard/pages/Dashboard'
import Ventas         from '@features/admin/ventas/pages/Ventas'
import Productos      from '@features/admin/productos/pages/Productos'
import Clientes       from '@features/admin/clientes/pages/Clientes'
import Pagos          from '@features/admin/pagos/pages/Pagos'
import OrdCompra      from '@features/admin/ordenes/pages/OrdCompra'
import Marcas         from '@features/admin/marcas/pages/Marcas'
import Categorias     from '@features/admin/categorias/pages/Categorias'
import Proveedores    from '@features/admin/proveedores/pages/Proveedores'
import Usuarios       from '@features/admin/usuarios/pages/Usuarios'
import Roles          from '@features/admin/roles/pages/Roles'
import Pedidos        from '@features/admin/pedidos/pages/Pedidos'
import Cartera        from '@features/admin/cartera/pages/Cartera'

// Protege el panel admin — cualquier usuario con al menos un permiso admin
function RutaAdmin({ children }) {
  const { usuario, cargando, puedeAccederAdmin } = useAuth()
  if (cargando) return null
  if (!usuario) return <Navigate to="/login" replace />
  if (!puedeAccederAdmin()) return <Navigate to="/" replace />
  return children
}

// Protege rutas individuales por permiso
// Si el usuario puede entrar al admin pero no tiene ESE permiso,
// lo manda al dashboard en vez de bloquearlo
function RutaPermiso({ children, permiso }) {
  const { tienePermiso, cargando, esAdmin } = useAuth()
  if (cargando) return null
  if (esAdmin()) return children // admin tiene todo
  if (!tienePermiso(permiso)) return <Navigate to="/admin" replace />
  return children
}

// Protege el panel de cliente — solo usuarios logueados sin acceso admin
function RutaCliente({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return null
  if (!usuario) return <Navigate to="/login" replace />
  return children
}

// Dashboard — accesible para cualquiera con acceso admin
// redirige al primer módulo disponible si no tiene ver_dashboard
function DashboardOPrimero() {
  const { tienePermiso, esAdmin } = useAuth()
  if (esAdmin() || tienePermiso('ver_dashboard')) return <Dashboard />

  // Redirige al primer módulo que tenga permiso
  const modulos = [
    { permiso: 'ver_ventas',       ruta: '/admin/ventas'       },
    { permiso: 'ver_productos',    ruta: '/admin/productos'     },
    { permiso: 'ver_clientes',     ruta: '/admin/clientes'      },
    { permiso: 'ver_pedidos',      ruta: '/admin/pedidos'       },
    { permiso: 'ver_pagos',        ruta: '/admin/pagos'         },
    { permiso: 'ver_cartera',      ruta: '/admin/cartera'       },
    { permiso: 'ver_ordenes',      ruta: '/admin/ordenes'       },
    { permiso: 'ver_categorias',   ruta: '/admin/categorias'    },
    { permiso: 'ver_marcas',       ruta: '/admin/marcas'        },
    { permiso: 'ver_proveedores',  ruta: '/admin/proveedores'   },
    { permiso: 'ver_usuarios',     ruta: '/admin/usuarios'      },
    { permiso: 'ver_roles',        ruta: '/admin/roles'         },
  ]
  const primero = modulos.find(m => tienePermiso(m.permiso))
  if (primero) return <Navigate to={primero.ruta} replace />
  return <Navigate to="/" replace />
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/"               element={<Home />} />
        <Route path="/productos"      element={<Catalogo />} />
        <Route path="/producto/:id"   element={<ProductoDetalle />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/recuperar"      element={<Recuperar />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Panel cliente */}
        <Route path="/perfil"
          element={<RutaCliente><PanelCliente /></RutaCliente>} />

        {/* Panel admin — protegido por permisos dinámicos */}
        <Route path="/admin"
          element={<RutaAdmin><AdminLayout /></RutaAdmin>}>

          {/* Index — dashboard o primer módulo disponible */}
          <Route index element={<DashboardOPrimero />} />

          <Route path="ventas"
            element={<RutaPermiso permiso="ver_ventas"><Ventas /></RutaPermiso>} />
          <Route path="productos"
            element={<RutaPermiso permiso="ver_productos"><Productos /></RutaPermiso>} />
          <Route path="clientes"
            element={<RutaPermiso permiso="ver_clientes"><Clientes /></RutaPermiso>} />
          <Route path="pagos"
            element={<RutaPermiso permiso="ver_pagos"><Pagos /></RutaPermiso>} />
          <Route path="ordenes"
            element={<RutaPermiso permiso="ver_ordenes"><OrdCompra /></RutaPermiso>} />
          <Route path="marcas"
            element={<RutaPermiso permiso="ver_marcas"><Marcas /></RutaPermiso>} />
          <Route path="categorias"
            element={<RutaPermiso permiso="ver_categorias"><Categorias /></RutaPermiso>} />
          <Route path="proveedores"
            element={<RutaPermiso permiso="ver_proveedores"><Proveedores /></RutaPermiso>} />
          <Route path="usuarios"
            element={<RutaPermiso permiso="ver_usuarios"><Usuarios /></RutaPermiso>} />
          <Route path="roles"
            element={<RutaPermiso permiso="ver_roles"><Roles /></RutaPermiso>} />
          <Route path="pedidos"
            element={<RutaPermiso permiso="ver_pedidos"><Pedidos /></RutaPermiso>} />
          <Route path="cartera"
            element={<RutaPermiso permiso="ver_cartera"><Cartera /></RutaPermiso>} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}