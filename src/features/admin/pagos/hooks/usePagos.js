import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pagosService } from '../services/pagosService'
import { descargarPDF, descargarExcel } from '@shared/utils/reportes'
import toast from 'react-hot-toast'

const formVacio = {
  cliente_id: '', monto: '', metodo: 'efectivo',
  pago_mixto: false, monto_efectivo: '', monto_transferencia: '',
  usa_credito: false, monto_credito: '', metodo_resto: 'efectivo',
}
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
  const [filtroEstado, setFiltroEstado]       = useState('')
  const [filtroDesde, setFiltroDesde]         = useState('')
  const [filtroHasta, setFiltroHasta]         = useState('')
  const [filtroBusqueda, setFiltroBusqueda]   = useState('')
  const [clienteBusqueda, setClienteBusqueda] = useState('')
  const [clienteDropdown, setClienteDropdown] = useState(false)
  const [pedidoEspecifico, setPedidoEspecifico] = useState(null)

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

  const pedidos = todosLosPedidos.filter(p => {
    const estadoNom = p.estado?.toLowerCase() || ''
    if (estadoNom.includes('anula')) return false
    if (estadoNom.includes('complet') || estadoNom.includes('paga')) return false
    if (p.origen === 'movil' && !p.es_fiado) return false
    return true
  })

  const pagadoPorPedido = pagadoPorPedidoCalc(todosLosPedidos, pagos)

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
      const completo       = g.venta_anulada || (g.total_pedido > 0 && saldoPendiente === 0)
      const pagosOrdenados = [...g.pagos].sort((a, b) =>
        new Date(getFechaPago(b)) - new Date(getFechaPago(a)))
      return { ...g, pagos: pagosOrdenados,
        saldo_pendiente: g.venta_anulada ? 0 : saldoPendiente, completo }
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
    const grupo  = pagosAgrupados.find(g => g.pedido_id === pedido_id)
    const limite = getLimiteAnulacionVenta(grupo)
    if (!limite) return true
    return new Date() <= limite
  }

  const clienteSel   = clientes.find(c => c.id === +form.cliente_id) || null
  const deudaCliente = deudaPorCliente[+form.cliente_id] || null
  const tieneCredito = clienteSel?.permite_fiado === true || clienteSel?.permite_fiado === 'true'

  const pedidosCliente = useMemo(() => {
    if (!deudaCliente) return []
    const todos = [...deudaCliente.pedidos]
      .filter(p => p.pendiente > 0)
      .sort((a, b) => new Date(a.fecha_pedido) - new Date(b.fecha_pedido))
    if (pedidoEspecifico) return todos.filter(p => p.id === pedidoEspecifico)
    return todos
  }, [deudaCliente, pedidoEspecifico])

  const totalDeuda     = pedidosCliente.reduce((s, p) => s + p.pendiente, 0)
  const pagoCompleto   = !!form.cliente_id && totalDeuda === 0
  const montoPendiente = totalDeuda

  // ── Autocompletar monto cuando deuda < mínimo ──────────────
  useEffect(() => {
    if (
      modalNuevo &&
      totalDeuda > 0 &&
      totalDeuda < MONTO_MINIMO_ABONO &&
      !form.monto
    ) {
      setForm(f => ({ ...f, monto: String(Math.round(totalDeuda)) }))
      setErrores(prev => ({ ...prev, monto: undefined }))
    }
  }, [totalDeuda, modalNuevo])

  // ── Calcular resto cuando usa crédito parcial ───────────────
  const montoCredito = parseFloat(form.monto_credito || 0)
  const restoCredito = Math.max(0, totalDeuda - montoCredito)

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

  const abrirConCliente = cliente_id => {
    setForm({ ...formVacio, cliente_id: String(cliente_id) })
    setClienteBusqueda('')
    setClienteDropdown(false)
    setPedidoEspecifico(null)
    setModalNuevo(true)
  }

  const abrirConPedido = pedido_id => {
    const pedido = todosLosPedidos.find(p => p.id === pedido_id)
    if (pedido?.cliente_id) {
      setForm({ ...formVacio, cliente_id: String(pedido.cliente_id) })
      setClienteBusqueda('')
      setClienteDropdown(false)
      setPedidoEspecifico(pedido_id)
      setModalNuevo(true)
    } else {
      setForm(formVacio)
      setPedidoEspecifico(null)
      setModalNuevo(true)
    }
  }

  const crear = useMutation({
    mutationFn: async data => {
      if (data.usa_credito && parseFloat(data.monto_credito || 0) > 0) {
        // Pago con crédito parcial + otro método
        const mc = parseFloat(data.monto_credito)
        const mr = parseFloat(data.monto_resto || 0)
        let restante = mc + mr
        for (const p of pedidosCliente) {
          if (restante <= 0) break
          const abonar = Math.min(restante, p.pendiente)
          // Primero el crédito
          if (mc > 0) {
            const abornarCredito = Math.min(mc, abonar)
            await pagosService.create({ pedido_id: p.id, monto: abornarCredito, metodo: 'credito' })
            restante -= abornarCredito
          }
          // Luego el resto en efectivo/transferencia
          if (mr > 0 && restante > 0) {
            const abonarResto = Math.min(mr, restante)
            await pagosService.create({ pedido_id: p.id, monto: abonarResto, metodo: data.metodo_resto || 'efectivo' })
            restante -= abonarResto
          }
        }
      } else if (data.pago_mixto) {
        const montos = [
          { metodo: 'efectivo',      monto: parseFloat(data.monto_efectivo || 0) },
          { metodo: 'transferencia', monto: parseFloat(data.monto_transferencia || 0) },
        ].filter(m => m.monto > 0)
        for (const { metodo, monto } of montos) {
          let restante = monto
          for (const p of pedidosCliente) {
            if (restante <= 0) break
            const abonar = Math.min(restante, p.pendiente)
            await pagosService.create({ pedido_id: p.id, monto: abonar, metodo })
            restante -= abonar
          }
        }
      } else {
        let montoRestante = +data.monto
        for (const p of pedidosCliente) {
          if (montoRestante <= 0) break
          const abonar = Math.min(montoRestante, p.pendiente)
          await pagosService.create({ pedido_id: p.id, monto: abonar, metodo: data.metodo })
          montoRestante -= abonar
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries(['pagos'])
      qc.invalidateQueries(['pedidos'])
      qc.invalidateQueries(['clientes'])
      setModalNuevo(false)
      setForm(formVacio)
      setClienteBusqueda('')
      setPedidoEspecifico(null)
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
    if (num > 0 && num < MONTO_MINIMO_ABONO && !cubre && totalDeuda >= MONTO_MINIMO_ABONO) {
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
    if (pagoCompleto) { e.monto = 'El cliente no tiene deuda pendiente'; return e }

    if (form.usa_credito) {
      const mc   = parseFloat(form.monto_credito || 0)
      const mr   = parseFloat(form.monto_resto || 0)
      const suma = mc + mr
      if (mc <= 0) e.monto = 'Ingresa el monto a usar de crédito'
      else if (suma > totalDeuda + 1) e.monto = 'El total supera la deuda'
      else if (suma < MONTO_MINIMO_ABONO && suma < totalDeuda && totalDeuda >= MONTO_MINIMO_ABONO)
        e.monto = `El abono mínimo es de $${MONTO_MINIMO_ABONO.toLocaleString('es-CO')}`
    } else if (form.pago_mixto) {
      const ef   = parseFloat(form.monto_efectivo || 0)
      const tr   = parseFloat(form.monto_transferencia || 0)
      const suma = ef + tr
      if (suma <= 0) e.monto = 'Ingresa los montos del pago mixto'
      else if (suma > totalDeuda + 1) e.monto = 'El total supera la deuda'
      else {
        const cubre = suma >= totalDeuda - 1
        if (suma < MONTO_MINIMO_ABONO && !cubre && totalDeuda >= MONTO_MINIMO_ABONO)
          e.monto = `El abono mínimo es de $${MONTO_MINIMO_ABONO.toLocaleString('es-CO')}`
      }
    } else {
      if (!form.monto || +form.monto <= 0) {
        e.monto = 'Monto inválido'
      } else {
        const cubre = totalDeuda > 0 && +form.monto >= totalDeuda
        if (+form.monto < MONTO_MINIMO_ABONO && !cubre && totalDeuda >= MONTO_MINIMO_ABONO)
          e.monto = `El abono mínimo es de $${MONTO_MINIMO_ABONO.toLocaleString('es-CO')}`
      }
    }
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
    if (filtroBusqueda && !`${g.pedido_id} ${g.cliente || ''}`.toLowerCase()
      .includes(filtroBusqueda.toLowerCase())) return false
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
    const ext    = formato === 'excel' ? 'xlsx' : 'pdf'
    const params = new URLSearchParams({ formato })
    if (tipo === 'rango') {
      if (desde) params.set('desde', desde)
      if (hasta) params.set('hasta', hasta)
    }
    const url           = `/reportes/pagos?${params.toString()}`
    const nombreArchivo = `reporte-pagos-${tipo || 'general'}.${ext}`
    if (formato === 'excel') await descargarExcel(url, nombreArchivo)
    else await descargarPDF(url, nombreArchivo)
  }

  return {
    pagosAgrupadosFiltrados,
    pedidos,
    clienteSel,
    clientesFiltradosModal,
    clientesConDeuda,
    clienteBusqueda,  setClienteBusqueda,
    clienteDropdown,  setClienteDropdown,
    deudaCliente,
    deudaPorCliente,
    totalDeuda,
    pedidosCliente,
    pedidoEspecifico,
    tieneCredito,
    montoCredito,
    restoCredito,
    form, setForm, errores,
    modalNuevo, setModalNuevo,
    modalDetalle, setModalDetalle,
    modalAnular, setModalAnular,
    grupoDetalle, verHistorial,
    filtroEstado, setFiltroEstado,
    filtroDesde, setFiltroDesde,
    filtroHasta, setFiltroHasta,
    filtroBusqueda, setFiltroBusqueda,
    totalPedido: totalDeuda,
    totalPagado: 0,
    montoPendiente,
    pagoCompleto,
    esFiado: true,
    handleSubmit,
    handleMontoChange,
    handlePedidoChange: () => {},
    anular,
    esPagado, esAbono, esAnulado, getFechaPago,
    puedeAnularPago, getLimiteAnulacionVenta,
    getEstadoPago, tipoPagoActual,
    abrirConPedido,
    abrirConCliente,
    pedidoSeleccionado: null,
    pedidoBusqueda:     clienteBusqueda,
    setPedidoBusqueda:  setClienteBusqueda,
    pedidoDropdown:     clienteDropdown,
    setPedidoDropdown:  setClienteDropdown,
    descargarReporte,
    creando:  crear.isPending,
    anulando: anular.isPending,
  }
}