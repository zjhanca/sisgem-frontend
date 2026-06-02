import Modal from '@shared/components/Modal'
import { Search, Scan, Trash2, Upload } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'

const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Crédito']

export default function OrdenForm({
  modalNuevo, setModalNuevo, form, setForm, itemForm, setItemForm,
  proveedores, productos, prodBusqueda, prodsFiltrados, provBusqueda,
  provsFiltrados, provSeleccionado, buscarProveedor, buscarProducto,
  buscarPorCodigo, agregarItem, quitarItem, setProvSeleccionado,
  setProvBusqueda, setProdBusqueda, setProdsFiltrados, totalOrden, handleCrear, creando,
  handleFacturaChange, facturaPreview, onCrearProducto,
}) {
  const cerrar = () => {
    setModalNuevo(false)
    setForm({ proveedor_id: '', productos: [], fecha_compra: '', metodo_pago: 'Efectivo', estado: 'pendiente', notas: '' })
    setProvBusqueda('')
    setProvSeleccionado(null)
  }

  return (
    <Modal abierto={modalNuevo} onCerrar={cerrar} titulo="Nueva Orden de Compra" ancho="max-w-2xl">
      <form onSubmit={handleCrear} className="space-y-3">

        {/* proveedor */}
        <div>
          <label className="campo-label">Proveedor *</label>
          {provSeleccionado ? (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-primary/40 bg-primary/5 text-xs">
              <span className="font-medium text-primary">{provSeleccionado.nombre}</span>
              <button type="button"
                onClick={() => { setProvSeleccionado(null); setProvBusqueda(''); setForm(p => ({ ...p, proveedor_id: '' })) }}
                className="text-gray-400 hover:text-red-400 ml-2">✕</button>
            </div>
          ) : (
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input value={provBusqueda}
                onChange={e => buscarProveedor(e.target.value)}
                className="campo-input pl-8 text-xs" placeholder="Buscar proveedor por nombre..." />
              {provBusqueda && provsFiltrados.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 bg-light-card dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                  {provsFiltrados.map(p => (
                    <button key={p.id} type="button"
                      onMouseDown={e => { e.preventDefault(); setForm(f => ({ ...f, proveedor_id: p.id })); setProvSeleccionado(p); setProvBusqueda('') }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 text-light-text dark:text-dark-text">
                      {p.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* fecha + método pago */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="campo-label">Fecha de Compra *</label>
            <input type="date" value={form.fecha_compra}
              onChange={e => setForm(p => ({ ...p, fecha_compra: e.target.value }))}
              className="campo-input text-xs" />
          </div>
          <div>
            <label className="campo-label">Método de Pago</label>
            <select value={form.metodo_pago}
              onChange={e => setForm(p => ({ ...p, metodo_pago: e.target.value }))}
              className="campo-input text-xs">
              {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* productos */}
        <div className="p-3 rounded-xl border border-gray-200 dark:border-dark-border space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold">Productos</p>
            {onCrearProducto && (
              <button type="button" onClick={onCrearProducto}
                className="text-xs flex items-center gap-1 text-primary/70 hover:text-primary transition-colors">
                + Crear nuevo producto
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              {itemForm.producto_id ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-primary/40 bg-primary/5 text-xs">
                  <span className="font-medium text-primary">{prodBusqueda}</span>
                  <button type="button"
                    onClick={() => { setItemForm(f => ({ ...f, producto_id: '', costo_unitario: '' })); setProdBusqueda('') }}
                    className="text-gray-400 hover:text-red-400 ml-2">✕</button>
                </div>
              ) : (
                <>
                  <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                  <input value={prodBusqueda} onChange={e => buscarProducto(e.target.value)}
                    onBlur={() => setTimeout(() => setProdsFiltrados([]), 150)}
                    className="campo-input pl-8 text-xs" placeholder="Buscar por nombre o código..." />
                  {prodsFiltrados.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-20 bg-light-card dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                      {prodsFiltrados.map(p => (
                        <button key={p.id} type="button"
                          onClick={() => { setItemForm(f => ({ ...f, producto_id: p.id, costo_unitario: '' })); setProdBusqueda(p.nombre); setProdsFiltrados([]) }}
                          className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 flex justify-between text-light-text dark:text-dark-text">
                          <span>{p.nombre}{p.codigo_barras && <span className="text-gray-400 font-mono ml-2">{p.codigo_barras}</span>}</span>
                          <span className="text-primary">Stock: {p.stock}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="relative">
              <input
                placeholder="Cód. barras"
                inputMode="numeric"
                className="campo-input w-28 text-xs pr-7"
                onInput={e => { e.target.value = e.target.value.replace(/\D/g, '') }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (e.target.value) { buscarPorCodigo(e.target.value); e.target.value = '' }
                  }
                }}
              />
              <Scan size={12} className="absolute right-2 top-2.5 text-gray-400" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="campo-label">Costo Unitario</label>
              <input type="number" step="0.01" value={itemForm.costo_unitario}
                onChange={e => setItemForm(p => ({ ...p, costo_unitario: e.target.value }))}
                className="campo-input text-xs" placeholder="0.00" />
            </div>
            <div>
              <label className="campo-label">Cantidad</label>
              <input type="number" min="1" value={itemForm.cantidad}
                onChange={e => setItemForm(p => ({ ...p, cantidad: e.target.value }))}
                className="campo-input text-xs" />
            </div>
            <div className="flex items-end">
              <button type="button" onClick={agregarItem} className="btn-primary w-full justify-center text-xs">Agregar</button>
            </div>
          </div>
          {form.productos.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {form.productos.map((p, i) => (
                <div key={i} className="flex justify-between items-center text-xs p-2 rounded bg-light-bg dark:bg-dark-bg">
                  <span className="flex-1 truncate">{p.nombre}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-gray-400">{p.cantidad}×{formatPrecio(p.costo_unitario)}</span>
                    <span className="text-primary font-medium">{formatPrecio(p.costo_unitario * p.cantidad)}</span>
                    <button type="button" onClick={() => quitarItem(i)} className="text-red-400"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between text-xs font-bold pt-1 border-t border-gray-200 dark:border-dark-border">
                <span>Total</span><span className="text-primary">{formatPrecio(totalOrden)}</span>
              </div>
            </div>
          )}
        </div>

        {/* factura */}
        <div>
          <label className="campo-label">Factura (PDF o imagen)</label>
          <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-dark-border hover:border-primary/40 transition-colors">
            <Upload size={14} className="text-primary/50" />
            <span className="text-xs text-gray-400">{facturaPreview || 'Seleccionar archivo...'}</span>
            <input type="file" accept=".pdf,image/*" onChange={handleFacturaChange} className="hidden" />
          </label>
        </div>

        {/* notas */}
        <div>
          <label className="campo-label">Notas (Opcional)</label>
          <textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
            rows={2} className="campo-input resize-none" placeholder="Observaciones de la compra..." />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
          <button type="button" onClick={cerrar}
            className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
          <button type="submit" disabled={creando} className="btn-primary">{creando ? 'Creando...' : 'Aceptar'}</button>
        </div>
      </form>
    </Modal>
  )
}