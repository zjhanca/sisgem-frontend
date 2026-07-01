import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/contexts/AuthContext'
import { tiendaService } from '../services/tiendaService'
import toast from 'react-hot-toast'

const passVacio = { actual: '', nueva: '', confirmar: '' }

export function usePanelCliente(setErrorActual) {
  const { usuario, logout } = useAuth()
  const navigate            = useNavigate()
  const qc                  = useQueryClient()

  const [tab, setTab]             = useState('actividad')
  const [modalPass, setModalPass] = useState(false)
  const [formPass, setFormPass]   = useState(passVacio)
  const [cambiandoPass, setCambiandoPass] = useState(false)

  const { data: clienteData } = useQuery({
    queryKey: ['mi-perfil'],
    queryFn:  () => tiendaService.getClientes().then(todos =>
      todos.find(c => c.email === usuario?.email) || null
    ),
    enabled: !!usuario,
  })
  const cliente_id = clienteData?.id

  const { data: pedidos = [], isLoading: loadPedidos } = useQuery({
    queryKey: ['mis-pedidos', cliente_id],
    queryFn:  () => tiendaService.getPedidosByCliente(cliente_id),
    enabled:  !!cliente_id,
  })
  const { data: abonos = [] } = useQuery({
    queryKey: ['mis-abonos'],
    queryFn:  tiendaService.getAbonos,
    enabled:  !!cliente_id,
  })

  const handleCambiarPass = async () => {
    if (!formPass.actual || !formPass.nueva || !formPass.confirmar) {
      toast.error('Completa todos los campos'); return
    }
    if (formPass.nueva !== formPass.confirmar) {
      toast.error('Las contraseñas nuevas no coinciden'); return
    }
    if (formPass.nueva.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres'); return
    }
    if (!/[A-Z]/.test(formPass.nueva)) {
      toast.error('La nueva contraseña debe tener al menos una mayúscula'); return
    }
    if (!/[0-9]/.test(formPass.nueva)) {
      toast.error('La nueva contraseña debe tener al menos un número'); return
    }
    setCambiandoPass(true)
    try {
      await tiendaService.cambiarPassword({ actual: formPass.actual, nueva: formPass.nueva })
      toast.success('Contraseña actualizada correctamente')
      setModalPass(false)
      setFormPass(passVacio)
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Contraseña actual incorrecta'
      if (msg.toLowerCase().includes('actual') || msg.toLowerCase().includes('incorrecta')) {
        if (setErrorActual) setErrorActual(msg)
        else toast.error(msg)
      } else {
        toast.error(msg)
      }
    } finally {
      setCambiandoPass(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const getBadge = nombre => {
    if (!nombre) return 'badge-pendiente'
    const n = nombre.toLowerCase()
    if (n.includes('anula'))                          return 'badge-anulado'
    if (n.includes('entrega') || n.includes('paga')) return 'badge-activo'
    if (n.includes('proceso'))                        return 'badge-proceso'
    return 'badge-pendiente'
  }

  const pedidoIds = pedidos.map(p => p.id)
  const misAbonos = abonos.filter(a => pedidoIds.includes(a.pedido_id))

  return {
    usuario, clienteData, pedidos, misAbonos, loadPedidos,
    tab, setTab,
    modalPass, setModalPass, formPass, setFormPass, cambiandoPass, handleCambiarPass,
    handleLogout, getBadge,
  }
}