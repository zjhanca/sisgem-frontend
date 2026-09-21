import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pedidosService } from '../services/pedidosService'
import toast from 'react-hot-toast'

export function usePedidos() {
  const qc = useQueryClient()
  const pedidosPrevRef = useRef([])

  const [modalDetalle, setModalDetalle]                   = useState({ abierto: false, pedido: null })
  const [modalConfirmarEntrega, setModalConfirmarEntrega] = useState({ abierto: false, pedido: null })
  const [filtroEstado, setFiltroEstado]                   = useState('')
  const [filtroBusqueda, setFiltroBusqueda]               = useState('')

  const { data: pedidosTodos = [] } = useQuery({
    queryKey:        ['pedidos'],
    queryFn:         pedidosService.getAll,
    refetchInterval: 30_000,
    staleTime:       0,
  })

  const { data: estados = [] } = useQuery({
    queryKey: ['estados-pedido'],
    queryFn:  pedidosService.getEstados,
  })

  const pedidosMovil = pedidosTodos.filter(p => p.origen === 'movil')

  // ── Detectar pedidos nuevos y notificar ─────────────────────────
  useEffect(() => {
    const prev    = pedidosPrevRef.current
    const prevIds = new Set(prev.map(p => p.id))

    if (prev.length > 0) {
      const nuevos = pedidosMovil.filter(p => {
        if (prevIds.has(p.id)) return false
        const estado = (p.estado || '').toLowerCase()
        if (!estado.includes('pendiente')) return false
        try {
          const fecha = new Date(p.fecha_pedido)
          const horas = (Date.now() - fecha.getTime()) / (1000 * 60 * 60)
          return horas < 6
        } catch { return false }
      })
      nuevos.forEach(p => {
        toast.success(
          `Nuevo pedido #${p.id} — ${p.cliente || 'Sin nombre'}`,
          { duration: 6000 }
        )
      })
    }

    pedidosPrevRef.current = pedidosMovil
  }, [pedidosMovil])

  const estadoEntregado = estados.find(e =>
    e.nombre?.toLowerCase().includes('complet') || e.nombre?.toLowerCase().includes('paga')
  )

  const confirmarEntrega = useMutation({
    mutationFn: async ({ pedido }) => {
      await pedidosService.cambiarEstado(pedido.id, { estado_id: estadoEntregado?.id })
      await pedidosService.marcarEntregado(pedido.id)

      // Solo registrar pago si NO es a crédito (fiado)
      // Si es fiado, el pago se gestiona desde cartera
      const esCredito = pedido.es_fiado === true || pedido.es_fiado === 'true'
      if (!esCredito) {
        await pedidosService.crearPago({
          pedido_id: pedido.id,
          monto:     pedido.total,
          metodo:    pedido.metodo_pago || 'efectivo',
        })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries(['pedidos'])
      qc.invalidateQueries(['pagos'])
      setModalConfirmarEntrega({ abierto: false, pedido: null })
      setModalDetalle({ abierto: false, pedido: null })
      toast.success('Pedido marcado como entregado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error al confirmar entrega'),
  })

  const pedidosFiltrados = pedidosMovil.filter(p => {
    const estado = p.estado?.toLowerCase() || ''
    if (filtroEstado === 'pendiente'   && !estado.includes('pendiente'))                            return false
    if (filtroEstado === 'entregado'   && !(estado.includes('complet') || estado.includes('paga'))) return false
    if (filtroEstado === 'sin_recoger' && !estado.includes('sin recoger'))                          return false
    if (filtroEstado === 'anulado'     && !estado.includes('anula'))                                return false
    if (filtroBusqueda && !`${p.id} ${p.cliente}`.toLowerCase()
      .includes(filtroBusqueda.toLowerCase())) return false
    return true
  })

  const getColorEstado = estado => {
    const e = (estado || '').toLowerCase()
    if (e.includes('anula'))                         return 'bg-gray-300'
    if (e.includes('sin recoger'))                   return 'bg-orange-500'
    if (e.includes('complet') || e.includes('paga')) return 'bg-primary'
    return 'bg-amber-500'
  }

  const getLabelEstado = estado => {
    const e = (estado || '').toLowerCase()
    if (e.includes('anula'))                         return 'Anulado'
    if (e.includes('sin recoger'))                   return 'Sin recoger'
    if (e.includes('complet') || e.includes('paga')) return 'Entregado'
    return 'Pendiente'
  }

  const contPendiente  = pedidosMovil.filter(p =>
    (p.estado || '').toLowerCase().includes('pendiente')).length
  const contSinRecoger = pedidosMovil.filter(p =>
    (p.estado || '').toLowerCase().includes('sin recoger')).length

  return {
    pedidosFiltrados, pedidosMovil, estados,
    modalDetalle, setModalDetalle,
    modalConfirmarEntrega, setModalConfirmarEntrega,
    filtroEstado, setFiltroEstado,
    filtroBusqueda, setFiltroBusqueda,
    confirmarEntrega,
    confirmando: confirmarEntrega.isPending,
    getColorEstado, getLabelEstado,
    contPendiente, contSinRecoger,
  }
}