import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { tiendaService } from '../services/tiendaService'

export function useProductoDetalle() {
  const { id } = useParams()

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['catalogo'],
    queryFn: () => tiendaService.getCatalogo(),
  })

  const producto = productos.find(p => p.id === +id) || null

  return { producto, isLoading }
}