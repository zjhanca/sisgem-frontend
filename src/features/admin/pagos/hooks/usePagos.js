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
  const [pedidoBusqueda, setPedidoBusqueda] = useState('')
  const [pedidoDropdown, setPedidoDropdown] = useState(false)

  const { data: pagos = [] }   = useQuery({ queryKey: ['pagos'],   queryFn: pagosService.getAll })
  const { data: todosLosPedidos = [] } = useQuery({ queryKey: ['pedidos'], queryFn: pagosService.getPedidos })

  // solo pedidos con saldo pendiente (fiados o abonos parciales) — excluir completados y anulados
  const pagadoPorPedidoCalc = (pedidosList, pagosList) =>
    pedidosList.reduce((acc, p) => {
      const activos = pagosList.filter(pg => pg.pedido_id === p.id && !esAnulado(pg.estado))
      acc[p.id] = activos.reduce((s, pg) => s + +pg.monto, 0)
      return acc
    }, {})

  const pedidos = todosLosPedidos.filter(p => {
    const estadoNom = p.estado?.toLowerCase() || ''
    if (estadoNom.includes('anula')) return false
    if (estadoNom.includes('complet') || estadoNom.includes('paga')) return false
    return true
  })

  const pagadoPorPedido = pagadoPorPedidoCalc(todosLosPedidos, pagos)

  const pedidoSel      = pedidos.find(p => p.id === +form.pedido_id)
  const esFiado        = !!pedidoSel?.permite_fiado
  const totalPedido    = pedidoSel?.total || 0
  const totalPagado    = pagadoPorPedido[+form.pedido_id] || 0
  const montoPendiente = Math.max(0, totalPedido - totalPagado)
  const pagoCompleto   = totalPedido > 0 && montoPendiente === 0

  const getFechaPago = p => p.fecha_pago || p.fecha || p.created_at || null

  const crear = useMutation({
    mutationFn: data => pagosService.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['pagos']); qc.invalidateQueries(['pedidos'])
      setModalNuevo(false); setForm(formVacio); setPedidoBusqueda('')
      toast.success('Pago registrado')
    },
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
    if (!esFiado && +form.monto > montoPendiente) e.monto = `El monto no puede superar ${montoPendiente.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}`
    if (pagoCompleto)                    e.monto     = 'El pedido ya está completamente pagado'
    return e
  }
  const handleSubmit = e => {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length) { setErrores(e2); return }
    crear.mutate(form)
  }

  function esPagado(n)  { return n && (n.toLowerCase().includes('paga') || n.toLowerCase().includes('activ') || n.toLowerCase().includes('complet')) }
  function esAbono(n)   { return n && n.toLowerCase().includes('abono') }
  function esAnulado(n) { return n && (n.toLowerCase().includes('anula') || n.toLowerCase().includes('cancel')) }

  const getEstadoPago = (estado) => {
    if (!estado) return { label: 'Pagado', clase: 'badge-activo' }
    if (esAnulado(estado)) return { label: 'Anulado', clase: 'badge-anulado' }
    if (esAbono(estado))   return { label: 'Abono',   clase: 'badge-pendiente' }
    return { label: 'Pagado', clase: 'badge-activo' }
  }

  const pagosFiltrados = pagos.filter(p => {
    if (filtroEstado === 'pagado'  && !esPagado(p.estado))  return false
    if (filtroEstado === 'abono'   && !esAbono(p.estado))   return false
    if (filtroEstado === 'anulado' && !esAnulado(p.estado)) return false
    if (filtroBusqueda && !`${p.id} ${p.cliente || ''}`.toLowerCase().includes(filtroBusqueda.toLowerCase())) return false
    const fecha = getFechaPago(p)
    if (filtroDesde && fecha && new Date(fecha) < new Date(filtroDesde)) return false
    if (filtroHasta && fecha && new Date(fecha) > new Date(filtroHasta)) return false
    return true
  })

  const tipoPagoActual = form.monto && +form.monto > 0
    ? (+form.monto >= montoPendiente ? 'total' : 'abono')
    : null

  return {
    pagosFiltrados, pedidos, form, errores,
    modalNuevo, modalDetalle, modalAnular,
    setModalNuevo, setModalDetalle, setModalAnular,
    setForm, filtroEstado, setFiltroEstado,
    filtroDesde, setFiltroDesde,
    filtroHasta, setFiltroHasta,
    filtroBusqueda, setFiltroBusqueda,
    totalPedido, totalPagado, montoPendiente, pagoCompleto, esFiado,
    handleSubmit, anular, esPagado, esAbono, esAnulado, getFechaPago,
    pedidoBusqueda, setPedidoBusqueda, pedidoDropdown, setPedidoDropdown,
    getEstadoPago, tipoPagoActual,
    creando: crear.isPending, anulando: anular.isPending,
  }
}