import { useState } from 'react'
import Modal from '@shared/components/Modal'
import { Download, Clock, CreditCard } from 'lucide-react'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { ventasService } from '../services/ventasService'
import toast from 'react-hot-toast'

function proximoAbono(fechaVenta) {
  if (!fechaVenta) return null
  const fecha = new Date(fechaVenta)
  fecha.setDate(fecha.getDate() + 15)
  return fecha.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })
}

function diasRestantes(fechaVenta) {
  if (!fechaVenta) return null
  const hoy = new Date()
  const limite = new Date(fechaVenta)
  limite.setDate(limite.getDate() + 15)
  return Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24))
}

export default function VentaDetalle({ modalDetalle, setModalDetalle, setModalAnular, getBadge }) {
  const venta = modalDetalle.venta
  const cerrar = () => { setModalDetalle({ abierto: false, venta: null }); setModalPago(false); setMonto('') }

  const esFiado = venta?.permite_fiado && venta?.estado?.toLowerCase().includes('pendiente')
  const dias = esFiado ? diasRestantes(venta?.fecha_pedido) : null
  const vencida = dias !== null && dias < 0

  const [modalPago, setModalPago] = useState(false)
  const [monto, setMonto] = useState('')
  const [metodo, setMetodo] = useState('efectivo')

  const qc = useQueryClient()

  // obtener pagos del pedido para calcular saldo
  const { data: pagos = [] } = useQuery({
    queryKey: ['pagos'],
    queryFn: ventasService.getPagos,
    enabled: esFiado && modalDetalle.abierto,
  })
  const pagosActivos = pagos.filter(p => p.pedido_id === venta?.id && !p.estado?.toLowerCase().includes('anula'))
  const totalPagado  = pagosActivos.reduce((s, p) => s + +p.monto, 0)
  const saldoPendiente = Math.max(0, +(venta?.total || 0) - totalPagado)

  const registrarPago = useMutation({
    mutationFn: data => ventasService.registrarPago(data),
    onSuccess: () => {
      qc.invalidateQueries(['pedidos'])
      qc.invalidateQueries(['pagos'])
      toast.success('Pago registrado')
      setModalPago(false)
      setMonto('')
      cerrar()
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error al registrar pago'),
  })

  const handlePago = () => {
    if (!monto || +monto <= 0) { toast.error('Ingresa un monto válido'); return }
    if (+monto > saldoPendiente) { toast.error(`El monto no puede superar el saldo pendiente`); return }
    registrarPago.mutate({ pedido_id: venta.id, monto: +monto, metodo })
  }

  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} titulo={`Venta #${venta?.id}`}>
      {venta && (
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div><p className="campo-label">Cliente</p><p className="font-medium">{venta.cliente}</p></div>
            <div><p className="campo-label">Tipo</p><span className="badge bg-primary/20 text-green-700 dark:text-primary">Mostrador</span></div>
            <div><p className="campo-label">Estado</p><span className={getBadge(venta.estado)}>{venta.estado}</span></div>
            <div><p className="campo-label">Total</p><p className="text-primary font-bold text-sm">{formatPrecio(venta.total)}</p></div>
            <div className="col-span-2"><p className="campo-label">Fecha</p><p>{formatFechaHora(venta.fecha_pedido)}</p></div>
          </div>

          {/* banner fiado */}
          {esFiado && (
            <div className={`flex items-start gap-2 p-3 rounded-lg border text-xs ${
              vencida
                ? 'bg-red-500/10 border-red-400/30'
                : dias <= 3
                  ? 'bg-amber-500/10 border-amber-400/30'
                  : 'bg-amber-500/5 border-amber-400/20'
            }`}>
              <Clock size={14} className={`shrink-0 mt-0.5 ${vencida ? 'text-red-400' : 'text-amber-500'}`} />
              <div className="flex-1">
                <p className={`font-semibold ${vencida ? 'text-red-400' : 'text-amber-500'}`}>
                  {vencida ? 'Abono vencido' : 'Venta a crédito — Fiado'}
                </p>
                <p className="text-gray-400 mt-0.5">
                  Próximo abono: <span className={`font-medium ${vencida ? 'text-red-400' : 'text-amber-500'}`}>
                    {proximoAbono(venta.fecha_pedido)}
                  </span>
                </p>
                <p className={`mt-0.5 ${vencida ? 'text-red-400' : dias <= 3 ? 'text-amber-400' : 'text-gray-400'}`}>
                  {vencida
                    ? `Vencido hace ${Math.abs(dias)} día${Math.abs(dias) !== 1 ? 's' : ''}`
                    : dias === 0 ? 'Vence hoy'
                    : `Faltan ${dias} día${dias !== 1 ? 's' : ''}`}
                </p>
                {/* saldo */}
                <div className="mt-2 pt-2 border-t border-amber-500/20 flex justify-between">
                  <span className="text-gray-400">Saldo pendiente:</span>
                  <span className={`font-bold ${vencida ? 'text-red-400' : 'text-amber-500'}`}>
                    {formatPrecio(saldoPendiente)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* form inline pago si modalPago */}
          {esFiado && modalPago && saldoPendiente > 0 && (
            <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
              <p className="font-medium text-primary text-xs">Registrar Pago</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="campo-label">Monto *</label>
                  <input type="number" step="0.01" min="0.01" max={saldoPendiente}
                    value={monto} onChange={e => setMonto(e.target.value)}
                    className="campo-input" placeholder="0.00" />
                  <button type="button" onClick={() => setMonto(saldoPendiente)}
                    className="text-xs text-primary mt-1 hover:underline">
                    Usar saldo completo ({formatPrecio(saldoPendiente)})
                  </button>
                </div>
                <div>
                  <label className="campo-label">Método</label>
                  <select value={metodo} onChange={e => setMetodo(e.target.value)} className="campo-input">
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="nequi">Nequi</option>
                    <option value="daviplata">Daviplata</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setModalPago(false); setMonto('') }}
                  className="px-3 py-1.5 text-xs border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">
                  Cancelar
                </button>
                <button onClick={handlePago} disabled={registrarPago.isPending}
                  className="btn-primary text-xs disabled:opacity-50">
                  {registrarPago.isPending ? 'Registrando...' : 'Aceptar'}
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-dark-border flex-wrap">
            <button onClick={() => descargarPDF(`/reportes/pedido/${venta.id}`, `comprobante-${venta.id}.pdf`)}
              className="btn-outline text-xs"><Download size={12} /> Comprobante</button>

            {/* botón pagar fiado */}
            {esFiado && saldoPendiente > 0 && (
              <button onClick={() => setModalPago(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-primary/40 text-primary hover:bg-primary/10 transition-colors">
                <CreditCard size={12} /> {modalPago ? 'Ocultar pago' : 'Registrar Pago'}
              </button>
            )}

            {!venta.estado?.toLowerCase().includes('anula') && (
              <button onClick={() => { cerrar(); setModalAnular({ abierto: true, venta }) }}
                className="px-3 py-1.5 text-xs border border-red-400/40 text-red-400 rounded-lg hover:bg-red-400/10">
                Anular Venta
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  )
}