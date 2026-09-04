import { useState } from 'react'
import Modal from '@shared/components/Modal'
import { Search, Scan, Loader2, CheckCircle2 } from 'lucide-react'
import GestorImagenes from '@shared/components/GestorImagenes'
import { useBarcodeScanner } from '@shared/hooks/useBarcodeScanner'

function BuscadorSelect({ label, items, valorId, onSelect, placeholder }) {
  const [busq, setBusq]       = useState('')
  const [abierto, setAbierto] = useState(false)
  const filtrados    = items.filter(i => !busq || i.nombre.toLowerCase().includes(busq.toLowerCase())).slice(0, 8)
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
          onBlur={() => setTimeout(() => setAbierto(false), 150)}
          className="campo-input pl-8 text-xs" placeholder={placeholder} />
        {seleccionado && (
          <button type="button" onClick={() => { onSelect(''); setBusq(''); setAbierto(false) }}
            className="absolute right-2 top-2 text-gray-400 hover:text-red-400 text-xs">✕</button>
        )}
        {abierto && filtrados.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-30 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
            {filtrados.map(i => (
              <button key={i.id} type="button"
                onMouseDown={e => { e.preventDefault(); onSelect(i.id); setBusq(''); setAbierto(false) }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 text-light-text">
                {i.nombre}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function ProductoFormConStock({
  modal, form, setForm, errores, handleChange, handleSubmit,
  cerrarModal, guardando, categorias, marcas, verificandoCodigo,
}) {
  // Pistola — llena el campo código de barras automáticamente
  useBarcodeScanner({
    activo: modal.abierto,
    soloNumeros: true,
    onScan: codigo => handleChange('codigo_barras', codigo),
  })

  return (
    <Modal abierto={modal.abierto} onCerrar={cerrarModal} bloquearCierre
      titulo="Nuevo Producto con Stock" ancho="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-3">

        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-600">
          Registra un producto que ya tienes en inventario. El stock y precio
          de venta se asignarán directamente.
        </div>

        <div className="grid grid-cols-2 gap-3">

          {/* Nombre */}
          <div className="col-span-2">
            <label className="campo-label">Nombre *</label>
            <input value={form.nombre} onChange={e => handleChange('nombre', e.target.value)}
              className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`}
              placeholder="Nombre del producto" />
            {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
          </div>

          {/* Categoría y Marca */}
          <BuscadorSelect label="Categoría" items={categorias} valorId={form.categoria_id}
            onSelect={id => setForm(p => ({ ...p, categoria_id: id }))} placeholder="Buscar categoría..." />
          <BuscadorSelect label="Marca" items={marcas} valorId={form.marca_id}
            onSelect={id => setForm(p => ({ ...p, marca_id: id }))} placeholder="Buscar marca..." />

          {/* Stock y Precio */}
          <div>
            <label className="campo-label">Stock inicial *</label>
            <input type="number" min="1" value={form.stock}
              onChange={e => handleChange('stock', e.target.value)}
              className={`campo-input ${errores.stock ? 'border-red-400' : ''}`}
              placeholder="Ej: 10" />
            {errores.stock && <p className="campo-error">{errores.stock}</p>}
          </div>
          <div>
            <label className="campo-label">Precio de venta *</label>
            <input type="number" min="0" step="1" value={form.precio}
              onChange={e => handleChange('precio', e.target.value)}
              className={`campo-input ${errores.precio ? 'border-red-400' : ''}`}
              placeholder="Ej: 8000" />
            {errores.precio && <p className="campo-error">{errores.precio}</p>}
          </div>

          {/* Código de barras */}
          <div className="col-span-2">
            <label className="campo-label">Código de barras</label>
            <div className="relative">
              <input value={form.codigo_barras}
                onChange={e => { if (/^\d*$/.test(e.target.value)) handleChange('codigo_barras', e.target.value) }}
                inputMode="numeric"
                className={`campo-input pr-8 ${errores.codigo_barras ? 'border-red-400' : (
                  form.codigo_barras && !verificandoCodigo && !errores.codigo_barras ? 'border-primary/40' : ''
                )}`}
                placeholder="Escanea con pistola o escribe el código" />
              <div className="absolute right-2 bottom-2.5 flex items-center">
                {verificandoCodigo
                  ? <Loader2 size={13} className="text-gray-400 animate-spin" />
                  : form.codigo_barras && !errores.codigo_barras
                    ? <CheckCircle2 size={13} className="text-primary" />
                    : <Scan size={13} className="text-gray-400" />}
              </div>
            </div>
            {errores.codigo_barras && <p className="campo-error">{errores.codigo_barras}</p>}
            {!form.codigo_barras && !errores.codigo_barras && (
              <p className="campo-hint flex items-center gap-1">
                <Scan size={10} /> La pistola escanea directo aquí cuando el modal está abierto
              </p>
            )}
          </div>

          {/* Descripción */}
          <div className="col-span-2">
            <label className="campo-label">Descripción</label>
            <textarea value={form.descripcion} onChange={e => handleChange('descripcion', e.target.value)}
              rows={2} className="campo-input resize-none" maxLength={300} />
            <p className="campo-hint text-right">{(form.descripcion || '').length}/300</p>
          </div>

          {/* Imágenes */}
          <div className="col-span-2">
            <label className="campo-label">Imágenes ({(form.imagenes || []).length})</label>
            <GestorImagenes
              imagenes={form.imagenes || []}
              onChange={imgs => {
                const nuevas = typeof imgs === 'function' ? imgs(form.imagenes || []) : imgs
                setForm(p => ({ ...p, imagenes: nuevas, imagen_url: nuevas[0] || '' }))
              }}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button type="submit"
            disabled={guardando || !!errores.codigo_barras || verificandoCodigo}
            className="btn-primary disabled:opacity-50">
            {guardando ? 'Guardando...' : 'Aceptar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}