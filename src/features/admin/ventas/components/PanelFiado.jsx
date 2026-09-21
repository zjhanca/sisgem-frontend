import { AlertTriangle, CreditCard, Clock } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'

export default function PanelFiado({
  form, setForm, clienteSeleccionado,
  cupoFiadoDisponible, excedeCupoFiado, montoFiado, montoInmediato,
  totalVenta, permitefiado, sinCupo, minimoInsuficiente, MINIMO_FIADO,
}) {
  if (!clienteSeleccionado) return null

  const esFiado    = form.tipo_pago === 'fiado'
  const tieneCupo  = cupoFiadoDisponible != null && cupoFiadoDisponible > 0
  const mcPersonal = form.monto_fiado_personalizado != null
    ? parseFloat(form.monto_fiado_personalizado) || 0
    : null
  const inmediatoPersonal = mcPersonal !== null
    ? Math.max(0, totalVenta - mcPersonal)
    : montoInmediato

  return (
    <div className="space-y-2">

      {/* Barra cupo crédito */}
      {esFiado && cupoFiadoDisponible != null && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Cupo de crédito disponible</span>
            <span className={excedeCupoFiado
              ? 'text-amber-600 font-semibold'
              : 'text-primary font-semibold'}>
              ${totalVenta.toLocaleString('es-CO')} / ${cupoFiadoDisponible.toLocaleString('es-CO')}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                excedeCupoFiado ? 'bg-amber-400' : 'bg-primary'
              }`}
              style={{ width: `${cupoFiadoDisponible > 0
                ? Math.min(100, (totalVenta / cupoFiadoDisponible) * 100)
                : 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Opción crédito parcial — tanto si excede como si no */}
      {esFiado && tieneCupo && !sinCupo && (
        <div className={`p-3 rounded-lg border space-y-2 ${
          excedeCupoFiado
            ? 'bg-amber-50 border-amber-200'
            : 'bg-primary/5 border-primary/20'
        }`}>
          {/* Aviso cuando excede */}
          {excedeCupoFiado && form.monto_fiado_personalizado == null && (
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 leading-relaxed">
                Excede el cupo. Por defecto se asignan{' '}
                <strong>${cupoFiadoDisponible.toLocaleString('es-CO')}</strong> a crédito
                y se cobran <strong>${(totalVenta - cupoFiadoDisponible).toLocaleString('es-CO')}</strong> ahora.
              </p>
            </div>
          )}

          {/* Toggle personalizar */}
          <div className="flex items-center justify-between">
            <p className={`text-xs font-semibold ${
              excedeCupoFiado ? 'text-amber-600' : 'text-primary'
            }`}>
              ¿Cuánto va a crédito?
            </p>
            <button type="button"
              onClick={() => setForm(f => ({
                ...f,
                monto_fiado_personalizado: f.monto_fiado_personalizado != null
                  ? null
                  : String(excedeCupoFiado ? cupoFiadoDisponible : totalVenta),
              }))}
              className={`relative inline-flex h-5 w-9 items-center rounded-full
                transition-colors ${
                  form.monto_fiado_personalizado != null
                    ? excedeCupoFiado ? 'bg-amber-500' : 'bg-primary'
                    : 'bg-gray-200'
                }`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white
                transition-transform ${
                  form.monto_fiado_personalizado != null
                    ? 'translate-x-4' : 'translate-x-0.5'
                }`} />
            </button>
          </div>

          {form.monto_fiado_personalizado != null && (
            <>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="campo-label">Monto a crédito</label>
                  <input
                    type="text" inputMode="numeric"
                    value={form.monto_fiado_personalizado}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '')
                      // No puede superar el cupo disponible ni el total
                      const max = Math.min(cupoFiadoDisponible ?? totalVenta, totalVenta)
                      const num = Math.min(parseFloat(val) || 0, max)
                      setForm(f => ({ ...f, monto_fiado_personalizado: String(num) }))
                    }}
                    placeholder="0"
                    className="campo-input text-xs"
                  />
                  {cupoFiadoDisponible != null && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Máx: {formatPrecio(Math.min(cupoFiadoDisponible, totalVenta))}
                    </p>
                  )}
                </div>
                <div className="flex-1">
                  <label className="campo-label">Cobrar ahora</label>
                  <div className="campo-input text-xs bg-gray-50 text-gray-500
                    flex items-center">
                    {formatPrecio(inmediatoPersonal)}
                  </div>
                </div>
              </div>

              {/* Método para el cobro inmediato */}
              {inmediatoPersonal > 0 && (
                <div>
                  <label className="campo-label">Método para cobrar ahora</label>
                  <div className="flex gap-2">
                    {['efectivo', 'transferencia'].map(m => (
                      <button key={m} type="button"
                        onClick={() => setForm(f => ({ ...f, metodo_pago_inmediato: m }))}
                        className={`flex-1 py-1.5 text-xs rounded-lg border transition-all
                          capitalize ${
                          form.metodo_pago_inmediato === m
                            ? excedeCupoFiado
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-primary text-white border-primary'
                            : 'border-gray-200 text-gray-500 hover:border-primary/40'
                        }`}>
                        {m} ({formatPrecio(inmediatoPersonal)})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Cuando no personaliza pero excede — botones método por defecto */}
          {excedeCupoFiado && form.monto_fiado_personalizado == null && (
            <div className="flex gap-2">
              {['efectivo', 'transferencia'].map(m => (
                <button key={m} type="button"
                  onClick={() => setForm(f => ({ ...f, metodo_pago_inmediato: m }))}
                  className={`flex-1 py-1.5 text-xs rounded-lg border transition-all ${
                    form.metodo_pago_inmediato === m
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'border-amber-200 text-amber-600 hover:border-amber-400'
                  }`}>
                  {m} (${(totalVenta - cupoFiadoDisponible).toLocaleString('es-CO')})
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sin cupo */}
      {sinCupo && esFiado && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertTriangle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">
            Este cliente no tiene cupo de crédito disponible. Elige "Pago Total".
          </p>
        </div>
      )}

      {/* Botones tipo pago */}
      <div className="flex flex-col gap-1">
        <div className="flex gap-2 pt-1">
          {[
            { val: 'total', label: 'Pago Total', icon: CreditCard,
              active: 'bg-primary text-white border-primary' },
            { val: 'fiado', label: 'Crédito', icon: Clock,
              active: 'bg-amber-500 text-white border-amber-500',
              disabled: !permitefiado || sinCupo || minimoInsuficiente },
          ].map(t => (
            <button key={t.val} type="button"
              disabled={t.disabled}
              onClick={() => !t.disabled && setForm(f => ({
                ...f,
                tipo_pago:                t.val,
                monto_fiado_personalizado: null,
              }))}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2
                text-xs rounded-lg border transition-all ${
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