import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pagosService } from '../services/pagosService'
import { descargarPDF, descargarExcel } from '@shared/utils/reportes'
import toast from 'react-hot-toast'

const formVacio = { cliente_id: '', monto: '', metodo: 'efectivo' }
const MONTO_MINIMO_ABONO = 10000

function esPagado(n)  { return n && (n.toLowerCase().includes('paga') || n.toLowerCase().includes('activ') || n.toLowerCase().includes('complet')) }
function esAbono(n)   { return n && n.toLowerCase().includes('abono') }
function esAnulado(n) { return n && (n.toLowerCase().includes('anula') || n.toLowerCase().includes('cancel')) }

export function usePagos() {
  const qc = useQueryClient()
  const [modalNuevo, setModalNuevo]     = useState(false)
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, pedido_id: null })
  const [modalAnular, setModalAnular]   = useState({ abierto: false, pago: null })
  const [form, setForm]       = useState(formVacio)
  const [errores, setErrores] = useState({})
  const [filtroEstado, setFiltroEstado]         = useState('')
  const [filtroDesde, setFiltroDesde]           = useState('')
  const [filtroHasta, setFiltroHasta]           = useState('')
  const [filtroBusqueda, setFiltroBusqueda]     = useState('')
  const [clienteBusqueda, setClienteBusqueda]   = useState('')
  const [clienteDropdown, setClienteDropdown]   = useState(false)

  const { data: pagos = [] }           = useQuery({ queryKey: ['pagos'],    queryFn: pagosService.getAll })
  const { data: todosLosPedidos = [] } = useQuery({ queryKey: ['pedidos'],  queryFn: pagosService.getPedidos })
  const { data: clientes = [] }        = useQuery({ queryKey: ['clientes'], queryFn: pagosService.getClientes })

  const getFechaPago = p => p.fecha_pago || p.fecha || p.created_at || null

  const pagadoPorPedidoCalc = (pedidosList, pagosList) =>
    pedidosList.reduce((acc, p) => {
      const activos = pagosList.filter(pg => pg.pedido_id === p.id && !esAnulado(pg.estado))
      acc[p.id] = activos.reduce((s, pg) => s + +pg.monto, 0)
      return acc
    }, {})

  // Pedidos que necesitan pago manual
  const pedidos = todosLosPedidos.filter(p => {
    const estadoNom = p.estado?.toLowerCase() || ''
    if (estadoNom.includes('anula')) return false
    if (estadoNom.includes('complet') || estadoNom.includes('paga')) return false
    if (p.origen === 'movil' && !p.es_fiado) return false
    return true
  })

  const pagadoPorPedido = pagadoPorPedidoCalc(todosLosPedidos, pagos)

  // Deuda consolidada por cliente
  const deudaPorCliente = useMemo(() => {
    const mapa = {}
    for (const p of pedidos) {
      const cid = p.cliente_id
      if (!cid) continue
      const pagado    = pagadoPorPedido[p.id] || 0
      const pendiente = Math.max(0, (p.total || 0) - pagado)
      if (!mapa[cid]) {
        mapa[cid] = { cliente_id: cid, cliente: p.cliente, total_deuda: 0, pedidos: [] }
      }
      mapa[cid].total_deuda += pendiente
      mapa[cid].pedidos.push({ ...p, pendiente })
    }
    return mapa
  }, [pedidos, pagadoPorPedido])

  const pagosAgrupados = useMemo(() => {
    const grupos = new Map()
    for (const pago of pagos) {
      const key = pago.pedido_id
      if (!grupos.has(key)) {
        grupos.set(key, {
          pedido_id:              key,
          cliente:                pago.cliente || '—',
          total_pedido:           +pago.total_pedido || 0,
          fecha_pedido:           pago.fecha_pedido || null,
          fecha_limite_anulacion: pago.fecha_limite_anulacion || null,
          venta_anulada:          esAnulado(pago.estado_venta),
          pagos:                  [],
          total_pagado:           0,
          ultima_fecha:           null,
        })
      }
      const grupo = grupos.get(key)
      grupo.pagos.push(pago)
      if (!esAnulado(pago.estado)) grupo.total_pagado += +pago.monto
      const fechaPago = getFechaPago(pago)
      if (fechaPago && (!grupo.ultima_fecha || new Date(fechaPago) > new Date(grupo.ultima_fecha))) {
        grupo.ultima_fecha = fechaPago
      }
    }
    return Array.from(grupos.values()).map(g => {
      const saldoPendiente = Math.max(0, g.total_pedido - g.total_pagado)
      const completo = g.venta_anulada || (g.total_pedido > 0 && saldoPendiente === 0)
      const pagosOrdenados = [...g.pagos].sort((a, b) => new Date(getFechaPago(b)) - new Date(getFechaPago(a)))
      return { ...g, pagos: pagosOrdenados, saldo_pendiente: g.venta_anulada ? 0 : saldoPendiente, completo }
    }).sort((a, b) => new Date(b.ultima_fecha) - new Date(a.ultima_fecha))
  }, [pagos])

  const getLimiteAnulacionVenta = grupo => {
    if (!grupo) return null
    if (grupo.fecha_limite_anulacion) return new Date(grupo.fecha_limite_anulacion)
    if (!grupo.fecha_pedido) return null
    const f = new Date(grupo.fecha_pedido)
    f.setHours(f.getHours() + 72)
    return f
  }

  const puedeAnularPago = pedido_id => {
    const grupo = pagosAgrupados.find(g => g.pedido_id === pedido_id)
    const limite = getLimiteAnulacionVenta(grupo)
    if (!limite) return true
    return new Date() <= limite
  }

  // Cliente y su deuda seleccionados
  const clienteSel     = clientes.find(c => c.id === +form.cliente_id) || null
  const deudaCliente   = deudaPorCliente[+form.cliente_id] || null
  const totalDeuda     = deudaCliente?.total_deuda || 0
  const pagoCompleto   = !!form.cliente_id && totalDeuda === 0
  const montoPendiente = totalDeuda

  // Pedidos del cliente ordenados del más antiguo al más nuevo
  const pedidosCliente = deudaCliente
    ? [...deudaCliente.pedidos]
        .filter(p => p.pendiente > 0)
        .sort((a, b) => new Date(a.fecha_pedido) - new Date(b.fecha_pedido))
    : []

  // Clientes que tienen deuda, filtrados por búsqueda
  const clientesConDeuda = clientes.filter(c => {
    const d = deudaPorCliente[c.id]
    return d && d.total_deuda > 0
  })

  const clientesFiltradosModal = clientesConDeuda.filter(c => {
    if (!clienteBusqueda) return true
    const t = clienteBusqueda.toLowerCase()
    return `${c.nombre} ${c.apellido}`.toLowerCase().includes(t) ||
           (c.numero_documento || '').toLowerCase().includes(t) ||
           (c.email || '').toLowerCase().includes(t)
  }).slice(0, 8)

  // Abrir modal por cliente
  const abrirConCliente = cliente_id => {
    setForm({ ...formVacio, cliente_id: String(cliente_id) })
    setClienteBusqueda('')
    setClienteDropdown(false)
    setModalNuevo(true)
  }

  // Compatibilidad con botón de Ventas — busca el cliente del pedido
  const abrirConPedido = pedido_id => {
    const pedido = todosLosPedidos.find(p => p.id === pedido_id)
    if (pedido?.cliente_id) {
      abrirConCliente(pedido.cliente_id)
    } else {
      setForm(formVacio)
      setModalNuevo(true)
    }
  }

  const crear = useMutation({
    mutationFn: async data => {
      // Distribuye el abono en los pedidos más antiguos primero
      let montoRestante = +data.monto
      for (const p of pedidosCliente) {
        if (montoRestante <= 0) break
        const abonar = Math.min(montoRestante, p.pendiente)
        await pagosService.create({ pedido_id: p.id, monto: abonar, metodo: data.metodo })
        montoRestante -= abonar
      }
    },
    onSuccess: () => {
      qc.invalidateQueries(['pagos'])
      qc.invalidateQueries(['pedidos'])
      qc.invalidateQueries(['clientes'])
      setModalNuevo(false)
      setForm(formVacio)
      setClienteBusqueda('')
      toast.success('Abono registrado correctamente')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error al registrar el abono'),
  })

  const anular = useMutation({
    mutationFn: pagosService.anular,
    onSuccess: () => {
      qc.invalidateQueries(['pagos'])
      setModalAnular({ abierto: false, pago: null })
      toast.success('Pago anulado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })

  const handleMontoChange = val => {
    if (val === '') {
      setForm(f => ({ ...f, monto: '' }))
      setErrores(prev => ({ ...prev, monto: undefined }))
      return
    }
    let num = +val
    if (isNaN(num)) return
    if (num < 0) num = 0
    if (totalDeuda > 0 && num > totalDeuda) num = totalDeuda
    setForm(f => ({ ...f, monto: String(num) }))
    const cubre = totalDeuda > 0 && num >= totalDeuda
    if (num > 0 && num < MONTO_MINIMO_ABONO && !cubre) {
      setErrores(prev => ({
        ...prev,
        monto: `El abono mínimo es de $${MONTO_MINIMO_ABONO.toLocaleString('es-CO')}`
      }))
    } else {
      setErrores(prev => ({ ...prev, monto: undefined }))
    }
  }

  const validar = () => {
    const e = {}
    if (!form.cliente_id) e.cliente_id = 'Selecciona un cliente'
    if (!form.monto || +form.monto <= 0) {
      e.monto = 'Monto inválido'
    } else {
      const cubre = totalDeuda > 0 && +form.monto >= totalDeuda
      if (+form.monto < MONTO_MINIMO_ABONO && !cubre) {
        e.monto = `El abono mínimo es de $${MONTO_MINIMO_ABONO.toLocaleString('es-CO')}`
      }
    }
    if (pagoCompleto) e.monto = 'El cliente no tiene deuda pendiente'
    return e
  }

  const handleSubmit = e => {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length) { setErrores(e2); return }
    crear.mutate(form)
  }

  const getEstadoPago = estado => {
    if (!estado) return { label: 'Pagado', clase: 'badge-activo' }
    if (esAnulado(estado)) return { label: 'Anulado', clase: 'badge-anulado' }
    if (esAbono(estado))   return { label: 'Abono',   clase: 'badge-pendiente' }
    return { label: 'Pagado', clase: 'badge-activo' }
  }

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
    ? (+form.monto >= totalDeuda ? 'total' : 'abono')
    : null

  const verHistorial = pedido_id => setModalDetalle({ abierto: true, pedido_id })
  const grupoDetalle = pagosAgrupados.find(g => g.pedido_id === modalDetalle.pedido_id) || null

  const descargarReporte = async ({ tipo, formato = 'pdf', desde, hasta } = {}) => {
    const nombres = { normal: 'general', rango: 'personalizado' }
    const ext = formato === 'excel' ? 'xlsx' : 'pdf'
    const params = new URLSearchParams({ formato })
    if (tipo === 'rango') {
      if (desde) params.set('desde', desde)
      if (hasta) params.set('hasta', hasta)
    }
    const url = `/reportes/pagos?${params.toString()}`
    const nombreArchivo = `reporte-pagos-${nombres[tipo] || tipo}.${ext}`
    if (formato === 'excel') await descargarExcel(url, nombreArchivo)
    else await descargarPDF(url, nombreArchivo)
  }

  return {
    // Lista principal
    pagosAgrupadosFiltrados,
    pedidos,
    // Cliente
    clienteSel,
    clientesFiltradosModal,
    clientesConDeuda,
    clienteBusqueda,  setClienteBusqueda,
    clienteDropdown,  setClienteDropdown,
    deudaCliente,
    deudaPorCliente,
    totalDeuda,
    pedidosCliente,
    // Form
    form, setForm, errores,
    // Modales
    modalNuevo, setModalNuevo,
    modalDetalle, setModalDetalle,
    modalAnular, setModalAnular,
    grupoDetalle, verHistorial,
    // Filtros
    filtroEstado, setFiltroEstado,
    filtroDesde, setFiltroDesde,
    filtroHasta, setFiltroHasta,
    filtroBusqueda, setFiltroBusqueda,
    // Montos
    totalPedido: totalDeuda,
    totalPagado: 0,
    montoPendiente,
    pagoCompleto,
    esFiado: true,
    // Handlers
    handleSubmit,
    handleMontoChange,
    handlePedidoChange: () => {},
    // Mutations
    anular,
    // Utils
    esPagado, esAbono, esAnulado, getFechaPago,
    puedeAnularPago, getLimiteAnulacionVenta,
    getEstadoPago, tipoPagoActual,
    // Acciones abrir modal
    abrirConPedido,
    abrirConCliente,
    // Legacy compat con Ventas.jsx
    pedidoSeleccionado: null,
    pedidoBusqueda: clienteBusqueda,
    setPedidoBusqueda: setClienteBusqueda,
    pedidoDropdown: clienteDropdown,
    setPedidoDropdown: setClienteDropdown,
    descargarReporte,
    creando: crear.isPending,
    anulando: anular.isPending,
  }
}