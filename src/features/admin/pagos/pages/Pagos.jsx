import Modal from '@shared/components/Modal'
import { Search } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'

export default function PagoForm({
  modalNuevo, setModalNuevo, form, setForm, errores,
  pedidos, totalPedido, totalPagado, montoPendiente, pagoCompleto,
  handleSubmit, creando, tipoPagoActual, esFiado,
  pedidoBusqueda, setPedidoBusqueda, pedidoDropdown, setPedidoDropdown,
}) {
  const cerrar = () => {
    setModalNuevo(false)
    setPedidoBusqueda('')
    setPedidoDropdown(false)
  }

  const handleMonto = e => {
    const val = e.target.value
    if (montoPendiente > 0 && +val > montoPendiente) {
      setForm(p => ({ ...p, monto: montoPendiente }))
    } else {
      setForm(p => ({ ...p, monto: val }))
    }
  }

  const pedidoSeleccionado = pedidos.find(p => p.id === +form.pedido_id)

  const pedidosFiltrados = pedidos.filter(p => {
    if (!pedidoBusqueda) return true
    const t = pedidoBusqueda.toLowerCase()
    return (
      String(p.id).includes(t) ||
      (p.cliente || '').toLowerCase().includes(t)
    )
  }).slice(0, 8)

  const seleccionarPedido = p => {
    setForm(f => ({ ...f, pedido_id: p.id, monto: '' }))
    setPedidoBusqueda('')
    setPedidoDropdown(false)
  }

  return (
    <Modal abierto={modalNuevo} onCerrar={cerrar} titulo="Registrar Pago">
      <form onSubmit={handleSubmit} className="space-y-3">

        {/* buscador de pedido */}
        <div>
          <label className="campo-label">Pedido *</label>
          {pedidoSeleccionado && !pedidoDropdown ? (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-primary/40 bg-primary/5 text-xs">
              <div>
                <span className="font-medium text-primary">#{pedidoSeleccionado.id}</span>
                <span className="text-gray-400 ml-2">{pedidoSeleccionado.cliente}</span>
                <span className="text-primary ml-2">{formatPrecio(pedidoSeleccionado.total)}</span>
              </div>
              <button type="button"
                onClick={() => { setForm(f => ({ ...f, pedido_id: '', monto: '' })); setPedidoBusqueda('') }}
                className="text-gray-400 hover:text-red-400 ml-2">✕</button>
            </div>
          ) : (
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input
                value={pedidoBusqueda}
                onChange={e => { setPedidoBusqueda(e.target.value); setPedidoDropdown(true) }}
                onFocus={() => setPedidoDropdown(true)}
                onBlur={() => setTimeout(() => setPedidoDropdown(false), 150)}
                className={`campo-input pl-8 text-xs ${errores.pedido_id ? 'border-red-400' : ''}`}
                placeholder="Buscar por # o nombre del cliente..."
              />
              {pedidoDropdown && pedidosFiltrados.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 bg-light-card dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {pedidosFiltrados.map(p => {
                    const esFiadoPedido = p.permite_fiado
                    return (
                      <button key={p.id} type="button"
                        onMouseDown={e => { e.preventDefault(); seleccionarPedido(p) }}
                        className="w-full text-left px-3 py-2.5 text-xs hover:bg-primary/10 flex items-center justify-between border-b border-gray-100 dark:border-dark-border/40 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-primary">#{p.id}</span>
                          <span className="text-light-text dark:text-dark-text">{p.cliente}</span>
                          {esFiadoPedido && (
                            <span className="badge-pendiente text-xs">Fiado</span>
                          )}
                        </div>
                        <span className="text-primary font-medium shrink-0">{formatPrecio(p.total)}</span>
                      </button>
                    )
                  })}
                </div>
              )}
              {pedidoDropdown && pedidoBusqueda && pedidosFiltrados.length === 0 && (
                <div className="absolute top-full left-0 right-0 z-30 bg-light-card dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg mt-1 p-3 text-xs text-gray-400 text-center">
                  Sin pedidos pendientes
                </div>
              )}
            </div>
          )}
          {errores.pedido_id && <p className="campo-error">{errores.pedido_id}</p>}
        </div>

        {esFiado && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-500">
            <span className="font-medium">Cliente con fiado habilitado</span>
          </div>
        )}

        {form.pedido_id && (
          <div className="p-3 rounded-lg bg-light-bg dark:bg-dark-bg text-xs space-y-1">
            <div className="flex justify-between"><span className="text-gray-400">Total pedido</span><span>{formatPrecio(totalPedido)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Ya pagado</span><span className="text-green-400">{formatPrecio(totalPagado)}</span></div>
            <div className="flex justify-between font-semibold border-t border-gray-200 dark:border-dark-border pt-1">
              <span>Pendiente</span>
              <span className={pagoCompleto ? 'text-green-400' : 'text-primary'}>
                {pagoCompleto ? '✓ Completamente pagado' : formatPrecio(montoPendiente)}
              </span>
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="campo-label mb-0">Monto *</label>
            {tipoPagoActual && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                tipoPagoActual === 'total' ? 'badge-activo' : 'badge-pendiente'
              }`}>
                {tipoPagoActual === 'total' ? '✓ Pago total' : '~ Abono parcial'}
              </span>
            )}
          </div>
          <input
            type="number" step="0.01" min="0.01"
            max={montoPendiente > 0 ? montoPendiente : undefined}
            value={form.monto}
            onChange={handleMonto}
            className={`campo-input ${errores.monto ? 'border-red-400' : ''}`}
            placeholder="0.00"
            disabled={pagoCompleto}
          />
          {errores.monto && <p className="campo-error">{errores.monto}</p>}
          {!pagoCompleto && montoPendiente > 0 && (
            <button type="button" onClick={() => setForm(p => ({ ...p, monto: montoPendiente }))}
              className="text-xs text-primary mt-1 hover:underline">
              Usar monto pendiente ({formatPrecio(montoPendiente)})
            </button>
          )}
        </div>

        <div>
          <label className="campo-label">Método de Pago</label>
          <select value={form.metodo} onChange={e => setForm(p => ({ ...p, metodo: e.target.value }))} className="campo-input">
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="nequi">Nequi</option>
            <option value="daviplata">Daviplata</option>
            <option value="tarjeta">Tarjeta</option>
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
          <button type="button" onClick={cerrar} className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
          <button type="submit"
            disabled={creando || pagoCompleto || +form.monto > montoPendiente}
            className="btn-primary disabled:opacity-50">
            {creando ? 'Registrando...' : 'Aceptar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}