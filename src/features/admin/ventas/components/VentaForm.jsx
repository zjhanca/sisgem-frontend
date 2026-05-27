import Modal from '@shared/components/Modal'
import { Search, Scan, Trash2 } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'
 
export default function VentaForm({
  modalNuevo, setModalNuevo, form, setForm,
  clientes, clientesFiltrados, clienteBusqueda, setClienteBusqueda,
  prodBusqueda, prodsFiltrados, buscarProducto, buscarPorCodigo,
  agregarProducto, quitarProducto, totalVenta, handleCrear, creando
}) {
  const cerrar = () => { setModalNuevo(false); setForm({ tipo_cliente:'registrado', cliente_id:'', cliente_nombre:'', productos:[] }) }
  return (
    <Modal abierto={modalNuevo} onCerrar={cerrar} titulo="Nueva Venta — Mostrador" ancho="max-w-xl">
      <form onSubmit={handleCrear} className="space-y-4">
        <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/30">
          <div>
            <p className="text-xs font-semibold text-primary">Venta en Mostrador</p>
            <p className="text-xs text-gray-500">Se registrará automáticamente como pagada</p>
          </div>
        </div>
 
        <div>
          <label className="campo-label">Cliente</label>
          <div className="flex gap-2 mb-2">
            {[{ val:'registrado', label:'Cliente Registrado' }, { val:'manual', label:'Nombre Manual' }].map(t => (
              <button key={t.val} type="button"
                onClick={() => { setForm(f => ({ ...f, tipo_cliente: t.val, cliente_id: '', cliente_nombre: '' })); setClienteBusqueda('') }}
                className={`px-3 py-1 text-xs rounded-full border ${form.tipo_cliente === t.val ? 'bg-primary text-dark-bg border-primary' : 'border-gray-200 dark:border-dark-border text-gray-500'}`}>
                {t.label}
              </button>
            ))}
          </div>
          {form.tipo_cliente === 'registrado' ? (
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input value={clienteBusqueda} onChange={e => setClienteBusqueda(e.target.value)}
                className="campo-input pl-8 text-xs" placeholder="Buscar cliente por nombre..." />
              {clienteBusqueda && clientesFiltrados.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 bg-light-card dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                  {clientesFiltrados.map(c => (
                    <button key={c.id} type="button"
                      onClick={() => { setForm(f => ({ ...f, cliente_id: c.id })); setClienteBusqueda(`${c.nombre} ${c.apellido}`) }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-primary/10 flex justify-between ${form.cliente_id === c.id ? 'text-primary' : 'text-light-text dark:text-dark-text'}`}>
                      <span>{c.nombre} {c.apellido}</span>
                      {c.telefono && <span className="text-gray-400">{c.telefono}</span>}
                    </button>
                  ))}
                </div>
              )}
              {form.cliente_id && (
                <p className="text-xs text-primary mt-1">✓ {clientes.find(c => c.id === +form.cliente_id)?.nombre} {clientes.find(c => c.id === +form.cliente_id)?.apellido}</p>
              )}
            </div>
          ) : (
            <input value={form.cliente_nombre} onChange={e => setForm(f => ({ ...f, cliente_nombre: e.target.value }))}
              className="campo-input" placeholder="Nombre del cliente" />
          )}
        </div>
 
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
                      <div><span>{p.nombre}</span>{p.codigo_barras && <span className="text-gray-400 font-mono ml-2">{p.codigo_barras}</span>}</div>
                      <span className="text-primary">{formatPrecio(p.precio)}</span>
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
            <div className="space-y-1 max-h-36 overflow-y-auto">
              {form.productos.map((p, i) => (
                <div key={i} className="flex justify-between items-center text-xs p-2 rounded bg-light-bg dark:bg-dark-bg">
                  <span className="flex-1 truncate">{p.nombre}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setForm(f => ({ ...f, productos: f.productos.map((pp,ii) => ii===i ? {...pp, cantidad: Math.max(1,pp.cantidad-1)} : pp) }))} className="w-5 h-5 rounded bg-gray-200 dark:bg-dark-border text-center text-xs leading-5">-</button>
                      <span className="w-5 text-center">{p.cantidad}</span>
                      <button type="button" onClick={() => setForm(f => ({ ...f, productos: f.productos.map((pp,ii) => ii===i ? {...pp, cantidad:pp.cantidad+1} : pp) }))} className="w-5 h-5 rounded bg-gray-200 dark:bg-dark-border text-center text-xs leading-5">+</button>
                    </div>
                    <span className="text-primary font-medium w-16 text-right">{formatPrecio(p.precio_unitario * p.cantidad)}</span>
                    <button type="button" onClick={() => quitarProducto(i)} className="text-red-400"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between text-xs font-bold pt-1 border-t border-gray-200 dark:border-dark-border">
                <span>Total</span><span className="text-primary">{formatPrecio(totalVenta)}</span>
              </div>
            </div>
          )}
        </div>
 
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
          <button type="button" onClick={cerrar} className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
          <button type="submit" disabled={creando} className="btn-primary">{creando ? 'Registrando...' : 'Aceptar'}</button>
        </div>
      </form>
    </Modal>
  )
}
