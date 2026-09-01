import { useQuery } from '@tanstack/react-query'
import Modal from '@shared/components/Modal'
import { Download, Clock, Loader2, Package, Phone, CreditCard, FileText, Smartphone } from 'lucide-react'
import { formatPrecio, formatFecha, formatFechaHora } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
import { ventasService } from '../services/ventasService'

function proximoAbono(fechaVenta) {
  if (!fechaVenta) return null
  const fecha = new Date(fechaVenta)
  fecha.setDate(fecha.getDate() + 15)
  return formatFecha(fecha)
}

function diasRestantes(fechaVenta) {
  if (!fechaVenta) return null
  const hoy = new Date()
  const limite = new Date(fechaVenta)
  limite.setDate(limite.getDate() + 15)
  return Math.ceil((limite - hoy) / (1000 * 60 * 60 * 24))
}

function BadgeEstado({ estado }) {
  const l = estado?.toLowerCase() || ''
  const color = l.includes('anula') ? 'bg-gray-300'
    : l.includes('complet') || l.includes('paga') ? 'bg-primary'
    : 'bg-amber-500'
  const label = l.includes('anula') ? 'Anulado'
    : l.includes('complet') || l.includes('paga') ? 'Completado'
    : 'Pendiente'
  return (
    <span className={`inline-flex items-center justify-center h-6 px-3 rounded-full text-white text-xs font-semibold ${color}`}>
      {label}
    </span>
  )
}

