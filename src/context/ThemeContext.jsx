import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(() =>
    localStorage.getItem('sisgem_tema') || 'dark'
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'dark')
    localStorage.setItem('sisgem_tema', tema)
  }, [tema])

  const toggleTema = () =>
    setTema(prev => prev === 'dark' ? 'light' : 'dark')

  return (
    <ThemeContext.Provider value={{ tema, toggleTema }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTema = () => useContext(ThemeContext)
