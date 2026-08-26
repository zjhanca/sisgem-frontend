import { Download } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'

export default function AbonoCard({ abono, descargarComprobante }) {
  return (
    <div className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-light-text dark:text-dark-text">Pago #{abono.id}</p>
          <p className="text-xs text-gray-400">
            Pedido #{abono.pedido_id} · <span className="capitalize">{abono.metodo}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <p className="text-primary font-bold text-sm">{formatPrecio(abono.monto)}</p>
            <span className={abono.estado?.toLowerCase().includes('anula') ? 'badge-anulado' : 'badge-activo'}>
              {abono.estado || 'Pagado'}
            </span>
          </div>
          <button type="button" onClick={() => descargarComprobante(abono.id)}
            title="Descargar comprobante"
            className="text-gray-400 hover:text-primary transition-colors p-1">
            <Download size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}