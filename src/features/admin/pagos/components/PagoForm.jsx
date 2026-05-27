import Modal from '@shared/components/Modal'
import { formatPrecio } from '@shared/utils/validaciones'

export default function PagoForm({ modalNuevo, setModalNuevo, form, setForm, errores, pedidos, totalPedido, totalPagado, montoPendiente, pagoCompleto, handleSubmit, creando }) {
  const cerrar = () => { setModalNuevo(false) }

  const handleMonto = e => {
    const val = e.target.value
    // no permitir valor mayor al pendiente
    if (montoPendiente > 0 && +val > montoPendiente) {
      setForm(p => ({ ...p, monto: montoPendiente }))
    } else {
      setForm(p => ({ ...p, monto: val }))
    }
  }

  return (
    <Modal abierto={modalNuevo} onCerrar={cerrar} titulo="Registrar Pago">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="campo-label">Pedido *</label>
          <select value={form.pedido_id} onChange={e => setForm(p => ({ ...p, pedido_id: e.target.value }))}
            className={`campo-input ${errores.pedido_id ? 'border-red-400' : ''}`}>
            <option value="">Seleccionar pedido...</option>
            {pedidos.map(p => <option key={p.id} value={p.id}>#{p.id} — {p.cliente} — {formatPrecio(p.total)}</option>)}
          </select>
          {errores.pedido_id && <p className="campo-error">{errores.pedido_id}</p>}
        </div>

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
          <label className="campo-label">Monto *</label>
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
          {!pagoCompleto && montoPendiente > 0 && form.monto && +form.monto > montoPendiente && (
            <p className="campo-error">El monto no puede superar {formatPrecio(montoPendiente)}</p>
          )}
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
            disabled={creando || pagoCompleto || (+form.monto > montoPendiente)}
            className="btn-primary disabled:opacity-50">
            {creando ? 'Registrando...' : 'Aceptar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}