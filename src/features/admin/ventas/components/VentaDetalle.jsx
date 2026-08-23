import { useQuery } from '@tanstack/react-query'
import Modal from '@shared/components/Modal'
import { Download, Clock, Loader2, Package, Phone, CreditCard, FileText } from 'lucide-react'
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

export default function VentaDetalle({ modalDetalle, setModalDetalle, setModalAnular, getBadge }) {
  const venta = modalDetalle.venta
  const cerrar = () => setModalDetalle({ abierto: false, venta: null })
  const esFiado = venta?.permite_fiado && venta?.estado?.toLowerCase().includes('pendiente')
  const dias = esFiado ? diasRestantes(venta?.fecha_pedido) : null
  const vencida = dias !== null && dias < 0

  const { data: detalle, isLoading } = useQuery({
    queryKey: ['pedido-detalle', venta?.id],
    queryFn: () => ventasService.getDetalle(venta.id),
    enabled: !!venta?.id && modalDetalle.abierto,
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

          {/* Contenido scrolleable */}
          <div className="overflow-y-auto flex-1 space-y-3 text-xs pr-1">

            {/* Info básica */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="campo-label">Cliente</p>
                <p className="font-medium">{clienteInfo.nombre}</p>
              </div>
              <div>
                <p className="campo-label">Estado</p>
                <span className={getBadge(venta.estado)}>{venta.estado}</span>
              </div>
              <div>
                <p className="campo-label">Fecha</p>
                <p>{formatFechaHora(venta.fecha_pedido)}</p>
              </div>
              <div>
                <p className="campo-label">Método de Pago</p>
                <span className="capitalize font-medium">
                  {detalle?.metodo_pago || venta.metodo_pago || 'Efectivo'}
                </span>
              </div>
            </div>

            {/* Datos del cliente */}
            {(clienteInfo.telefono || clienteInfo.numero_documento) && (
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1.5">
                <p className="campo-label flex items-center gap-1 mb-2">
                  <FileText size={11} /> Datos del cliente
                </p>
                {clienteInfo.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone size={11} className="text-gray-400 shrink-0" />
                    <span className="text-gray-600">{clienteInfo.telefono}</span>
                  </div>
                )}
                {clienteInfo.numero_documento && (
                  <div className="flex items-center gap-2">
                    <CreditCard size={11} className="text-gray-400 shrink-0" />
                    <span className="text-gray-600">
                      {clienteInfo.tipo_documento || 'CC'}: {clienteInfo.numero_documento}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Fiado */}
            {esFiado && (
              <div className={`flex items-start gap-2 p-3 rounded-lg border text-xs ${
                vencida ? 'bg-red-500/10 border-red-400/30' : dias <= 3 ? 'bg-amber-500/10 border-amber-400/30' : 'bg-amber-500/5 border-amber-400/20'
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
                </div>
              </div>
            )}

            {/* Productos */}
            <div className="pt-1 border-t border-gray-100">
              <p className="campo-label mb-1.5 flex items-center gap-1">
                <Package size={11} /> Productos comprados
              </p>
              {isLoading ? (
                <div className="flex items-center justify-center py-4 text-gray-400">
                  <Loader2 size={14} className="animate-spin mr-2" /> Cargando productos...
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

          {/* Total fijo + acciones */}
          <div className="pt-3 mt-3 border-t border-gray-100 shrink-0 space-y-3">
            <div className="flex justify-between items-center px-1">
              <span className="text-sm font-semibold text-light-text">Total</span>
              <span className="text-lg font-bold text-primary">{formatPrecio(venta.total)}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => descargarPDF(`/reportes/pedido/${venta.id}`, `comprobante-${venta.id}.pdf`)}
                className="btn-outline text-xs flex-1 justify-center">
                <Download size={12} /> Comprobante
              </button>
            </div>
          </div>

        </div>
      )}
    </Modal>
  )
}