import { useRef, useEffect } from 'react'
import Modal from '@shared/components/Modal'
import { Search, Scan, Trash2, CreditCard, Clock } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'

export default function VentaForm({
  modalNuevo, setModalNuevo, form, setForm,
  clientes, clientesFiltrados, clienteBusqueda, setClienteBusqueda,
  prodBusqueda, prodsFiltrados, buscarProducto, buscarPorCodigo,
  agregarProducto, quitarProducto, cambiarCantidad, totalVenta, handleCrear, creando
}) {
  const cerrar = () => {
    setModalNuevo(false)
    setForm({ tipo_cliente:'registrado', cliente_id:'', cliente_nombre:'', productos:[], tipo_pago:'total' })
  }
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handler = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setClienteBusqueda('')
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [setClienteBusqueda])

  const seleccionarCliente = c => {
    setForm(f => ({ ...f, cliente_id: c.id, tipo_pago: 'total' }))
    setClienteBusqueda('')
  }

  const clienteSeleccionado = clientes.find(c => c.id === +form.cliente_id)
  const permitefiado = clienteSeleccionado?.permite_fiado

  return (
    <Modal abierto={modalNuevo} onCerrar={cerrar} titulo="Nueva Venta — Mostrador" ancho="max-w-xl">
      <form onSubmit={handleCrear} className="space-y-4">

        {/* banner tipo pago */}
        <div className={`flex items-center gap-2 p-3 rounded-xl border ${
          form.tipo_pago === 'fiado'
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-primary/10 border-primary/30'
        }`}>
          {form.tipo_pago === 'fiado'
            ? <Clock size={15} className="text-amber-500 shrink-0" />
            : <CreditCard size={15} className="text-primary shrink-0" />
          }
          <div>
            <p className={`text-xs font-semibold ${form.tipo_pago === 'fiado' ? 'text-amber-500' : 'text-primary'}`}>
              {form.tipo_pago === 'fiado' ? 'Venta a Crédito (Fiado)' : 'Venta en Mostrador'}
            </p>
            <p className="text-xs text-gray-500">
              {form.tipo_pago === 'fiado'
                ? 'El cliente pagará después — quedará como pendiente'
                : 'Se registrará automáticamente como pagada'}
            </p>
          </div>
        </div>

        {/* cliente */}
        <div>
          <label className="campo-label">Cliente</label>
          <div className="flex gap-2 mb-2">
            {[{ val:'registrado', label:'Cliente Registrado' }, { val:'manual', label:'Nombre Manual' }].map(t => (
              <button key={t.val} type="button"
                onClick={() => { setForm(f => ({ ...f, tipo_cliente: t.val, cliente_id: '', cliente_nombre: '', tipo_pago: 'total' })); setClienteBusqueda('') }}
                className={`px-3 py-1 text-xs rounded-full border ${form.tipo_cliente === t.val ? 'bg-primary text-dark-bg border-primary' : 'border-gray-200 dark:border-dark-border text-gray-500'}`}>
                {t.label}
              </button>
            ))}
          </div>

          {form.tipo_cliente === 'registrado' ? (
            <div className="space-y-1" ref={dropdownRef}>
              {clienteSeleccionado && !clienteBusqueda ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-primary/40 bg-primary/5 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-primary">{clienteSeleccionado.nombre} {clienteSeleccionado.apellido}</span>
                    {permitefiado && <span className="badge-pendiente">Fiado habilitado</span>}
                  </div>
                  <button type="button"
                    onClick={() => { setForm(f => ({ ...f, cliente_id: '', tipo_pago: 'total' })); setClienteBusqueda('') }}
                    className="text-gray-400 hover:text-red-400 ml-2">✕</button>
                </div>
              ) : (
                <div className="relative">
                  <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                  <input
                    value={clienteBusqueda}
                    onChange={e => { setClienteBusqueda(e.target.value); setForm(f => ({ ...f, cliente_id: '', tipo_pago: 'total' })) }}
                    className="campo-input pl-8 text-xs"
                    placeholder="Buscar cliente por nombre..."
                  />
                  {clienteBusqueda && clientesFiltrados.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-30 bg-light-card dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                      {clientesFiltrados.map(c => (
                        <button key={c.id} type="button"
                          onMouseDown={e => { e.preventDefault(); seleccionarCliente(c) }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 flex justify-between text-light-text dark:text-dark-text">
                          <div className="flex items-center gap-2">
                            <span>{c.nombre} {c.apellido}</span>
                            {c.permite_fiado && <span className="badge-pendiente text-xs">Fiado</span>}
                          </div>
                          {c.telefono && <span className="text-gray-400">{c.telefono}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* selector tipo pago — solo si hay cliente seleccionado */}
              {clienteSeleccionado && (
                <div className="flex gap-2 pt-1">
                  <button type="button"
                    onClick={() => setForm(f => ({ ...f, tipo_pago: 'total' }))}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-all ${
                      form.tipo_pago === 'total'
                        ? 'bg-primary text-dark-bg border-primary font-medium'
                        : 'border-gray-200 dark:border-dark-border text-gray-500 hover:border-primary/40'
                    }`}>
                    <CreditCard size={12} /> Pago Total
                  </button>
                  <button type="button"
                    disabled={!permitefiado}
                    onClick={() => permitefiado && setForm(f => ({ ...f, tipo_pago: 'fiado' }))}
                    title={!permitefiado ? 'Este cliente no tiene habilitado el fiado' : ''}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs rounded-lg border transition-all ${
                      form.tipo_pago === 'fiado'
                        ? 'bg-amber-500 text-white border-amber-500 font-medium'
                        : permitefiado
                          ? 'border-gray-200 dark:border-dark-border text-gray-500 hover:border-amber-400/50 hover:text-amber-500'
                          : 'border-gray-200 dark:border-dark-border text-gray-300 dark:text-dark-text/20 cursor-not-allowed opacity-50'
                    }`}>
                    <Clock size={12} /> Fiado
                  </button>
                </div>
              )}
            </div>
          ) : (
            <input value={form.cliente_nombre} onChange={e => setForm(f => ({ ...f, cliente_nombre: e.target.value }))}
              className="campo-input" placeholder="Nombre del cliente" />
          )}
        </div>

        {/* productos */}
        <div className="p-3 rounded-xl border border-gray-200 dark:border-dark-border space-y-2">
          <p className="text-xs font-semibold">Productos</p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input value={prodBusqueda} onChange={e => buscarProducto(e.target.value)}
                className="campo-input pl-8 text-xs" placeholder="Buscar por nombre o código..." />
              {prodsFiltrados.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 bg-light-card dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                  {prodsFiltrados.map(p => (
                    <button key={p.id} type="button" onClick={() => agregarProducto(p)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 flex justify-between">
                      <div>
                        <span>{p.nombre}</span>
                        {p.codigo_barras && <span className="text-gray-400 font-mono ml-2">{p.codigo_barras}</span>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-gray-400">Stock: {p.stock}</span>
                        <span className="text-primary">{formatPrecio(p.precio)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <input placeholder="Cód. barras" className="campo-input w-28 text-xs pr-7"
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); buscarPorCodigo(e.target.value); e.target.value='' } }} />
              <Scan size={12} className="absolute right-2 top-2.5 text-gray-400" />
            </div>
          </div>

          {form.productos.length > 0 && (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {form.productos.map((p, i) => {
                const stock = p.stock ?? Infinity
                const cantInvalida = !p.cantidad || +p.cantidad < 1
                const excede = !cantInvalida && stock !== Infinity && +p.cantidad > stock
                const hayError = cantInvalida || excede
                return (
                  <div key={i} className="flex flex-col">
                    <div className="flex justify-between items-center text-xs p-2 rounded bg-light-bg dark:bg-dark-bg">
                      <span className="flex-1 truncate">{p.nombre}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1">
                          <button type="button"
                            onClick={() => cambiarCantidad(i, Math.max(1, (+p.cantidad || 2) - 1))}
                            disabled={!p.cantidad || +p.cantidad <= 1}
                            className="w-5 h-5 rounded bg-gray-200 dark:bg-dark-border flex items-center justify-center text-xs font-bold disabled:opacity-40 hover:bg-primary/20 transition-colors">−</button>
                          <input type="text" inputMode="numeric" value={p.cantidad}
                            onChange={e => {
                              const val = e.target.value
                              if (val === '') { cambiarCantidad(i, ''); return }
                              if (/^\d+$/.test(val)) cambiarCantidad(i, val)
                            }}
                            className={`w-10 text-center text-xs rounded border px-1 py-0.5 bg-transparent focus:outline-none focus:ring-1 ${
                              hayError ? 'border-red-400 focus:ring-red-400/30 text-red-400' : 'border-gray-200 dark:border-dark-border focus:ring-primary/20'
                            }`} />
                          <button type="button"
                            onClick={() => cambiarCantidad(i, (+p.cantidad || 0) + 1)}
                            disabled={stock !== Infinity && +p.cantidad >= stock}
                            className="w-5 h-5 rounded bg-gray-200 dark:bg-dark-border flex items-center justify-center text-xs font-bold disabled:opacity-40 hover:bg-primary/20 transition-colors">+</button>
                        </div>
                        <span className={`font-medium w-16 text-right ${hayError ? 'text-red-400' : 'text-primary'}`}>
                          {formatPrecio(p.precio_unitario * (+p.cantidad || 0))}
                        </span>
                        <button type="button" onClick={() => quitarProducto(i)} className="text-red-400 hover:text-red-500">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    {hayError && (
                      <p className="text-xs text-red-400 px-2 pb-0.5">
                        ⚠ {cantInvalida ? 'La cantidad debe ser al menos 1' : `Solo hay ${stock} unidades disponibles`}
                      </p>
                    )}
                  </div>
                )
              })}
              <div className="flex justify-between text-xs font-bold pt-1 border-t border-gray-200 dark:border-dark-border">
                <span>Total</span>
                <span className="text-primary">{formatPrecio(totalVenta)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
          <button type="button" onClick={cerrar} className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
          <button type="submit"
            disabled={creando || form.productos.some(p => !p.cantidad || +p.cantidad < 1 || (p.stock !== undefined && +p.cantidad > p.stock))}
            className={`btn-primary disabled:opacity-50 ${form.tipo_pago === 'fiado' ? '!bg-amber-500 hover:!bg-amber-500/90' : ''}`}>
            {creando ? 'Registrando...' : form.tipo_pago === 'fiado' ? 'Registrar Fiado' : 'Aceptar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}