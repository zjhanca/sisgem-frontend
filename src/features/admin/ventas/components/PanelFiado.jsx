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

  // ── Pago mixto en el cobro inmediato ─────────────────────
  const inmEf         = parseFloat(form.inmediato_efectivo || 0)
  const inmTr         = parseFloat(form.inmediato_transferencia || 0)
  const sumaInmediato = inmEf + inmTr
  const inmMixtoValido = !form.inmediato_mixto ||
    (sumaInmediato > 0 && Math.abs(sumaInmediato - inmediatoPersonal) < 1)

  const cobrarAhora = form.monto_fiado_personalizado != null
    ? inmediatoPersonal
    : excedeCupoFiado ? totalVenta - cupoFiadoDisponible : montoInmediato

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

      {/* Opción crédito parcial */}
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
                inmediato_mixto:         false,
                inmediato_efectivo:      '',
                inmediato_transferencia: '',
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
                      const max = Math.min(cupoFiadoDisponible ?? totalVenta, totalVenta)
                      const num = Math.min(parseFloat(val) || 0, max)
                      setForm(f => ({
                        ...f,
                        monto_fiado_personalizado: String(num),
                        inmediato_mixto:           false,
                        inmediato_efectivo:        '',
                        inmediato_transferencia:   '',
                      }))
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

              {/* Cobro inmediato — simple o mixto */}
              {inmediatoPersonal > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="campo-label mb-0">
                      Método para {formatPrecio(inmediatoPersonal)}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400">¿Dividir?</span>
                      <button type="button"
                        onClick={() => setForm(f => ({
                          ...f,
                          inmediato_mixto:         !f.inmediato_mixto,
                          metodo_pago_inmediato:   'efectivo',
                          inmediato_efectivo:      '',
                          inmediato_transferencia: '',
                        }))}
                        className={`relative inline-flex h-5 w-9 items-center
                          rounded-full transition-colors ${
                            form.inmediato_mixto ? 'bg-primary' : 'bg-gray-200'
                          }`}>
                        <span className={`inline-block h-3.5 w-3.5 transform
                          rounded-full bg-white transition-transform ${
                            form.inmediato_mixto ? 'translate-x-4' : 'translate-x-0.5'
                          }`} />
                      </button>
                    </div>
                  </div>

                  {!form.inmediato_mixto ? (
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
                          {m}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-1.5 p-2.5 rounded-lg
                      border border-primary/20 bg-primary/5">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="campo-label">Efectivo</label>
                          <input
                            type="text" inputMode="numeric"
                            value={form.inmediato_efectivo}
                            onChange={e => {
                              const val  = e.target.value.replace(/\D/g, '')
                              const num  = Math.min(parseFloat(val) || 0, inmediatoPersonal)
                              const diff = Math.max(0, inmediatoPersonal - num)
                              setForm(f => ({
                                ...f,
                                inmediato_efectivo:      String(num),
                                inmediato_transferencia: diff > 0 ? String(diff) : '',
                              }))
                            }}
                            placeholder="0"
                            className="campo-input text-xs"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="campo-label">Transferencia</label>
                          <input
                            type="text" inputMode="numeric"
                            value={form.inmediato_transferencia}
                            onChange={e => {
                              const val  = e.target.value.replace(/\D/g, '')
                              const num  = Math.min(parseFloat(val) || 0, inmediatoPersonal)
                              const diff = Math.max(0, inmediatoPersonal - num)
                              setForm(f => ({
                                ...f,
                                inmediato_transferencia: String(num),
                                inmediato_efectivo:      diff > 0 ? String(diff) : '',
                              }))
                            }}
                            placeholder="0"
                            className="campo-input text-xs"
                          />
                        </div>
                      </div>
                      {sumaInmediato > 0 && inmMixtoValido && (
                        <p className="text-xs text-primary">✓ Montos correctos</p>
                      )}
                      {sumaInmediato > 0 && !inmMixtoValido && (
                        <p className="text-xs text-red-400">
                          La suma ({formatPrecio(sumaInmediato)}) no coincide con
                          el cobro ({formatPrecio(inmediatoPersonal)})
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Cuando no personaliza pero excede — botones método por defecto */}
          {excedeCupoFiado && form.monto_fiado_personalizado == null && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="campo-label mb-0">
                  Método para {formatPrecio(totalVenta - cupoFiadoDisponible)}
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400">¿Dividir?</span>
                  <button type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      inmediato_mixto:         !f.inmediato_mixto,
                      metodo_pago_inmediato:   'efectivo',
                      inmediato_efectivo:      '',
                      inmediato_transferencia: '',
                    }))}
                    className={`relative inline-flex h-5 w-9 items-center
                      rounded-full transition-colors ${
                        form.inmediato_mixto ? 'bg-amber-500' : 'bg-gray-200'
                      }`}>
                    <span className={`inline-block h-3.5 w-3.5 transform
                      rounded-full bg-white transition-transform ${
                        form.inmediato_mixto ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                  </button>
                </div>
              </div>

              {!form.inmediato_mixto ? (
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
              ) : (
                <div className="space-y-1.5 p-2.5 rounded-lg
                  border border-amber-200 bg-amber-50/50">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="campo-label">Efectivo</label>
                      <input
                        type="text" inputMode="numeric"
                        value={form.inmediato_efectivo}
                        onChange={e => {
                          const max  = totalVenta - cupoFiadoDisponible
                          const val  = e.target.value.replace(/\D/g, '')
                          const num  = Math.min(parseFloat(val) || 0, max)
                          const diff = Math.max(0, max - num)
                          setForm(f => ({
                            ...f,
                            inmediato_efectivo:      String(num),
                            inmediato_transferencia: diff > 0 ? String(diff) : '',
                          }))
                        }}
                        placeholder="0"
                        className="campo-input text-xs"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="campo-label">Transferencia</label>
                      <input
                        type="text" inputMode="numeric"
                        value={form.inmediato_transferencia}
                        onChange={e => {
                          const max  = totalVenta - cupoFiadoDisponible
                          const val  = e.target.value.replace(/\D/g, '')
                          const num  = Math.min(parseFloat(val) || 0, max)
                          const diff = Math.max(0, max - num)
                          setForm(f => ({
                            ...f,
                            inmediato_transferencia: String(num),
                            inmediato_efectivo:      diff > 0 ? String(diff) : '',
                          }))
                        }}
                        placeholder="0"
                        className="campo-input text-xs"
                      />
                    </div>
                  </div>
                  {(() => {
                    const max  = totalVenta - cupoFiadoDisponible
                    const suma = parseFloat(form.inmediato_efectivo || 0) +
                                 parseFloat(form.inmediato_transferencia || 0)
                    if (suma > 0 && Math.abs(suma - max) < 1)
                      return <p className="text-xs text-primary">✓ Montos correctos</p>
                    if (suma > 0)
                      return <p className="text-xs text-red-400">
                        La suma ({formatPrecio(suma)}) no coincide (
                        {formatPrecio(max)})
                      </p>
                    return null
                  })()}
                </div>
              )}
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
                tipo_pago:                 t.val,
                monto_fiado_personalizado: null,
                inmediato_mixto:           false,
                inmediato_efectivo:        '',
                inmediato_transferencia:   '',
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