import Modal from '@shared/components/Modal'
import { Search, User, CreditCard } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'

export default function PagoForm({
  modalNuevo, setModalNuevo,
  form, setForm, errores,
  clienteSel,
  clientesFiltradosModal,
  clienteBusqueda, setClienteBusqueda,
  clienteDropdown, setClienteDropdown,
  deudaCliente, deudaPorCliente,
  totalDeuda, pedidosCliente,
  pagoCompleto, montoPendiente,
  handleSubmit, handleMontoChange,
  creando, tipoPagoActual,
  // legacy props — no usados pero recibidos desde Ventas.jsx sin romper
  pedidos, pedidoSeleccionado, totalPedido, totalPagado, esFiado,
  pedidoBusqueda, setPedidoBusqueda, pedidoDropdown, setPedidoDropdown,
  handlePedidoChange,
}) {
  const cerrar = () => {
    setModalNuevo(false)
    setClienteBusqueda('')
    setClienteDropdown(false)
  }

  const seleccionarCliente = c => {
    setForm(f => ({ ...f, cliente_id: String(c.id), monto: '' }))
    setClienteBusqueda('')
    setClienteDropdown(false)
  }

  const deudaDeCliente = c => {
    if (!deudaPorCliente) return 0
    return deudaPorCliente[c.id]?.total_deuda || 0
  }

  return (
    <Modal abierto={modalNuevo} onCerrar={cerrar} bloquearCierre titulo="Registrar Abono">
      <form onSubmit={handleSubmit} className="space-y-3">

        {/* ── Buscar cliente ── */}
        <div>
          <label className="campo-label">Cliente *</label>

          {clienteSel && !clienteDropdown ? (
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-primary/40 bg-primary/5 text-xs">
              <div className="flex items-center gap-2">
                <User size={13} className="text-primary shrink-0" />
                <div>
                  <span className="font-semibold text-primary">
                    {clienteSel.nombre} {clienteSel.apellido}
                  </span>
                  {clienteSel.numero_documento && (
                    <span className="text-gray-400 ml-2">
                      {clienteSel.tipo_documento || 'CC'}: {clienteSel.numero_documento}
                    </span>
                  )}
                </div>
              </div>
              <button type="button"
                onClick={() => {
                  setForm(f => ({ ...f, cliente_id: '', monto: '' }))
                  setClienteBusqueda('')
                }}
                className="text-gray-400 hover:text-red-400 ml-2 text-base leading-none">
                ✕
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                value={clienteBusqueda}
                onChange={e => { setClienteBusqueda(e.target.value); setClienteDropdown(true) }}
                onFocus={() => setClienteDropdown(true)}
                onBlur={() => setTimeout(() => setClienteDropdown(false), 150)}
                className={`campo-input pl-8 text-xs ${errores.cliente_id ? 'border-red-400' : ''}`}
                placeholder="Buscar por nombre o número de documento..."
                autoComplete="off"
              />
              {/* Dropdown clientes con deuda */}
              {clienteDropdown && clientesFiltradosModal.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-52 overflow-y-auto">
                  {clientesFiltradosModal.map(c => (
                    <button key={c.id} type="button"
                      onMouseDown={e => { e.preventDefault(); seleccionarCliente(c) }}
                      className="w-full text-left px-3 py-2.5 text-xs hover:bg-primary/10 flex items-center justify-between border-b border-gray-100 last:border-0">
                      <div>
                        <span className="font-medium text-light-text">
                          {c.nombre} {c.apellido}
                        </span>
                        {c.numero_documento && (
                          <span className="text-gray-400 ml-2">
                            {c.tipo_documento || 'CC'}: {c.numero_documento}
                          </span>
                        )}
                      </div>
                      <span className="text-red-500 font-semibold shrink-0 ml-3">
                        {formatPrecio(deudaDeCliente(c))}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              {clienteDropdown && clienteBusqueda && clientesFiltradosModal.length === 0 && (
                <div className="absolute top-full left-0 right-0 z-30 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 p-3 text-xs text-gray-400 text-center">
                  Sin clientes con deuda pendiente
                </div>
              )}
            </div>
          )}
          {errores.cliente_id && <p className="campo-error">{errores.cliente_id}</p>}
        </div>

        {/* ── Resumen deuda ── */}
        {clienteSel && deudaCliente && (
          <div className="rounded-lg border border-red-100 overflow-hidden text-xs">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 bg-red-50">
              <span className="font-semibold text-red-600 flex items-center gap-1.5">
                <CreditCard size={13} />
                Deuda total
              </span>
              <span className="text-red-600 font-bold text-sm">
                {formatPrecio(totalDeuda)}
              </span>
            </div>
            {/* Desglose por pedido */}
            {pedidosCliente.length > 0 && (
              <div className="divide-y divide-red-50 bg-white">
                {pedidosCliente.map(p => (
                  <div key={p.id} className="flex justify-between items-center px-3 py-1.5 text-gray-500">
                    <span>Pedido #{p.id}</span>
                    <span className="font-medium text-red-500">{formatPrecio(p.pendiente)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {clienteSel && pagoCompleto && (
          <div className="p-2.5 rounded-lg bg-green-50 border border-green-100 text-xs text-green-600 text-center font-medium">
            ✓ Este cliente no tiene deuda pendiente
          </div>
        )}

        {/* ── Monto + método ── */}
        {clienteSel && !pagoCompleto && (
          <div className="grid grid-cols-2 gap-3 items-start">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="campo-label mb-0">Monto a abonar *</label>
                {tipoPagoActual && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    tipoPagoActual === 'total' ? 'badge-activo' : 'badge-pendiente'
                  }`}>
                    {tipoPagoActual === 'total' ? '✓ Cancela deuda' : '~ Abono parcial'}
                  </span>
                )}
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={form.monto}
                onChange={e => handleMontoChange(e.target.value.replace(/\D/g, ''))}
                className={`campo-input ${errores.monto ? 'border-red-400 focus:ring-red-400/30' : ''}`}
                placeholder="0"
              />
              {errores.monto && <p className="campo-error">{errores.monto}</p>}
              {totalDeuda > 0 && (
                <button type="button"
                  onClick={() => handleMontoChange(String(Math.round(totalDeuda)))}
                  className="text-xs text-primary mt-1 hover:underline">
                  Usar deuda total ({formatPrecio(totalDeuda)})
                </button>
              )}
            </div>
            <div>
              <label className="campo-label">Método de Pago</label>
              <select
                value={form.metodo}
                onChange={e => setForm(p => ({ ...p, metodo: e.target.value }))}
                className="campo-input">
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button type="submit"
            disabled={creando || pagoCompleto || !!errores.monto || !form.cliente_id || !form.monto}
            className="btn-primary disabled:opacity-50">
            {creando ? 'Registrando...' : 'Aceptar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}