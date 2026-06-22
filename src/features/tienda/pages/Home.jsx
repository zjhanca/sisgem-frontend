import { useHome }          from '../hooks/useHome'
import { useAuth }          from '@shared/contexts/AuthContext'
import { Link }             from 'react-router-dom'
import { ShoppingBag, User } from 'lucide-react'
import NavbarPublico        from '@shared/components/NavbarPublico'
import Carrusel             from '../components/Carrusel'
import CategoryCarousel     from '../components/CategoryCarousel'
import FeaturedProducts     from '../components/FeaturedProducts'
import PromotionalBanners   from '../components/PromotionalBanners'
import BrandCarousel        from '../components/BrandCarousel'
import Footer               from '../components/Footer'

function BienvenidaBanner({ usuario }) {
  const nombre = usuario?.nombre || 'Cliente'
  const inicial = nombre.charAt(0).toUpperCase()

  return (
    <div className="bg-light-card dark:bg-dark-card border-b border-gray-100 dark:border-dark-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center
            text-white text-sm font-bold shrink-0">
            {inicial}
          </div>
          <div>
            <p className="text-xs text-gray-400 leading-none mb-0.5">Bienvenido de nuevo</p>
            <p className="text-sm font-semibold text-light-text dark:text-dark-text leading-none">
              {nombre}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/perfil"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary
              text-xs font-medium hover:bg-primary/20 transition-colors">
            <User size={12} /> Mi Panel
          </Link>
          <Link to="/productos"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white
              text-xs font-medium hover:bg-primary/90 transition-colors">
            <ShoppingBag size={12} /> Ver Productos
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const { productos, categorias, marcas } = useHome()
  const { usuario } = useAuth()

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <NavbarPublico />

      {usuario && <BienvenidaBanner usuario={usuario} />}

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