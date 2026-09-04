import { useState } from 'react'
import Modal from '@shared/components/Modal'
import { Search, Upload, PackagePlus, Trash2 } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'
import OrdenConfirmCrear  from './OrdenConfirmCrear'
import ModalBuscadorOrden from './ModalBuscadorOrden'

export default function OrdenForm({
  modalNuevo, setModalNuevo, form, setForm, itemForm, setItemForm,
  proveedores, productos, prodBusqueda, prodsFiltrados, provBusqueda,
  provsFiltrados, provSeleccionado, buscarProveedor, buscarProducto,
  buscarPorCodigo, agregarItem, quitarItem, setProvSeleccionado,
  setProvBusqueda, setProdBusqueda, setProdsFiltrados, totalOrden, handleCrear, creando,
  handleFacturaChange, facturaPreview, onCrearProducto,
  itemEditando, iniciarEdicionItem, guardarEdicionItem, cancelarEdicionItem,
}) {
  const [provDropdown, setProvDropdown] = useState(false)
  const [confirmCrear, setConfirmCrear] = useState(false)
  const [modalBuscador, setModalBuscador] = useState(false)

  const cerrar = () => {
    setModalNuevo(false)
    setForm({ proveedor_id: '', productos: [], fecha_compra: '', metodo_pago: 'Efectivo', estado: 'activo', notas: '' })
    setProvBusqueda('')
    setProvSeleccionado(null)
    if (cancelarEdicionItem) cancelarEdicionItem()
  }

  const handleSubmitInterceptado = e => {
    e.preventDefault()
    if (!form.proveedor_id || !form.fecha_compra || !form.productos.length) return
    setConfirmCrear(true)
  }

  const handleConfirmar = e => {
    setConfirmCrear(false)
    handleCrear(e || { preventDefault: () => {} })
  }

  return (
    <>
      <Modal abierto={modalNuevo} onCerrar={cerrar} bloquearCierre
        titulo="Nueva Compra" ancho="max-w-md">
        <form onSubmit={handleSubmitInterceptado} className="space-y-3">

          {/* Proveedor */}
          <div>
            <label className="campo-label">Proveedor *</label>
            {provSeleccionado ? (
              <div className="flex items-center justify-between px-3 py-2 rounded-lg
                border border-primary/40 bg-primary/5 text-xs">
                <span className="font-medium text-primary">{provSeleccionado.nombre}</span>
                <button type="button"
                  onClick={() => { setProvSeleccionado(null); setProvBusqueda(''); setForm(p => ({ ...p, proveedor_id: '' })) }}
                  className="text-gray-400 hover:text-red-400 ml-2">
                  <Trash2 size={12} />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input value={provBusqueda} onChange={e => buscarProveedor(e.target.value)}
                  onFocus={() => { setProvDropdown(true); buscarProveedor(provBusqueda) }}
                  onBlur={() => setTimeout(() => setProvDropdown(false), 150)}
                  className="campo-input pl-8 text-xs" placeholder="Buscar proveedor..." />
                {provDropdown && provsFiltrados.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 bg-white border border-gray-200
                    rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {provsFiltrados.map(p => (
                      <button key={p.id} type="button"
                        onMouseDown={e => {
                          e.preventDefault()
                          setForm(f => ({ ...f, proveedor_id: p.id }))
                          setProvSeleccionado(p); setProvBusqueda(''); setProvDropdown(false)
                        }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 text-light-text">
                        {p.nombre}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Fecha y método */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="campo-label">Fecha de Compra *</label>
              <input type="date" value={form.fecha_compra}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setForm(p => ({ ...p, fecha_compra: e.target.value }))}
                className="campo-input text-xs" />
            </div>
            <div>
              <label className="campo-label">Método de Pago</label>
              <select value={form.metodo_pago}
                onChange={e => setForm(p => ({ ...p, metodo_pago: e.target.value }))}
                className="campo-input text-xs">
                {['Efectivo', 'Transferencia'].map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Productos — lista compacta + botón abrir modal */}
          <div className="p-3 rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-600">
                Productos {form.productos.length > 0 && (
                  <span className="ml-1 text-primary font-bold">({form.productos.length})</span>
                )}
              </p>
              <button type="button" onClick={() => setModalBuscador(true)}
                className="flex items-center gap-1.5 text-xs text-primary
                  px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/5
                  hover:bg-primary/10 transition-colors">
                <PackagePlus size={13} /> Agregar
              </button>
            </div>

            {form.productos.length === 0 ? (
              <button type="button" onClick={() => setModalBuscador(true)}
                className="w-full py-5 rounded-lg border-2 border-dashed border-gray-200
                  text-xs text-gray-400 hover:border-primary/40 hover:text-primary
                  transition-colors flex flex-col items-center gap-1">
                <PackagePlus size={18} className="opacity-40" />
                Toca para agregar productos
              </button>
            ) : (
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {form.productos.map((p, i) => (
                  <div key={i}
                    className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-gray-50">
                    <span className="flex-1 truncate font-medium">{p.nombre}</span>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span className="text-gray-400">×{p.cantidad}</span>
                      <span className="text-primary font-semibold">
                        {formatPrecio(p.costo_unitario * p.cantidad)}
                      </span>
                      <button type="button" onClick={() => quitarItem(i)}
                        className="text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setModalBuscador(true)}
                  className="w-full text-xs text-primary/60 hover:text-primary py-1 transition-colors">
                  Editar productos →
                </button>
                <div className="flex justify-between text-xs font-bold pt-1 border-t border-gray-200">
                  <span>Total compra</span>
                  <span className="text-primary">{formatPrecio(totalOrden)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Factura */}
          <div>
            <label className="campo-label">Factura (PDF o imagen)</label>
            <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl
              border-2 border-dashed border-gray-200 hover:border-primary/40 transition-colors">
              <Upload size={14} className="text-primary/50" />
              <span className="text-xs text-gray-400">{facturaPreview || 'Seleccionar archivo...'}</span>
              <input type="file" accept=".pdf,image/*" onChange={handleFacturaChange} className="hidden" />
            </label>
          </div>

          {/* Notas */}
          <div>
            <label className="campo-label">Notas (Opcional)</label>
            <textarea value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
              rows={2} className="campo-input resize-none" placeholder="Observaciones..." />
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100">
            <button type="submit" disabled={creando} className="btn-primary disabled:opacity-50">
              {creando ? 'Creando...' : 'Aceptar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal buscador productos compra */}
      <ModalBuscadorOrden
        abierto={modalBuscador}
        onCerrar={() => setModalBuscador(false)}
        productos={productos}
        prodBusqueda={prodBusqueda}
        prodsFiltrados={prodsFiltrados}
        buscarProducto={buscarProducto}
        buscarPorCodigo={buscarPorCodigo}
        form={form}
        itemForm={itemForm}
        setItemForm={setItemForm}
        agregarItem={agregarItem}
        quitarItem={quitarItem}
        itemEditando={itemEditando}
        iniciarEdicionItem={iniciarEdicionItem}
        guardarEdicionItem={guardarEdicionItem}
        cancelarEdicionItem={cancelarEdicionItem}
        setProdBusqueda={setProdBusqueda}
        setProdsFiltrados={setProdsFiltrados}
        onCrearProducto={onCrearProducto}
      />

      {/* Modal confirmación */}
      <OrdenConfirmCrear
        abierto={confirmCrear}
        onCerrar={() => setConfirmCrear(false)}
        onConfirmar={handleConfirmar}
        form={form}
        totalOrden={totalOrden}
        creando={creando}
      />
    </>
  )
}