import { useHome } from '../hooks/useHome'
import NavbarPublico      from '@shared/components/NavbarPublico'
import Carrusel           from '../components/Carrusel'
import CategoryCarousel   from '../components/CategoryCarousel'
import FeaturedProducts   from '../components/FeaturedProducts'
import PromotionalBanners from '../components/PromotionalBanners'
import BrandCarousel      from '../components/BrandCarousel'
import Footer             from '../components/Footer'

export default function Home() {
  const { productos, categorias, marcas } = useHome()

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <NavbarPublico />

      <Carrusel />

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10">
        <CategoryCarousel categorias={categorias} />
        <FeaturedProducts productos={productos} />
        <PromotionalBanners />
        <BrandCarousel marcas={marcas} />
      </main>

      <Footer />
    </div>
  )
}