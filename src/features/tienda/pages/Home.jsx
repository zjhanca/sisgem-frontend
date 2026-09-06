import { useHome }        from '../hooks/useHome'
import NavbarPublico      from '@shared/components/NavbarPublico'
import Carrusel           from '../components/Carrusel'
import CategoryCarousel   from '../components/CategoryCarousel'
import BannerTriptico     from '../components/BannerTriptico'
import FeaturedProducts   from '../components/FeaturedProducts'
import PromotionalBanners from '../components/PromotionalBanners'
import BrandCarousel      from '../components/BrandCarousel'
import Footer             from '../components/Footer'
import BotonFlotante      from '../components/BotonFlotante'

export default function Home() {
  const { productos, categorias, marcas } = useHome()

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <NavbarPublico />
      <Carrusel />
      <CategoryCarousel categorias={categorias} />
      <BannerTriptico />
      <FeaturedProducts productos={productos} />
      <PromotionalBanners />
      <BrandCarousel marcas={marcas} />
      <Footer />
      <BotonFlotante />
    </div>
  )
}