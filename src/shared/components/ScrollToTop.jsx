import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// reinicia el scroll al tope de la página en cada navegación, incluyendo
// cambios de query params (ej. clic en distintas categorías/marcas desde
// /productos, que no cambian el pathname pero sí el contenido mostrado)
export default function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])

  return null
}