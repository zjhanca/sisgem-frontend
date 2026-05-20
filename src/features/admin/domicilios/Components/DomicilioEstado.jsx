import { CheckCircle, Clock, XCircle } from 'lucide-react'
 
const ICONOS = { pendiente: Clock, entregado: CheckCircle, anulado: XCircle }
const COLORES = { pendiente: 'yellow', entregado: 'green', anulado: 'red' }
 
export default function DomicilioEstado({ fila, getKeyEstado, getEstadoId, ESTADOS_DOM, cambiarEstado }) {
  return (
    <div className="flex gap-1">
      {ESTADOS_DOM.map(({ key, label }) => {
        const estado_id = getEstadoId(key)
        if (!estado_id) return null
        const esActual = getKeyEstado(fila.estado) === key
        const Ico = ICONOS[key] || Clock
        const color = COLORES[key]
        return (
          <button key={key} type="button"
            onClick={() => cambiarEstado.mutate({ id: fila.id, estado_id })}
            title={label}
            className={`p-1.5 rounded-lg border transition-colors ${
              esActual
                ? color === 'green' ? 'bg-green-500/20 border-green-500 text-green-500'
                  : color === 'red'  ? 'bg-red-500/20 border-red-400 text-red-400'
                  : 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                : 'border-gray-200 dark:border-dark-border text-gray-400 hover:border-primary/40'
            }`}>
            <Ico size={12} />
          </button>
        )
      })}
    </div>
  )
}
