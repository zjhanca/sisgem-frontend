import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'
 
const ICONOS  = { pendiente: Clock, entregado: CheckCircle, anulado: XCircle }
const ESTILOS = {
  pendiente: 'bg-yellow-500/20 border-yellow-500 text-yellow-500',
  entregado: 'bg-green-500/20 border-green-500 text-green-500',
  anulado:   'bg-red-500/20 border-red-400 text-red-400',
}
 
export default function DomicilioEstado({ domDetalle, ESTADOS_DOM, getKeyEstadoDom, getEstadoDomId, cambiarEstadoDom }) {
  return (
    <div className="space-y-2">
      <div className="p-3 rounded-lg bg-light-bg dark:bg-dark-bg text-xs space-y-1">
        <p><span className="text-gray-400">Dirección:</span> {domDetalle.direccion || domDetalle.direccion_manual || '—'}</p>
        {domDetalle.barrio && <p><span className="text-gray-400">Barrio:</span> {domDetalle.barrio}</p>}
        {domDetalle.tarifa_aplicada > 0 && <p><span className="text-gray-400">Tarifa:</span> <span className="text-blue-500 font-medium">{formatPrecio(domDetalle.tarifa_aplicada)}</span></p>}
      </div>
      <p className="campo-label mb-1">Estado del Domicilio</p>
      <div className="flex gap-2 flex-wrap">
        {ESTADOS_DOM.map(({ key, label }) => {
          const estado_id = getEstadoDomId(key)
          if (!estado_id) return null
          const esActual = getKeyEstadoDom(domDetalle.estado) === key
          const Ico = ICONOS[key] || Clock
          return (
            <button key={key} type="button"
              onClick={() => cambiarEstadoDom.mutate({ id: domDetalle.id, estado_id })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${esActual ? ESTILOS[key] : 'border-gray-200 dark:border-dark-border text-gray-500 hover:border-primary/40'}`}>
              <Ico size={11} /> {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
