import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

const PERMISOS_ADMIN = [
  'ver_dashboard',
  'ver_productos', 'crear_productos', 'editar_productos', 'eliminar_productos',
  'ver_categorias', 'crear_categorias', 'editar_categorias', 'eliminar_categorias',
  'ver_marcas', 'crear_marcas', 'editar_marcas', 'eliminar_marcas',
  'ver_ventas', 'crear_ventas', 'editar_ventas', 'anular_ventas',
  'ver_pedidos', 'crear_pedidos', 'editar_pedidos', 'gestionar_pedidos',
  'ver_clientes', 'crear_clientes', 'editar_clientes', 'eliminar_clientes',
  'ver_pagos', 'crear_pagos', 'editar_pagos', 'anular_pagos',
  'ver_cartera', 'gestionar_cartera',
  'ver_ordenes', 'gestionar_ordenes',
  'ver_proveedores', 'gestionar_proveedores',
  'ver_usuarios', 'gestionar_usuarios',
  'ver_roles', 'gestionar_roles',
  'ver_reportes', 'ver_domicilios',
]

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sisgem_token')
    const user  = localStorage.getItem('sisgem_usuario')
    if (token && user) {
      try { setUsuario(JSON.parse(user)) }
      catch {
        localStorage.removeItem('sisgem_token')
        localStorage.removeItem('sisgem_usuario')
      }
    }
    setCargando(false)
  }, [])

  const login = (token, user) => {
    localStorage.setItem('sisgem_token', token)
    localStorage.setItem('sisgem_usuario', JSON.stringify(user))
    setUsuario(user)
  }

  const logout = () => {
    localStorage.removeItem('sisgem_token')
    localStorage.removeItem('sisgem_usuario')
    setUsuario(null)
  }

  const esAdmin  = () => !!usuario && +usuario.rol_id === 1
  const esCajero = () => !!usuario && +usuario.rol_id === 13

  const tienePermiso = permiso => {
    if (!usuario) return false
    if (esAdmin()) return true
    return usuario.permisos?.includes(permiso) ?? false
  }

  const tieneAlguno = (...permisos) => {
    if (!usuario) return false
    if (esAdmin()) return true
    return permisos.some(p => usuario.permisos?.includes(p))
  }

  const puedeAccederAdmin = () => {
    if (!usuario) return false
    if (esAdmin()) return true
    return usuario.permisos?.some(p => PERMISOS_ADMIN.includes(p)) ?? false
  }

  const esCliente = () => {
    if (!usuario) return false
    return !puedeAccederAdmin()
  }

  return (
    <AuthContext.Provider value={{
      usuario, login, logout, cargando,
      tienePermiso, tieneAlguno, puedeAccederAdmin,
      esAdmin, esCajero, esCliente,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)