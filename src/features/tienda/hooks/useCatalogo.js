import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import { tiendaService } from '../services/tiendaService'
 
export function useCatalogo() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [busqueda, setBusqueda]         = useState('')
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
 
  const categoriaFiltro = searchParams.get('categoria') || ''
  const marcaFiltro     = searchParams.get('marca')     || ''
  const hayFiltros      = categoriaFiltro || marcaFiltro || busqueda
 
  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['catalogo', categoriaFiltro, marcaFiltro, busqueda],
    queryFn: () => {
      const params = new URLSearchParams()
      if (categoriaFiltro) params.append('categoria_id', categoriaFiltro)
      if (marcaFiltro)     params.append('marca_id', marcaFiltro)
      if (busqueda)        params.append('busqueda', busqueda)
      return tiendaService.getCatalogo(Object.fromEntries(params))
    },
  })
  const { data: categorias = [] } = useQuery({ queryKey: ['catalogo-cats'],   queryFn: tiendaService.getCategorias })
  const { data: marcas = [] }     = useQuery({ queryKey: ['catalogo-marcas'], queryFn: tiendaService.getMarcas })
 
 
  const limpiarFiltros = () => { setSearchParams({}); setBusqueda('') }
 
  const setCategoria = val => setSearchParams(prev => {
    const p = new URLSearchParams(prev)
    val ? p.set('categoria', val) : p.delete('categoria')
    return p
  })
  const setMarca = val => setSearchParams(prev => {
    const p = new URLSearchParams(prev)
    val ? p.set('marca', val) : p.delete('marca')
    return p
  })
 
  return {
    productos, categorias, marcas, isLoading,
    busqueda, setBusqueda, mostrarFiltros, setMostrarFiltros,
    categoriaFiltro, marcaFiltro, hayFiltros,
    limpiarFiltros, setCategoria, setMarca,
  }
}