import { Link } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'

export default function BotonFlotante() {
  return (
    <Link to="/productos"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2
        bg-primary hover:bg-green-700 text-white font-bold
        px-5 py-3 rounded-full shadow-2xl hover:shadow-primary/30
        transition-all duration-300 hover:-translate-y-1 group text-sm">
      <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
      <span className="hidden sm:inline">Ver Productos</span>
    </Link>
  )
}