import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { domiciliosService } from '../services/domiciliosService'
import toast from 'react-hot-toast'
 
const tarifaVacia = { barrio: '', zona: '', tarifa: '', distancia_km: '' }
 
const ESTADOS_DOM = [
  { key: 'pendiente', label: 'Pendiente', color: 'yellow' },
  { key: 'entregado', label: 'Entregado', color: 'green'  },
  { key: 'anulado',   label: 'Anulado',   color: 'red'    },
]
 
export function useDomicilios() {
  const qc = useQueryClient()
  const [filtroDom, setFiltroDom]     = useState('')
  const [formTarifa, setFormTarifa]   = useState(tarifaVacia)
  const [modalEliminarTarifa, setModalEliminarTarifa] = useState({ abierto: false, item: null })
 
  const { data: domicilios = [] } = useQuery({ queryKey: ['domicilios'], queryFn: domiciliosService.getAll })
  const { data: tarifas = [], refetch: refetchTarifas } = useQuery({ queryKey: ['tarifas'], queryFn: domiciliosService.getTarifas })
  const { data: estadosDom = [] } = useQuery({ queryKey: ['estados-dom'], queryFn: domiciliosService.getEstados })
 
  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado_id }) => domiciliosService.cambiarEstado(id, { estado_id }),
    onSuccess: () => { qc.invalidateQueries(['domicilios']); toast.success('Estado actualizado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'No permitido'),
  })
 
  const guardarTarifa = useMutation({
    mutationFn: domiciliosService.crearTarifa,
    onSuccess: () => { refetchTarifas(); setFormTarifa(tarifaVacia); toast.success('Tarifa guardada') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })
 
  const eliminarTarifa = useMutation({
    mutationFn: domiciliosService.eliminarTarifa,
    onSuccess: () => { refetchTarifas(); setModalEliminarTarifa({ abierto: false, item: null }); toast.success('Tarifa eliminada') },
    onError: err => toast.error(err.response?.data?.mensaje || 'No se puede eliminar'),
  })
 
  const getKeyEstado = nombre => {
    if (!nombre) return 'pendiente'
    const n = nombre.toLowerCase()
    if (n.includes('entrega') || n.includes('complet')) return 'entregado'
    if (n.includes('anula')  || n.includes('cancel'))   return 'anulado'
    return 'pendiente'
  }
 
  const getEstadoId = key => {
    const mapa = { pendiente: ['pendiente'], entregado: ['entregado','complet'], anulado: ['anulado','cancel'] }
    return estadosDom.find(e => mapa[key]?.some(k => e.nombre?.toLowerCase().includes(k)))?.id
  }
 
  const domFiltrados = domicilios.filter(d => !filtroDom || getKeyEstado(d.estado) === filtroDom)
 
  const handleGuardarTarifa = () => {
    if (!formTarifa.barrio.trim()) { toast.error('El barrio es obligatorio'); return }
    if (!formTarifa.tarifa || +formTarifa.tarifa <= 0) { toast.error('Ingresa una tarifa válida'); return }
    guardarTarifa.mutate(formTarifa)
  }
 
  return {
    domicilios, domFiltrados, tarifas, estadosDom,
    filtroDom, setFiltroDom,
    formTarifa, setFormTarifa,
    modalEliminarTarifa, setModalEliminarTarifa,
    cambiarEstado, guardarTarifa, eliminarTarifa,
    getKeyEstado, getEstadoId, ESTADOS_DOM,
    handleGuardarTarifa,
    guardandoTarifa: guardarTarifa.isPending,
    eliminandoTarifa: eliminarTarifa.isPending,
  }
}
