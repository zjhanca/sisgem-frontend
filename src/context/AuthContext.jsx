import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('sisgem_token')
    const user = localStorage.getItem('sisgem_usuario')
    if (token && user) {
      setUsuario(JSON.parse(user))
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

  return (
    <AuthContext.Provider value={{ usuario, login, logout, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
