import { useQuery } from '@tanstack/react-query'
import { tiendaService } from '../services/tiendaService'

export function useHome() {
  const { data: productos = [] } = useQuery({
    queryKey: ['catalogo'],
    queryFn:  () => tiendaService.getCatalogo(),
    refetchInterval: 5000,     // refresca cada 5 segundos
    staleTime: 0,              // siempre considera los datos desactualizados
    refetchOnWindowFocus: true, // recarga al volver a la pestaña
  })
  const { data: categorias = [] } = useQuery({
    queryKey: ['catalogo-cats'],
    queryFn:  tiendaService.getCategorias,
  })
  const { data: marcas = [] } = useQuery({
    queryKey: ['catalogo-marcas'],
    queryFn:  tiendaService.getMarcas,
  })

  return { productos, categorias, marcas }
}