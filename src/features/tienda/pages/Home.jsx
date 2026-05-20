import { useHome } from '../hooks/useHome'
import NavbarPublico     from '@shared/components/NavbarPublico'
import Carrusel           from '../Components/Carrusel'
import CategoryCarousel   from '../Components/CategoryCarousel'
import FeaturedProducts   from '../Components/FeaturedProducts'
import PromotionalBanners from '../Components/PromotionalBanners'
import BrandCarousel      from '../Components/BrandCarousel'
import Footer             from '../Components/Footer'
 
export default function Home({ carrito, setCarrito }) {
  const { productos, categorias, marcas, busqueda, setBusqueda, agregarAlCarrito } = useHome({ setCarrito })
 
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <NavbarPublico carrito={carrito} busqueda={busqueda} setBusqueda={setBusqueda} />
 
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-10">
        <Carrusel />
        <CategoryCarousel categorias={categorias} />
        <FeaturedProducts
          productos={productos}
          busqueda={busqueda}
          setBusqueda={setBusqueda}
          agregarAlCarrito={agregarAlCarrito}
        />
        <PromotionalBanners />
        <BrandCarousel marcas={marcas} />
      </main>
 
      <Footer />
    </div>
  )
}
