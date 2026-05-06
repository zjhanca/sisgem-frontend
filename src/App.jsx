import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// ── Admin ────────────────────────────────────────────────────
import AdminLayout  from './components/AdminLayout'
import Dashboard    from './pages/admin/Dashboard'
import Pedidos      from './pages/admin/Pedidos'
import Domicilios   from './pages/admin/Domicilios'
import Ventas       from './pages/admin/Ventas'
import Productos    from './pages/admin/Productos'
import Marcas       from './pages/admin/Marcas'
import Categorias   from './pages/admin/Categorias'
import Proveedores  from './pages/admin/Proveedores'
import Clientes     from './pages/admin/Clientes'
import Pagos        from './pages/admin/Pagos'
import Abonos       from './pages/admin/Abonos'
import OrdCompra    from './pages/admin/OrdCompra'
import Usuarios     from './pages/admin/Usuarios'
import Roles        from './pages/admin/Roles'

// ── Público / Cliente ────────────────────────────────────────
import Home         from './pages/Home'
import Login        from './pages/Login'
import Register     from './pages/Register'
import PanelCliente from './pages/PanelCliente'
import Catalogo     from './pages/Catalogo'
import Carrito      from './pages/Carrito'

// ─────────────────────────────────────────────────────────────
// Guardias de ruta
// ─────────────────────────────────────────────────────────────
function RutaAdmin({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return null
  if (!usuario) return <Navigate to="/login" replace />
  if (+usuario.rol_id !== 1) return <Navigate to="/perfil" replace />
  return children
}

function RutaCliente({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return null
  if (!usuario) return <Navigate to="/login" replace />
  return children
}

// ─────────────────────────────────────────────────────────────
// App — carrito global compartido entre Home, Catalogo, Carrito
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [carrito, setCarrito] = useState([])

  return (
    <BrowserRouter>
      <Routes>

        {/* ── Página principal ── */}
        <Route path="/"
          element={<Home carrito={carrito} setCarrito={setCarrito} />}
        />

        {/* ── Catálogo público ── */}
        <Route path="/productos"
          element={<Catalogo carrito={carrito} setCarrito={setCarrito} />}
        />

        {/* ── Carrito ── */}
        <Route path="/carrito"
          element={<Carrito carrito={carrito} setCarrito={setCarrito} />}
        />

        {/* ── Auth ── */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Panel cliente (requiere login) ── */}
        <Route path="/perfil"
          element={<RutaCliente><PanelCliente /></RutaCliente>}
        />

        {/* ── Panel admin (solo rol admin) ── */}
        <Route path="/admin"
          element={<RutaAdmin><AdminLayout /></RutaAdmin>}
        >
          <Route index               element={<Dashboard />} />
          <Route path="pedidos"      element={<Pedidos />} />
          <Route path="domicilios"   element={<Domicilios />} />
          <Route path="ventas"       element={<Ventas />} />
          <Route path="productos"    element={<Productos />} />
          <Route path="marcas"       element={<Marcas />} />
          <Route path="categorias"   element={<Categorias />} />
          <Route path="proveedores"  element={<Proveedores />} />
          <Route path="clientes"     element={<Clientes />} />
          <Route path="pagos"        element={<Pagos />} />
          <Route path="abonos"       element={<Abonos />} />
          <Route path="ordenes"      element={<OrdCompra />} />
          <Route path="usuarios"     element={<Usuarios />} />
          <Route path="roles"        element={<Roles />} />
        </Route>

        {/* ── Catch-all ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  )
}