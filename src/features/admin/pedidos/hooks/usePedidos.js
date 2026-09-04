import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pedidosService } from '../services/pedidosService'
import toast from 'react-hot-toast'

export function usePedidos() {
  const qc = useQueryClient()

  const [modalDetalle, setModalDetalle]         = useState({ abierto: false, pedido: null })
  const [modalConfirmarEntrega, setModalConfirmarEntrega] = useState({ abierto: false, pedido: null })
  const [metodoEntrega, setMetodoEntrega]       = useState('efectivo')
  const [filtroEstado, setFiltroEstado]         = useState('')
  const [filtroBusqueda, setFiltroBusqueda]     = useState('')

  const { data: pedidosTodos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn:  pedidosService.getAll,
  })

  const { data: estados = [] } = useQuery({
    queryKey: ['estados-pedido'],
    queryFn:  pedidosService.getEstados,
  })

  // Solo pedidos móviles — excluye los de mostrador web
  const pedidosMovil = pedidosTodos.filter(p => p.origen === 'movil')

  const estadoEntregado = estados.find(e =>
    e.nombre?.toLowerCase().includes('complet') || e.nombre?.toLowerCase().includes('paga')
  )

  const confirmarEntrega = useMutation({
    mutationFn: async ({ pedido, metodo }) => {
      // 1. Cambiar estado a completado
      await pedidosService.cambiarEstado(pedido.id, { estado_id: estadoEntregado?.id })
      // 2. Marcar como entregado
      await pedidosService.marcarEntregado(pedido.id)
      // 3. Registrar pago
      await pedidosService.crearPago({
        pedido_id: pedido.id,
        monto:     pedido.total,
        metodo,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries(['pedidos'])
      setModalConfirmarEntrega({ abierto: false, pedido: null })
      setModalDetalle({ abierto: false, pedido: null })
      toast.success('Pedido marcado como entregado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error al confirmar entrega'),
  })

  const pedidosFiltrados = pedidosMovil.filter(p => {
    const estado = p.estado?.toLowerCase() || ''
    // Filtro por estado seleccionado
    if (filtroEstado === 'pendiente'   && !estado.includes('pendiente'))   return false
    if (filtroEstado === 'entregado'   && !(estado.includes('complet') || estado.includes('paga'))) return false
    if (filtroEstado === 'sin_recoger' && !estado.includes('sin recoger')) return false
    if (filtroEstado === 'anulado'     && !estado.includes('anula'))       return false
    // Búsqueda por # o cliente
    if (filtroBusqueda && !`${p.id} ${p.cliente}`.toLowerCase().includes(filtroBusqueda.toLowerCase())) return false
    return true
  })

  const getColorEstado = estado => {
    const e = (estado || '').toLowerCase()
    if (e.includes('anula'))                          return 'bg-gray-300'
    if (e.includes('sin recoger'))                    return 'bg-orange-500'
    if (e.includes('complet') || e.includes('paga'))  return 'bg-primary'
    return 'bg-amber-500'
  }

  const getLabelEstado = estado => {
    const e = (estado || '').toLowerCase()
    if (e.includes('anula'))                          return 'Anulado'
    if (e.includes('sin recoger'))                    return 'Sin recoger'
    if (e.includes('complet') || e.includes('paga'))  return 'Entregado'
    return 'Pendiente'
  }

  // Contadores por estado
  const contPendiente   = pedidosMovil.filter(p => (p.estado || '').toLowerCase().includes('pendiente')).length
  const contSinRecoger  = pedidosMovil.filter(p => (p.estado || '').toLowerCase().includes('sin recoger')).length

  return {
    pedidosFiltrados, pedidosMovil, estados,
    modalDetalle, setModalDetalle,
    modalConfirmarEntrega, setModalConfirmarEntrega,
    metodoEntrega, setMetodoEntrega,
    filtroEstado, setFiltroEstado,
    filtroBusqueda, setFiltroBusqueda,
    confirmarEntrega,
    confirmando: confirmarEntrega.isPending,
    getColorEstado, getLabelEstado,
    contPendiente, contSinRecoger,
  }
}