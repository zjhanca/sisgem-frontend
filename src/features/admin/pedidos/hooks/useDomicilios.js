import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pedidosService } from '../services/pedidosService'
import toast from 'react-hot-toast'
import { useState } from 'react'

export const ESTADOS_DOM = [
  { key: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { key: 'entregado', label: 'Entregado', color: 'green'  },
  { key: 'anulado',   label: 'Anulado',   color: 'red'    },
]

export function useDomicilios({ modalDetallePedidoId, clienteDetallId }) {
  const qc = useQueryClient()
  const [filtroDom, setFiltroDom]           = useState('')
  const [formDomDetalle, setFormDomDetalle] = useState({
    tipo_dir: 'manual', direccion_id: '', direccion_manual: '', tarifa_id: ''
  })

  const { data: domicilios = [] } = useQuery({ queryKey: ['domicilios'], queryFn: pedidosService.getDomicilios })
  const { data: estadosDom = [] } = useQuery({ queryKey: ['estados-dom'], queryFn: pedidosService.getEstadosDom })
  const { data: domDetalle }      = useQuery({
    queryKey: ['dom-pedido', modalDetallePedidoId],
    queryFn:  () => pedidosService.getDomPedido(modalDetallePedidoId),
    enabled:  !!modalDetallePedidoId,
  })
  const { data: dirsDetalle = [] } = useQuery({
    queryKey: ['dirs-detalle', clienteDetallId],
    queryFn:  () => pedidosService.getDirs(clienteDetallId),
    enabled:  !!clienteDetallId,
  })

  const getKeyEstadoDom = nombre => {
    if (!nombre) return 'pendiente'
    const n = nombre.toLowerCase()
    if (n.includes('entrega') || n.includes('complet')) return 'entregado'
    if (n.includes('anula')   || n.includes('cancel'))  return 'anulado'
    return 'pendiente'
  }

  const getEstadoDomId = key => {
    const mapa = { pendiente: ['pendiente'], entregado: ['entregado','complet'], anulado: ['anulado','cancel'] }
    return estadosDom.find(e => mapa[key]?.some(k => e.nombre?.toLowerCase().includes(k)))?.id
  }

  const domFiltrados = domicilios.filter(d => !filtroDom || getKeyEstadoDom(d.estado) === filtroDom)

  const cambiarEstadoDom = useMutation({
    mutationFn: ({ id, estado_id }) => pedidosService.cambiarEstadoDom(id, { estado_id }),
    onSuccess: () => {
      qc.invalidateQueries(['domicilios'])
      qc.invalidateQueries(['dom-pedido', modalDetallePedidoId])
      toast.success('Estado del domicilio actualizado')
    },
  })

  const asignarDomicilio = useMutation({
    mutationFn: pedidosService.crearDomicilio,
    onSuccess: () => {
      qc.invalidateQueries(['dom-pedido', modalDetallePedidoId])
      qc.invalidateQueries(['domicilios'])
      toast.success('Domicilio asignado')
    },
  })

  const handleAsignarDomDetalle = (pedidoId, tarifas) => {
    if (formDomDetalle.tipo_dir === 'manual' && !formDomDetalle.direccion_manual.trim()) { toast.error('Ingresa la dirección'); return }
    if (formDomDetalle.tipo_dir === 'registrada' && !formDomDetalle.direccion_id) { toast.error('Selecciona una dirección'); return }
    const tarifa = tarifas.find(t => t.id === +formDomDetalle.tarifa_id)
    asignarDomicilio.mutate({
      pedido_id:        pedidoId,
      direccion_id:     formDomDetalle.tipo_dir === 'registrada' ? +formDomDetalle.direccion_id : null,
      direccion_manual: formDomDetalle.tipo_dir === 'manual' ? formDomDetalle.direccion_manual : null,
      tarifa_id:        formDomDetalle.tarifa_id ? +formDomDetalle.tarifa_id : null,
      tarifa_aplicada:  tarifa?.tarifa || 0,
    })
  }

  return {
    domicilios, domFiltrados, estadosDom, domDetalle, dirsDetalle,
    filtroDom, setFiltroDom,
    formDomDetalle, setFormDomDetalle, handleAsignarDomDetalle,
    cambiarEstadoDom, asignarDomicilio,
    getKeyEstadoDom, getEstadoDomId, ESTADOS_DOM,
    asignando: asignarDomicilio.isPending,
  }
}