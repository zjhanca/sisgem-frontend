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

function RutaAdmin({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return null
  if (!usuario) return <Navigate to='/login' replace />
  if (+usuario.rol_id !== 1 && +usuario.rol_id !== 13) return <Navigate to='/' replace />
  return children
}

function RutaPermiso({ children, permiso }) {
  const { tienePermiso, cargando } = useAuth()
  if (cargando) return null
  if (!tienePermiso(permiso)) return <Navigate to='/admin' replace />
  return children
}

function RutaCliente({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return null
  if (!usuario) return <Navigate to='/login' replace />
  return children
}

export default function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path='/'             element={<Home />} />
        <Route path='/productos'    element={<Catalogo />} />
        <Route path='/producto/:id' element={<ProductoDetalle />} />
        <Route path='/login'        element={<Login />} />
        <Route path='/register'     element={<Register />} />
        <Route path='/recuperar'    element={<Recuperar />} />
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/perfil'       element={<RutaCliente><PanelCliente /></RutaCliente>} />

        <Route path='/admin' element={<RutaAdmin><AdminLayout /></RutaAdmin>}>
          <Route index element={<Dashboard />} />
          <Route path='ventas'
            element={<RutaPermiso permiso='ver_ventas'><Ventas /></RutaPermiso>} />
          <Route path='productos'
            element={<RutaPermiso permiso='ver_productos'><Productos /></RutaPermiso>} />
          <Route path='clientes'
            element={<RutaPermiso permiso='ver_clientes'><Clientes /></RutaPermiso>} />
          <Route path='pagos'
            element={<RutaPermiso permiso='ver_pagos'><Pagos /></RutaPermiso>} />
          <Route path='ordenes'
            element={<RutaPermiso permiso='ver_ordenes'><OrdCompra /></RutaPermiso>} />
          <Route path='marcas'
            element={<RutaPermiso permiso='ver_marcas'><Marcas /></RutaPermiso>} />
          <Route path='categorias'
            element={<RutaPermiso permiso='ver_categorias'><Categorias /></RutaPermiso>} />
          <Route path='proveedores'
            element={<RutaPermiso permiso='ver_proveedores'><Proveedores /></RutaPermiso>} />
          <Route path='usuarios'
            element={<RutaPermiso permiso='ver_usuarios'><Usuarios /></RutaPermiso>} />
          <Route path='roles'
            element={<RutaPermiso permiso='ver_roles'><Roles /></RutaPermiso>} />
          <Route path='pedidos'
            element={<RutaPermiso permiso='ver_pedidos'><Pedidos /></RutaPermiso>} />
        </Route>

        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
    </>
  )
}