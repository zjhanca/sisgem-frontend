import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

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

  const tienePermiso = (permiso) => {
    if (!usuario) return false
    if (+usuario.rol_id === 1) return true // admin tiene todo
    return usuario.permisos?.includes(permiso) ?? false
  }

  const esAdmin   = () => +usuario?.rol_id === 1
  const esCajero  = () => +usuario?.rol_id === 13
  const esCliente = () => +usuario?.rol_id === 11

  return (
    <AuthContext.Provider value={{
      usuario, login, logout, cargando,
      tienePermiso, esAdmin, esCajero, esCliente
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)