export default function VentaDetalle({ modalDetalle, setModalDetalle, setModalAnular, getBadge }) {
  const venta  = modalDetalle.venta
  const cerrar = () => setModalDetalle({ abierto: false, venta: null })

  const esFiado = venta?.es_fiado && venta?.estado?.toLowerCase().includes('pendiente')
  const dias    = esFiado ? diasRestantes(venta?.fecha_pedido) : null
  const vencida = dias !== null && dias < 0

  const { data: detalle, isLoading } = useQuery({
    queryKey: ['pedido-detalle', venta?.id],
    queryFn:  () => ventasService.getDetalle(venta.id),
    enabled:  !!venta?.id && modalDetalle.abierto,
  })

  const clienteInfo = {
    nombre:           venta?.cliente,
    telefono:         detalle?.telefono || venta?.telefono,
    tipo_documento:   detalle?.tipo_documento || venta?.tipo_documento,
    numero_documento: detalle?.numero_documento || venta?.numero_documento,
  }

  const productos = detalle?.productos || []

  return (
    <Modal abierto={modalDetalle.abierto} onCerrar={cerrar} bloquearCierre titulo={`Venta #${venta?.id}`}>
      {venta && (
        <div className="flex flex-col" style={{ maxHeight: '80vh' }}>
          <div className="overflow-y-auto flex-1 space-y-3 text-xs pr-1">

            {/* ── Fila 1: Estado + Fecha ── */}
            <div className="flex items-center justify-between">
              <BadgeEstado estado={venta.estado} />
              <span className="text-gray-400">{formatFechaHora(venta.fecha_pedido)}</span>
            </div>

            {/* ── Fila 2: Cliente + badges de contexto ── */}
            <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="campo-label mb-0.5">Cliente</p>
                  <p className="font-semibold text-sm">{clienteInfo.nombre}</p>
                </div>
                {/* Badges contexto alineados a la derecha */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  {venta.origen === 'movil' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/15 border border-blue-500/30 text-blue-500">
                      <Smartphone size={10} /> App
                    </span>
                  )}
                  {venta.es_fiado && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 border border-amber-500/30 text-amber-500">
                      Fiado
                    </span>
                  )}
                  {venta.origen === 'movil' && venta.es_fiado && (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      venta.entregado
                        ? 'bg-green-500/15 border border-green-500/30 text-green-600'
                        : 'bg-gray-100 border border-gray-200 text-gray-400'
                    }`}>
                      {venta.entregado ? '✓ Entregado' : 'Sin entregar'}
                    </span>
                  )}
                </div>
              </div>

              {/* Datos de contacto en una sola fila */}
              {(clienteInfo.telefono || clienteInfo.numero_documento) && (
                <div className="flex flex-wrap gap-3 pt-1 border-t border-gray-200">
                  {clienteInfo.telefono && (
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Phone size={11} className="text-gray-400 shrink-0" />
                      <span>{clienteInfo.telefono}</span>
                    </div>
                  )}
                  {clienteInfo.numero_documento && (
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <CreditCard size={11} className="text-gray-400 shrink-0" />
                      <span>{clienteInfo.tipo_documento || 'CC'}: {clienteInfo.numero_documento}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Fila 3: Método de pago + Origen en una sola fila ── */}
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="campo-label">Método de pago</p>
                <p className="font-medium capitalize">
                  {detalle?.metodo_pago || venta.metodo_pago || 'Efectivo'}
                </p>
              </div>
              <div className="text-right">
                <p className="campo-label">Entrega</p>
                <p className="font-medium capitalize">
                  {venta.tipo_venta === 'domicilio' ? 'A domicilio' : 'En tienda'}
                </p>
              </div>
            </div>

            {/* ── Aviso fiado pendiente ── */}
            {esFiado && (
              <div className={`flex items-start gap-2 p-3 rounded-lg border ${
                vencida ? 'bg-red-500/10 border-red-400/30'
                : dias <= 3 ? 'bg-amber-500/10 border-amber-400/30'
                : 'bg-amber-500/5 border-amber-400/20'
              }`}>
                <Clock size={14} className={`shrink-0 mt-0.5 ${vencida ? 'text-red-400' : 'text-amber-500'}`} />
                <div className="flex-1">
                  <p className={`font-semibold ${vencida ? 'text-red-400' : 'text-amber-500'}`}>
                    {vencida ? 'Abono vencido' : 'Venta a crédito — Fiado'}
                  </p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-gray-400">
                      Próximo abono: <span className={`font-medium ${vencida ? 'text-red-400' : 'text-amber-500'}`}>
                        {proximoAbono(venta.fecha_pedido)}
                      </span>
                    </span>
                    <span className={vencida ? 'text-red-400' : dias <= 3 ? 'text-amber-400' : 'text-gray-400'}>
                      {vencida
                        ? `Vencido hace ${Math.abs(dias)}d`
                        : dias === 0 ? 'Vence hoy'
                        : `Faltan ${dias}d`}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ── Productos ── */}
            <div className="pt-1 border-t border-gray-100">
              <p className="campo-label mb-1.5 flex items-center gap-1">
                <Package size={11} /> Productos
              </p>
              {isLoading ? (
                <div className="flex items-center justify-center py-4 text-gray-400">
                  <Loader2 size={14} className="animate-spin mr-2" /> Cargando...
                </div>
              ) : productos.length === 0 ? (
                <p className="text-center text-gray-400 py-3">Sin productos registrados</p>
              ) : (
                <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                  {productos.map(p => (
                    <div key={p.id} className="flex items-center gap-2 p-2 rounded bg-gray-50">
                      {p.imagen_url
                        ? <img src={p.imagen_url} alt="" className="w-8 h-8 object-cover rounded shrink-0"
                            onError={e => e.target.style.display='none'} />
                        : <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-xs text-primary/50 shrink-0">—</div>
                      }
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium">{p.producto}</p>
                        {p.codigo_barras && <p className="text-gray-400 font-mono">{p.codigo_barras}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-gray-400">{p.cantidad} × {formatPrecio(p.precio_unitario)}</p>
                        <p className="text-primary font-semibold">{formatPrecio(p.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Total + acciones ── */}
          <div className="pt-3 mt-3 border-t border-gray-100 shrink-0 space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-lg font-bold text-primary">{formatPrecio(venta.total)}</span>
            </div>
            <button
              onClick={() => descargarPDF(`/reportes/pedido/${venta.id}`, `comprobante-${venta.id}.pdf`)}
              className="btn-outline text-xs w-full justify-center">
              <Download size={12} /> Comprobante
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}