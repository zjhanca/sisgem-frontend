import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

import Login     from './pages/Login'
import Recuperar from './pages/Recuperar'
import Catalogo  from './pages/Catalogo'
import Carrito   from './pages/Carrito'

import AdminLayout from './components/AdminLayout'
import Dashboard   from './pages/admin/Dashboard'
import Marcas from './pages/admin/Marcas'
import Productos   from './pages/admin/Productos'
import Categorias  from './pages/admin/Categorias'
import Proveedores from './pages/admin/Proveedores'
import Clientes    from './pages/admin/Clientes'
import Pedidos     from './pages/admin/Pedidos'
import Ventas      from './pages/admin/Ventas'
import OrdCompra   from './pages/admin/OrdCompra'
import Pagos       from './pages/admin/Pagos'
import Domicilios  from './pages/admin/Domicilios'
import Usuarios    from './pages/admin/Usuarios'
import Roles       from './pages/admin/Roles'

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg">
      <div className="text-primary text-sm">cargando...</div>
    </div>
  )
  if (!usuario) return <Navigate to="/login" replace />
  return children
}

function RutaAdmin({ children }) {
  const { usuario } = useAuth()
  if (!usuario || usuario.rol_id !== 1) return <Navigate to="/" replace />
  return children
}

function Rutas() {
  return (
    <Routes>
      <Route path="/"          element={<Catalogo />} />
      <Route path="/carrito"   element={<Carrito />} />
      <Route path="/login"     element={<Login />} />
      <Route path="/recuperar" element={<Recuperar />} />
      <Route path="/admin" element={
        <RutaProtegida>
          <RutaAdmin>
            <AdminLayout />
          </RutaAdmin>
        </RutaProtegida>
      }>
        <Route index                element={<Dashboard />} />
        <Route path="marcas" element={<Marcas />} />
        <Route path="productos"     element={<Productos />} />
        <Route path="categorias"    element={<Categorias />} />
        <Route path="proveedores"   element={<Proveedores />} />
        <Route path="clientes"      element={<Clientes />} />
        <Route path="pedidos"       element={<Pedidos />} />
        <Route path="ventas"        element={<Ventas />} />
        <Route path="ordenes"       element={<OrdCompra />} />
        <Route path="pagos"         element={<Pagos />} />
        <Route path="domicilios"    element={<Domicilios />} />
        <Route path="usuarios"      element={<Usuarios />} />
        <Route path="roles"         element={<Roles />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Rutas />
      </AuthProvider>
    </ThemeProvider>
  )
}