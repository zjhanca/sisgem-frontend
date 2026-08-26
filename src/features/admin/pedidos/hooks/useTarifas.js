import { useQuery, useMutation } from '@tanstack/react-query'
import { pedidosService } from '../services/pedidosService'
import toast from 'react-hot-toast'
import { useState } from 'react'

const tarifaVacia = { barrio: '', zona: '', tarifa: '', distancia_km: '' }

export function useTarifas() {
  const [formTarifa, setFormTarifa]         = useState(tarifaVacia)
  const [modalElimTarifa, setModalElimTarifa] = useState({ abierto: false, item: null })

  const { data: tarifas = [], refetch: refetchTarifas } = useQuery({
    queryKey: ['tarifas'],
    queryFn:  pedidosService.getTarifas,
  })

  const guardarTarifa = useMutation({
    mutationFn: pedidosService.crearTarifa,
    onSuccess: () => {
      refetchTarifas()
      setFormTarifa(tarifaVacia)
      toast.success('Tarifa guardada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })

  const eliminarTarifa = useMutation({
    mutationFn: pedidosService.eliminarTarifa,
    onSuccess: () => {
      refetchTarifas()
      setModalElimTarifa({ abierto: false, item: null })
      toast.success('Tarifa eliminada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'No se puede eliminar'),
  })

  const handleGuardarTarifa = () => {
    if (!formTarifa.barrio.trim()) { toast.error('El barrio es obligatorio'); return }
    if (!formTarifa.tarifa || +formTarifa.tarifa <= 0) { toast.error('Ingresa una tarifa válida'); return }
    guardarTarifa.mutate(formTarifa)
  }

  return {
    tarifas,
    formTarifa, setFormTarifa,
    modalElimTarifa, setModalElimTarifa,
    handleGuardarTarifa,
    guardarTarifa, eliminarTarifa,
    guardandoTarifa:  guardarTarifa.isPending,
    eliminandoTarifa: eliminarTarifa.isPending,
  }
}