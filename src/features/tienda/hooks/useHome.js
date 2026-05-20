import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { tiendaService } from '../services/tiendaService'
 
export function useHome({ setCarrito }) {
  const [busqueda, setBusqueda] = useState('')
 
  const { data: productos = [] } = useQuery({
    queryKey: ['catalogo'],
    queryFn:  () => tiendaService.getCatalogo(),
  })
  const { data: categorias = [] } = useQuery({
    queryKey: ['catalogo-cats'],
    queryFn:  tiendaService.getCategorias,
  })
  const { data: marcas = [] } = useQuery({
    queryKey: ['catalogo-marcas'],
    queryFn:  tiendaService.getMarcas,
  })
 
  const agregarAlCarrito = prod => {
    setCarrito(prev => {
      const existe = prev.find(p => p.id === prod.id)
      if (existe) return prev.map(p => p.id === prod.id ? { ...p, cantidad: p.cantidad + 1 } : p)
      return [...prev, { ...prod, cantidad: 1 }]
    })
  }
 
  return { productos, categorias, marcas, busqueda, setBusqueda, agregarAlCarrito }
}
 
