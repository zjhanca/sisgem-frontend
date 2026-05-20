import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/contexts/AuthContext'
import { tiendaService } from '../services/tiendaService'
import toast from 'react-hot-toast'
 
const dirVacia = { direccion: '', barrio: '', indicaciones: '' }
 
export function usePanelCliente() {
  const { usuario, logout } = useAuth()
  const navigate            = useNavigate()
  const qc                  = useQueryClient()
 
  const [tab, setTab]               = useState('pedidos')
  const [modalAbono, setModalAbono] = useState({ abierto: false, pedido: null })
  const [modalDir, setModalDir]     = useState(false)
  const [formAbono, setFormAbono]   = useState({ monto: '', metodo: 'efectivo' })
  const [formDir, setFormDir]       = useState(dirVacia)
 
  // buscar cliente vinculado al usuario por email
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
  const { data: direcciones = [], refetch: refetchDirs } = useQuery({
    queryKey: ['mis-dirs', cliente_id],
    queryFn:  () => tiendaService.getDirecciones(cliente_id),
    enabled:  !!cliente_id,
  })
 
  const crearAbono = useMutation({
    mutationFn: tiendaService.crearAbono,
    onSuccess: () => {
      qc.invalidateQueries(['mis-abonos'])
      setModalAbono({ abierto: false, pedido: null })
      setFormAbono({ monto: '', metodo: 'efectivo' })
      toast.success('Abono registrado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })
 
  const crearDir = useMutation({
    mutationFn: data => tiendaService.crearDireccion(cliente_id, data),
    onSuccess: () => {
      refetchDirs()
      setModalDir(false)
      setFormDir(dirVacia)
      toast.success('Dirección guardada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })
 
  const handleLogout = () => { logout(); navigate('/login') }
 
  const getBadge = nombre => {
    if (!nombre) return 'badge-pendiente'
    const n = nombre.toLowerCase()
    if (n.includes('anula'))   return 'badge-anulado'
    if (n.includes('entrega') || n.includes('paga')) return 'badge-activo'
    if (n.includes('proceso')) return 'badge-proceso'
    return 'badge-pendiente'
  }
 
  const pedidoIds = pedidos.map(p => p.id)
  const misAbonos = abonos.filter(a => pedidoIds.includes(a.pedido_id))
 
  return {
    usuario, clienteData, pedidos, misAbonos, direcciones, loadPedidos,
    tab, setTab,
    modalAbono, setModalAbono, formAbono, setFormAbono,
    modalDir, setModalDir, formDir, setFormDir,
    crearAbono, crearDir,
    handleLogout, getBadge,
  }
}
 
