import { AlertTriangle, CreditCard, Clock } from 'lucide-react'

export default function PanelFiado({
  form, setForm, clienteSeleccionado,
  cupoFiadoDisponible, excedeCupoFiado, montoFiado, montoInmediato,
  totalVenta, permitefiado, sinCupo, minimoInsuficiente, MINIMO_FIADO,
}) {
  if (!clienteSeleccionado) return null

  return (
    <div className="space-y-2">

      {/* Barra cupo crédito */}
      {form.tipo_pago === 'fiado' && cupoFiadoDisponible != null && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Cupo de crédito disponible</span>
            <span className={excedeCupoFiado ? 'text-amber-600 font-semibold' : 'text-primary font-semibold'}>
              ${totalVenta.toLocaleString('es-CO')} / ${cupoFiadoDisponible.toLocaleString('es-CO')}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${excedeCupoFiado ? 'bg-amber-400' : 'bg-primary'}`}
              style={{ width: `${cupoFiadoDisponible > 0 ? Math.min(100, (totalVenta / cupoFiadoDisponible) * 100) : 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Aviso pago mixto */}
      {form.tipo_pago === 'fiado' && excedeCupoFiado && !sinCupo && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 space-y-2">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 leading-relaxed">
              Solo tiene <strong>${cupoFiadoDisponible.toLocaleString('es-CO')}</strong> de cupo.
              Se darán a crédito <strong>${montoFiado.toLocaleString('es-CO')}</strong> y debes cobrar
              <strong> ${montoInmediato.toLocaleString('es-CO')}</strong> ahora.
            </p>
          </div>
          <div className="flex gap-2">
            {[{ val: 'efectivo', label: 'Efectivo' }, { val: 'transferencia', label: 'Transferencia' }].map(m => (
              <button key={m.val} type="button"
                onClick={() => setForm(f => ({ ...f, metodo_pago_inmediato: m.val }))}
                className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                  form.metodo_pago_inmediato === m.val
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'border-amber-200 text-amber-600 hover:border-amber-400'
                }`}>
                {m.label} (${montoInmediato.toLocaleString('es-CO')})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sin cupo */}
      {sinCupo && form.tipo_pago === 'fiado' && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">Este cliente no tiene cupo de crédito disponible. Elige "Pago Total".</p>
        </div>
      )}

      {/* Botones tipo pago */}
      <div className="flex flex-col gap-1">
        <div className="flex gap-2 pt-1">
          {[
            { val: 'total', label: 'Pago Total',  icon: CreditCard, active: 'bg-primary text-white border-primary' },
            {
              val: 'fiado', label: 'Crédito', icon: Clock,
              active: 'bg-amber-500 text-white border-amber-500',
              disabled: !permitefiado || sinCupo || minimoInsuficiente,
            },
          ].map(t => (
            <button key={t.val} type="button"
              disabled={t.disabled}
              onClick={() => !t.disabled && setForm(f => ({ ...f, tipo_pago: t.val }))}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-all ${
                form.tipo_pago === t.val ? t.active : t.disabled
                  ? 'border-gray-200 text-gray-300 cursor-not-allowed opacity-50'
                  : 'border-gray-200 text-gray-500 hover:border-primary/40'
              }`}>
              <t.icon size={12} /> {t.label}
            </button>
          ))}
        </div>
        {permitefiado && minimoInsuficiente && (
          <p className="text-xs text-gray-400 text-center">
            Mínimo <strong>${(MINIMO_FIADO || 10000).toLocaleString('es-CO')}</strong> para ventas a crédito
          </p>
        )}
      </div>
    </div>
  )
}