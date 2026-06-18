import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pagosService } from '../services/pagosService'
import toast from 'react-hot-toast'

const formVacio = { pedido_id: '', monto: '', metodo: 'efectivo' }

function esPagado(n)  { return n && (n.toLowerCase().includes('paga') || n.toLowerCase().includes('activ') || n.toLowerCase().includes('complet')) }
function esAbono(n)   { return n && n.toLowerCase().includes('abono') }
function esAnulado(n) { return n && (n.toLowerCase().includes('anula') || n.toLowerCase().includes('cancel')) }

export function usePagos() {
  const qc = useQueryClient()
  const [modalNuevo, setModalNuevo]     = useState(false)
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, pedido_id: null }) // ahora es el historial por venta
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

  const getFechaPago = p => p.fecha_pago || p.fecha || p.created_at || null

  // solo pedidos con saldo pendiente (fiados o abonos parciales) — excluir completados y anulados,
  // se usa para el selector del formulario "Nuevo Pago"
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

  // ===========================================================
  // AGRUPACIÓN "estilo distinct": una fila por venta (pedido_id),
  // con el total acumulado de pagos activos, saldo pendiente,
  // y la fecha del último movimiento. Los pagos anulados no
  // cuentan en el total pero sí quedan disponibles en el detalle.
  // ===========================================================
  const pagosAgrupados = useMemo(() => {
    const grupos = new Map()

    for (const pago of pagos) {
      const key = pago.pedido_id
      if (!grupos.has(key)) {
        grupos.set(key, {
          pedido_id: key,
          cliente: pago.cliente || '—',
          total_pedido: +pago.total_pedido || 0,
          pagos: [],
          total_pagado: 0,
          ultima_fecha: null,
        })
      }
      const grupo = grupos.get(key)
      grupo.pagos.push(pago)

      if (!esAnulado(pago.estado)) {
        grupo.total_pagado += +pago.monto
      }

      const fechaPago = getFechaPago(pago)
      if (fechaPago && (!grupo.ultima_fecha || new Date(fechaPago) > new Date(grupo.ultima_fecha))) {
        grupo.ultima_fecha = fechaPago
      }
    }

    return Array.from(grupos.values()).map(g => {
      const saldoPendiente = Math.max(0, g.total_pedido - g.total_pagado)
      const completo = g.total_pedido > 0 && saldoPendiente === 0
      // ordenar pagos individuales del más reciente al más antiguo para el historial
      const pagosOrdenados = [...g.pagos].sort((a, b) => new Date(getFechaPago(b)) - new Date(getFechaPago(a)))
      return { ...g, pagos: pagosOrdenados, saldo_pendiente: saldoPendiente, completo }
    }).sort((a, b) => new Date(b.ultima_fecha) - new Date(a.ultima_fecha))
  }, [pagos])

  const pedidoSel      = pedidos.find(p => p.id === +form.pedido_id)
  const esFiado        = !!pedidoSel?.permite_fiado
  const totalPedido    = pedidoSel?.total || 0
  const totalPagado    = pagadoPorPedido[+form.pedido_id] || 0
  const montoPendiente = Math.max(0, totalPedido - totalPagado)
  const pagoCompleto   = totalPedido > 0 && montoPendiente === 0

  // abrir modal de pago con pedido preseleccionado (desde ventas o desde la fila agrupada)
  const abrirConPedido = pedido_id => {
    setForm({ ...formVacio, pedido_id })
    setModalNuevo(true)
  }

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

  // ===========================================================
  // Validación en tiempo real: se recalcula en cada cambio de
  // form.monto / form.pedido_id, no solo al hacer submit.
  // ===========================================================
  const validarMonto = (montoVal = form.monto) => {
    if (!form.pedido_id) return 'Selecciona un pedido'
    if (montoVal === '' || montoVal === null) return null // campo vacío: aún no mostrar error mientras escribe
    const m = +montoVal
    if (isNaN(m) || m <= 0) return 'El monto debe ser mayor a $0'
    if (pagoCompleto) return 'El pedido ya está completamente pagado'
    if (!esFiado && m > montoPendiente) {
      return `El monto no puede superar ${montoPendiente.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })}`
    }
    return null
  }

  const handleMontoChange = val => {
    setForm(f => ({ ...f, monto: val }))
    const error = validarMonto(val)
    setErrores(prev => ({ ...prev, monto: error || undefined }))
  }

  const handlePedidoChange = pedido_id => {
    setForm(f => ({ ...f, pedido_id, monto: '' }))
    setErrores(prev => ({ ...prev, pedido_id: undefined, monto: undefined }))
  }

  const validar = () => {
    const e = {}
    if (!form.pedido_id) e.pedido_id = 'Selecciona un pedido'
    const errorMonto = validarMonto(form.monto)
    if (!form.monto || +form.monto <= 0) e.monto = 'Monto inválido'
    else if (errorMonto) e.monto = errorMonto
    return e
  }

  const handleSubmit = e => {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length) { setErrores(e2); return }
    crear.mutate(form)
  }

  const getEstadoPago = (estado) => {
    if (!estado) return { label: 'Pagado', clase: 'badge-activo' }
    if (esAnulado(estado)) return { label: 'Anulado', clase: 'badge-anulado' }
    if (esAbono(estado))   return { label: 'Abono',   clase: 'badge-pendiente' }
    return { label: 'Pagado', clase: 'badge-activo' }
  }

  // filtros ahora se aplican sobre los grupos (una fila por venta)
  const pagosAgrupadosFiltrados = pagosAgrupados.filter(g => {
    if (filtroEstado === 'pagado'  && !g.completo) return false
    if (filtroEstado === 'abono'   && (g.completo || g.saldo_pendiente <= 0)) return false
    if (filtroEstado === 'anulado' && !g.pagos.every(p => esAnulado(p.estado))) return false
    if (filtroBusqueda && !`${g.pedido_id} ${g.cliente || ''}`.toLowerCase().includes(filtroBusqueda.toLowerCase())) return false
    if (filtroDesde && g.ultima_fecha && new Date(g.ultima_fecha) < new Date(filtroDesde)) return false
    if (filtroHasta && g.ultima_fecha && new Date(g.ultima_fecha) > new Date(filtroHasta)) return false
    return true
  })

  const tipoPagoActual = form.monto && +form.monto > 0
    ? (+form.monto >= montoPendiente ? 'total' : 'abono')
    : null

  // helper para abrir el historial de una venta específica
  const verHistorial = pedido_id => setModalDetalle({ abierto: true, pedido_id })
  const grupoDetalle = pagosAgrupados.find(g => g.pedido_id === modalDetalle.pedido_id) || null

  return {
    pagosAgrupadosFiltrados, pedidos, form, errores,
    modalNuevo, modalDetalle, modalAnular, grupoDetalle, verHistorial,
    setModalNuevo, setModalDetalle, setModalAnular,
    setForm, filtroEstado, setFiltroEstado,
    filtroDesde, setFiltroDesde,
    filtroHasta, setFiltroHasta,
    filtroBusqueda, setFiltroBusqueda,
    totalPedido, totalPagado, montoPendiente, pagoCompleto, esFiado,
    handleSubmit, handleMontoChange, handlePedidoChange,
    anular, esPagado, esAbono, esAnulado, getFechaPago,
    pedidoBusqueda, setPedidoBusqueda, pedidoDropdown, setPedidoDropdown,
    getEstadoPago, tipoPagoActual,
    abrirConPedido,
    creando: crear.isPending, anulando: anular.isPending,
  }
}