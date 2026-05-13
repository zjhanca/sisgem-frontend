import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@shared/contexts/AuthContext'
import AdminLayout from '@shared/components/AdminLayout'
import Login     from '@features/autch/pages/Login'
import Register  from '@features/autch/pages/Register'
import Recuperar from '@features/autch/pages/Recuperar'
import Home         from '@features/tienda/pages/Home'
import Catalogo     from '@features/tienda/pages/Catalogo'
import Carrito      from '@features/tienda/pages/Carrito'
import PanelCliente from '@features/tienda/pages/PanelCliente'
import Dashboard   from '@features/admin/dashboard/pages/Dashboard'
import Pedidos     from '@features/admin/pedidos/pages/Pedidos'
import Ventas      from '@features/admin/ventas/pages/Ventas'
import Productos   from '@features/admin/productos/pages/Productos'
import Domicilios  from '@features/admin/domicilios/pages/Domicilios'
import Clientes    from '@features/admin/clientes/pages/Clientes'
import Pagos       from '@features/admin/pagos/pages/Pagos'
import OrdCompra   from '@features/admin/ordenes/pages/OrdCompra'
import Marcas      from '@features/admin/marcas/pages/Marcas'
import Categorias  from '@features/admin/categorias/pages/Categorias'
import Proveedores from '@features/admin/proveedores/pages/Proveedores'
import Usuarios    from '@features/admin/usuarios/pages/Usuarios'
import Roles       from '@features/admin/roles/pages/Roles'
 
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
 
export default function AppRoutes() {
  const [carrito, setCarrito] = useState([])
  return (
    <Routes>
      <Route path="/"          element={<Home     carrito={carrito} setCarrito={setCarrito} />} />
      <Route path="/productos" element={<Catalogo carrito={carrito} setCarrito={setCarrito} />} />
      <Route path="/carrito"   element={<Carrito  carrito={carrito} setCarrito={setCarrito} />} />
      <Route path="/login"     element={<Login />} />
      <Route path="/register"  element={<Register />} />
      <Route path="/recuperar" element={<Recuperar />} />
      <Route path="/perfil"    element={<RutaCliente><PanelCliente /></RutaCliente>} />
      <Route path="/admin" element={<RutaAdmin><AdminLayout /></RutaAdmin>}>
        <Route index              element={<Dashboard />} />
        <Route path="pedidos"     element={<Pedidos />} />
        <Route path="ventas"      element={<Ventas />} />
        <Route path="productos"   element={<Productos />} />
        <Route path="domicilios"  element={<Domicilios />} />
        <Route path="clientes"    element={<Clientes />} />
        <Route path="pagos"       element={<Pagos />} />
        <Route path="ordenes"     element={<OrdCompra />} />
        <Route path="marcas"      element={<Marcas />} />
        <Route path="categorias"  element={<Categorias />} />
        <Route path="proveedores" element={<Proveedores />} />
        <Route path="usuarios"    element={<Usuarios />} />
        <Route path="roles"       element={<Roles />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
