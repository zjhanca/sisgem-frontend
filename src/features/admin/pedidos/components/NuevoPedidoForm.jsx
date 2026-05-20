import Modal from '@shared/components/Modal'
import { Search, Scan, Trash2, ShoppingCart, Bike, MapPin } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'
 
export default function NuevoPedidoForm({
  modalNuevo, setModalNuevo, form, setF, setForm,
  clientes, clientesFiltrados, clienteBusqueda, setClienteBusqueda,
  prodBusqueda, prodsFiltrados, buscarProducto, buscarPorCodigo,
  agregarProducto, quitarProducto, totalPedido,
  handleCrear, creando, barcodeRef,
  tarifas, direcciones,
}) {
  const cerrar = () => { setModalNuevo(false); setForm(f => ({ ...f, tipo_cliente:'registrado', cliente_id:'', cliente_nombre:'', tipo_venta:'mostrador', notas:'', productos:[], dom_tipo_dir:'registrada', dom_direccion_id:'', dom_direccion_manual:'', dom_tarifa_id:'' })); setClienteBusqueda('') }
  return (
    <Modal abierto={modalNuevo} onCerrar={cerrar} titulo="Nuevo Pedido" ancho="max-w-2xl">
      <form onSubmit={handleCrear} className="space-y-4">
 
        {/* tipo venta */}
        <div>
          <label className="campo-label">Tipo de Venta</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {[{ val:'mostrador', label:'Mostrador', Icon:ShoppingCart, color:'primary' }, { val:'domicilio', label:'Domicilio', Icon:Bike, color:'blue' }].map(({ val, label, Icon, color }) => (
              <button key={val} type="button" onClick={() => setF('tipo_venta', val)}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  form.tipo_venta === val
                    ? color==='primary' ? 'border-primary bg-primary/10 text-primary' : 'border-blue-500 bg-blue-500/10 text-blue-500'
                    : 'border-gray-200 dark:border-dark-border text-gray-500'
                }`}>
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        </div>
 
        {/* cliente */}
        <div>
          <label className="campo-label">Cliente</label>
          <div className="flex gap-2 mb-2">
            {[{ val:'registrado', label:'Cliente Registrado' }, { val:'manual', label:'Nombre Manual' }].map(t => (
              <button key={t.val} type="button"
                onClick={() => { setF('tipo_cliente', t.val); setF('cliente_id',''); setF('cliente_nombre',''); setClienteBusqueda('') }}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${form.tipo_cliente===t.val ? 'bg-primary text-dark-bg border-primary' : 'border-gray-200 dark:border-dark-border text-gray-500'}`}>
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
                      onClick={() => { setF('cliente_id', c.id); setClienteBusqueda(`${c.nombre} ${c.apellido}`) }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-primary/10 flex justify-between ${form.cliente_id===c.id ? 'text-primary' : 'text-light-text dark:text-dark-text'}`}>
                      <span>{c.nombre} {c.apellido}</span>
                      {c.telefono && <span className="text-gray-400">{c.telefono}</span>}
                    </button>
                  ))}
                </div>
              )}
              {form.cliente_id && <p className="text-xs text-primary mt-1">✓ {clientes.find(c => c.id === +form.cliente_id)?.nombre} {clientes.find(c => c.id === +form.cliente_id)?.apellido}</p>}
            </div>
          ) : (
            <input value={form.cliente_nombre} onChange={e => setF('cliente_nombre', e.target.value)}
              className="campo-input" placeholder="Nombre del cliente ocasional" />
          )}
        </div>
 
        {/* productos */}
        <div className="p-3 rounded-xl border border-gray-200 dark:border-dark-border space-y-3">
          <p className="text-xs font-semibold">Productos</p>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input value={prodBusqueda} onChange={e => buscarProducto(e.target.value)}
                className="campo-input pl-8 text-xs" placeholder="Buscar por nombre o código..." />
              {prodsFiltrados.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 bg-light-card dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
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
              <input ref={barcodeRef} placeholder="Cód. barras" className="campo-input w-28 text-xs pr-7"
                onKeyDown={e => { if (e.key==='Enter') { e.preventDefault(); buscarPorCodigo(e.target.value); e.target.value='' } }} />
              <Scan size={13} className="absolute right-2 top-2.5 text-gray-400" />
            </div>
          </div>
          {form.productos.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {form.productos.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-light-bg dark:bg-dark-bg">
                  <span className="flex-1 truncate mr-2">{p.nombre}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => setForm(f => ({ ...f, productos: f.productos.map((pp,ii) => ii===i ? {...pp, cantidad:Math.max(1,pp.cantidad-1)} : pp) }))} className="w-5 h-5 rounded bg-gray-200 dark:bg-dark-border text-center text-xs leading-5">-</button>
                      <span className="w-6 text-center font-medium">{p.cantidad}</span>
                      <button type="button" onClick={() => setForm(f => ({ ...f, productos: f.productos.map((pp,ii) => ii===i ? {...pp, cantidad:pp.cantidad+1} : pp) }))} className="w-5 h-5 rounded bg-gray-200 dark:bg-dark-border text-center text-xs leading-5">+</button>
                    </div>
                    <span className="text-primary font-medium w-16 text-right">{formatPrecio(p.precio_unitario * p.cantidad)}</span>
                    <button type="button" onClick={() => quitarProducto(i)} className="text-red-400"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between text-xs font-semibold pt-2 border-t border-gray-200 dark:border-dark-border">
                <span>Total</span><span className="text-primary text-sm">{formatPrecio(totalPedido)}</span>
              </div>
            </div>
          )}
        </div>
 
        {/* sección domicilio */}
        {form.tipo_venta === 'domicilio' && (
          <div className="p-3 rounded-xl border-2 border-blue-400/40 bg-blue-50/30 dark:bg-blue-500/5 space-y-3">
            <div className="flex items-center gap-2"><MapPin size={14} className="text-blue-500" /><p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Información del Domicilio</p></div>
            <div>
              <label className="campo-label">Dirección de Envío</label>
              {form.tipo_cliente === 'registrado' && form.cliente_id && direcciones.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {[{ val:'registrada', label:'Guardada' }, { val:'manual', label:'Manual' }].map(t => (
                    <button key={t.val} type="button" onClick={() => setF('dom_tipo_dir', t.val)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${form.dom_tipo_dir===t.val ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 dark:border-dark-border text-gray-500'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
              {form.dom_tipo_dir === 'registrada' && form.cliente_id && direcciones.length > 0 ? (
                <select value={form.dom_direccion_id} onChange={e => setF('dom_direccion_id', e.target.value)} className="campo-input text-xs">
                  <option value="">Seleccionar dirección guardada...</option>
                  {direcciones.map(d => <option key={d.id} value={d.id}>{d.direccion}{d.barrio ? ` — ${d.barrio}` : ''}</option>)}
                </select>
              ) : (
                <input value={form.dom_direccion_manual} onChange={e => setF('dom_direccion_manual', e.target.value)}
                  className="campo-input text-xs" placeholder="Barrio, dirección completa, indicaciones..." />
              )}
            </div>
            <div>
              <label className="campo-label">Tarifa por Barrio</label>
              <select value={form.dom_tarifa_id} onChange={e => setF('dom_tarifa_id', e.target.value)} className="campo-input text-xs">
                <option value="">Seleccionar tarifa...</option>
                {tarifas.map(t => <option key={t.id} value={t.id}>{t.barrio}{t.zona ? ` (${t.zona})` : ''} — {formatPrecio(t.tarifa)}</option>)}
              </select>
              {form.dom_tarifa_id && <p className="text-xs text-blue-500 mt-1 font-medium">Tarifa: {formatPrecio(tarifas.find(t => t.id === +form.dom_tarifa_id)?.tarifa || 0)}</p>}
            </div>
          </div>
        )}
 
        <div>
          <label className="campo-label">Notas / Observaciones (Opcional)</label>
          <textarea value={form.notas} onChange={e => setF('notas', e.target.value)} rows={2} className="campo-input resize-none" placeholder="Instrucciones especiales..." />
        </div>
 
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
          <button type="button" onClick={cerrar} className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
          <button type="submit" disabled={creando} className="btn-primary">{creando ? 'Creando...' : 'Aceptar'}</button>
        </div>
      </form>
    </Modal>
  )
}
