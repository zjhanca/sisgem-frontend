import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../services/api'
import { ShoppingCart, Moon, Sun } from 'lucide-react'
import { useTema } from '../context/ThemeContext'

export default function Catalogo() {
  const { tema, toggleTema } = useTema()
  const [carrito, setCarrito] = useState(
    JSON.parse(localStorage.getItem('sisgem_carrito') || '[]')
  )

  const { data: items = [] } = useQuery({
    queryKey: ['catalogo'],
    queryFn: () => api.get('/catalogo').then(r => r.data.datos)
  })

  const agregarAlCarrito = producto => {
    const nuevo = [...carrito]
    const idx = nuevo.findIndex(p => p.id === producto.id)
    if (idx > -1) nuevo[idx].cantidad++
    else nuevo.push({ ...producto, cantidad: 1 })
    setCarrito(nuevo)
    localStorage.setItem('sisgem_carrito', JSON.stringify(nuevo))
  }

  return (
    <div className='min-h-screen bg-light-bg dark:bg-dark-bg'>
      <nav className='sticky top-0 z-10 bg-light-card dark:bg-dark-card
        border-b border-dark-border px-4 py-3 flex items-center justify-between'>
        <span className='font-bold text-primary'>sisgem</span>
        <div className='flex items-center gap-3'>
          <button onClick={toggleTema} className='btn-ghost'>
            {tema === 'dark' ? <Sun size={16}/> : <Moon size={16}/>}
          </button>
          <Link to='/carrito' className='relative btn-ghost'>
            <ShoppingCart size={18}/>
            {carrito.length > 0 && (
              <span className='absolute -top-1 -right-1 w-4 h-4 bg-primary
                text-dark-bg text-xs rounded-full flex items-center justify-center'>
                {carrito.reduce((s, p) => s + p.cantidad, 0)}
              </span>
            )}
          </Link>
          <Link to='/login' className='text-xs text-dark-text/60 hover:text-primary'>
            ingresar
          </Link>
        </div>
      </nav>

      <div className='max-w-5xl mx-auto px-4 py-6'>
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
          {items.map(item => (
            <div key={item.id} className='bg-light-card dark:bg-dark-card
              rounded-xl border border-dark-border overflow-hidden group'>
              {item.imagen && (
                <img src={item.imagen} alt={item.nombre}
                  className='w-full h-36 object-cover' />
              )}
              <div className='p-3'>
                <p className='text-sm font-medium text-light-text dark:text-dark-text
                  line-clamp-1'>{item.nombre}</p>
                <p className='text-xs text-light-text/60 dark:text-dark-text/60 mt-0.5
                  line-clamp-2 mb-2'>{item.descripcion}</p>
                <div className='flex items-center justify-between'>
                  <span className='text-primary font-medium text-sm'>
                    ${parseFloat(item.precio).toLocaleString('es-CO')}
                  </span>
                  <button onClick={() => agregarAlCarrito(item)}
                    className='text-xs px-2 py-1 bg-primary text-dark-bg rounded-lg
                      hover:bg-primary-mid transition-colors'>
                    agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
