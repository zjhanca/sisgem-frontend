import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pagosService } from '../services/pagosService'
import toast from 'react-hot-toast'
 
const formVacio = { pedido_id: '', monto: '', metodo: 'efectivo' }
 
export function usePagos() {
  const qc = useQueryClient()
  const [modalNuevo, setModalNuevo]     = useState(false)
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, pago: null })
  const [modalAnular, setModalAnular]   = useState({ abierto: false, pago: null })
  const [form, setForm]       = useState(formVacio)
  const [errores, setErrores] = useState({})
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroDesde, setFiltroDesde]   = useState('')
  const [filtroHasta, setFiltroHasta]   = useState('')
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
 
  const { data: pagos = [] }   = useQuery({ queryKey: ['pagos'],   queryFn: pagosService.getAll })
  const { data: pedidos = [] } = useQuery({ queryKey: ['pedidos'], queryFn: () => pagosService.getPedidos().then(d => d.filter(p => !p.estado?.toLowerCase().includes('anula'))) })
 
  const pagadoPorPedido = pedidos.reduce((acc, p) => {
    const activos = pagos.filter(pg => pg.pedido_id === p.id && !pg.estado?.toLowerCase().includes('anula'))
    acc[p.id] = activos.reduce((s, pg) => s + +pg.monto, 0)
    return acc
  }, {})
 
  const pedidoSel      = pedidos.find(p => p.id === +form.pedido_id)
  const totalPedido    = pedidoSel?.total || 0
  const totalPagado    = pagadoPorPedido[+form.pedido_id] || 0
  const montoPendiente = Math.max(0, totalPedido - totalPagado)
  const pagoCompleto   = totalPedido > 0 && montoPendiente === 0
 
  // intenta varios nombres de campo de fecha que pueda devolver el backend
  const getFechaPago = p => p.fecha_pago || p.fecha || p.created_at || null
 
  const crear = useMutation({
    mutationFn: pagosService.create,
    onSuccess: () => { qc.invalidateQueries(['pagos']); qc.invalidateQueries(['pedidos']); setModalNuevo(false); setForm(formVacio); toast.success('Pago registrado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })
  const anular = useMutation({
    mutationFn: pagosService.anular,
    onSuccess: () => { qc.invalidateQueries(['pagos']); setModalAnular({ abierto: false, pago: null }); toast.success('Pago anulado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })
 
  const validar = () => {
    const e = {}
    if (!form.pedido_id)                 e.pedido_id = 'Selecciona un pedido'
    if (!form.monto || +form.monto <= 0) e.monto     = 'Monto inválido'
    if (pagoCompleto)                    e.monto     = 'El pedido ya está completamente pagado'
    return e
  }
  const handleSubmit = e => {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length) { setErrores(e2); return }
    crear.mutate(form)
  }
 
  const esPagado  = n => n && (n.toLowerCase().includes('paga') || n.toLowerCase().includes('activ') || n.toLowerCase().includes('complet'))
  const esAnulado = n => n && (n.toLowerCase().includes('anula') || n.toLowerCase().includes('cancel'))
 
  const pagosFiltrados = pagos.filter(p => {
    if (filtroEstado === 'pagado'  && !esPagado(p.estado))  return false
    if (filtroEstado === 'anulado' && !esAnulado(p.estado)) return false
    if (filtroBusqueda && !`${p.id} ${p.cliente || ''}`.toLowerCase().includes(filtroBusqueda.toLowerCase())) return false
    const fecha = getFechaPago(p)
    if (filtroDesde && fecha && new Date(fecha) < new Date(filtroDesde))                return false
    if (filtroHasta && fecha && new Date(fecha) > new Date(filtroHasta)) return false
    return true
  })
 
  return {
    pagosFiltrados, pedidos, form, errores,
    modalNuevo, modalDetalle, modalAnular,
    setModalNuevo, setModalDetalle, setModalAnular,
    setForm, filtroEstado, setFiltroEstado,
    filtroDesde, setFiltroDesde,
    filtroHasta, setFiltroHasta,
    filtroBusqueda, setFiltroBusqueda,
    totalPedido, totalPagado, montoPendiente, pagoCompleto,
    handleSubmit, anular, esPagado, esAnulado, getFechaPago,
    creando: crear.isPending, anulando: anular.isPending,
  }
}
