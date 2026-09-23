// useHome.js
import { useQuery } from '@tanstack/react-query'
import { tiendaService } from '../services/tiendaService'

export function useHome() {
  const { data: productos = [] } = useQuery({
    queryKey: ['catalogo'],
    queryFn:  () => tiendaService.getCatalogo(),
    refetchInterval: 5000,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
  const { data: categorias = [] } = useQuery({
    queryKey: ['catalogo-cats'],
    queryFn:  tiendaService.getCategorias,
  })
  const { data: marcasRaw = [] } = useQuery({
    queryKey: ['catalogo-marcas'],
    queryFn:  tiendaService.getMarcas,
  })

  const marcas = marcasRaw.filter(m => m.estado !== false)

  return { productos, categorias, marcas }
}