import { useState } from 'react'
import Modal from '@shared/components/Modal'
import { Search, Scan } from 'lucide-react'
 
function BuscadorSelect({ label, items, valorId, onSelect, placeholder }) {
  const [busq, setBusq] = useState('')
  const [abierto, setAbierto] = useState(false)
  const filtrados = items.filter(i => !busq || i.nombre.toLowerCase().includes(busq.toLowerCase())).slice(0, 8)
  const seleccionado = items.find(i => i.id === +valorId)
 
  return (
    <div>
      <label className="campo-label">{label}</label>
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
        <input
          value={seleccionado ? seleccionado.nombre : busq}
          onChange={e => { setBusq(e.target.value); onSelect(''); setAbierto(true) }}
          onFocus={() => setAbierto(true)}
          className="campo-input pl-8 text-xs" placeholder={placeholder} />
        {seleccionado && (
          <button type="button" onClick={() => { onSelect(''); setBusq(''); setAbierto(false) }}
            className="absolute right-2 top-2 text-gray-400 hover:text-red-400 text-xs">✕</button>
        )}
        {abierto && busq && filtrados.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-30 bg-light-card dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
            {filtrados.map(i => (
              <button key={i.id} type="button"
                onClick={() => { onSelect(i.id); setBusq(''); setAbierto(false) }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 text-light-text dark:text-dark-text">
                {i.nombre}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
 
export default function ProductoForm({ modal, form, setForm, errores, handleChange, handleSubmit, cerrarModal, guardando, categorias, proveedores, marcas }) {
  return (
    <Modal abierto={modal.abierto} onCerrar={cerrarModal}
      titulo={modal.item ? 'Editar Producto' : 'Nuevo Producto'} ancho="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="campo-label">Nombre *</label>
            <input value={form.nombre} onChange={e => handleChange('nombre', e.target.value)}
              className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`} placeholder="Nombre del producto" />
            {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
          </div>
          <div>
            <label className="campo-label">Precio *</label>
            <input type="number" step="0.01" value={form.precio} onChange={e => handleChange('precio', e.target.value)}
              className={`campo-input ${errores.precio ? 'border-red-400' : ''}`} placeholder="0.00" />
            {errores.precio && <p className="campo-error">{errores.precio}</p>}
          </div>
          <div>
            <label className="campo-label">Stock *</label>
            <input type="number" value={form.stock} onChange={e => handleChange('stock', e.target.value)}
              className={`campo-input ${errores.stock ? 'border-red-400' : ''}`} placeholder="0" />
            {errores.stock && <p className="campo-error">{errores.stock}</p>}
          </div>
          <BuscadorSelect label="Categoría" items={categorias} valorId={form.categoria_id}
            onSelect={id => setForm(p => ({ ...p, categoria_id: id }))} placeholder="Buscar categoría..." />
          <BuscadorSelect label="Marca" items={marcas} valorId={form.marca_id}
            onSelect={id => setForm(p => ({ ...p, marca_id: id }))} placeholder="Buscar marca..." />
          <BuscadorSelect label="Proveedor" items={proveedores} valorId={form.proveedor_id}
            onSelect={id => setForm(p => ({ ...p, proveedor_id: id }))} placeholder="Buscar proveedor..." />
          <div className="relative">
            <label className="campo-label">Código de Barras</label>
            <input value={form.codigo_barras} onChange={e => handleChange('codigo_barras', e.target.value)}
              className="campo-input pr-8" placeholder="Ej: 7702001234567" />
            <Scan size={13} className="absolute right-2 bottom-2.5 text-gray-400" />
          </div>
          <div className="col-span-2">
            <label className="campo-label">URL de Imagen</label>
            <input value={form.imagen_url} onChange={e => handleChange('imagen_url', e.target.value)}
              className="campo-input" placeholder="https://ejemplo.com/imagen.jpg" />
            {form.imagen_url && (
              <img src={form.imagen_url} alt="preview" className="mt-2 h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-dark-border" onError={e => e.target.style.display='none'} />
            )}
          </div>
          <div className="col-span-2">
            <label className="campo-label">Descripción</label>
            <textarea value={form.descripcion} onChange={e => handleChange('descripcion', e.target.value)}
              rows={2} className="campo-input resize-none" />
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
          <button type="button" onClick={cerrarModal} className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
          <button type="submit" disabled={guardando} className="btn-primary">{guardando ? 'Guardando...' : 'Aceptar'}</button>
        </div>
      </form>
    </Modal>
  )
}
