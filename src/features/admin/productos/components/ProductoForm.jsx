import { useState, useRef } from 'react'
import Modal from '@shared/components/Modal'
import { Search, Scan, Plus, Trash2, ImageOff, Star, Loader2, CheckCircle2, Upload } from 'lucide-react'

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

function GestorImagenes({ imagenes, onChange }) {
  const [nuevaUrl, setNuevaUrl] = useState('')
  const fileRef = useRef(null)

  const agregar = () => {
    const url = nuevaUrl.trim()
    if (!url || imagenes.includes(url)) return
    onChange([...imagenes, url]); setNuevaUrl('')
  }

  const handleFile = e => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        const base64 = ev.target.result
        onChange(prev => imagenes.includes(base64) ? imagenes : [...imagenes, base64])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const quitar = idx => onChange(imagenes.filter((_, i) => i !== idx))
  const hacerPrincipal = idx => {
    const nueva = [...imagenes]
    const [item] = nueva.splice(idx, 1)
    nueva.unshift(item); onChange(nueva)
  }

  return (
    <div className="space-y-2">
      {/* subir desde disco */}
      <button type="button" onClick={() => fileRef.current?.click()}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-200
          text-xs text-gray-400 hover:border-primary/40 hover:text-primary transition-colors">
        <Upload size={13} /> Subir imagen desde mis archivos
      </button>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />

      {/* por URL */}
      <div className="flex gap-2">
        <input value={nuevaUrl} onChange={e => setNuevaUrl(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregar() } }}
          className="campo-input text-xs" placeholder="O pegar URL de imagen..." />
        <button type="button" onClick={agregar} className="btn-outline shrink-0 px-2.5"><Plus size={14} /></button>
      </div>

      {/* grid de imágenes */}
      {imagenes.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {imagenes.map((url, i) => (
            <div key={i} className={`relative group rounded-lg overflow-hidden border-2 transition-colors ${i === 0 ? 'border-primary' : 'border-gray-200'}`}>
              <img src={url} alt="" className="w-full h-20 object-cover bg-gray-50"
                onError={e => { e.target.src=''; e.target.parentElement.classList.add('bg-gray-100') }} />
              {i === 0 && (
                <div className="absolute top-1 left-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
                  <Star size={9} /> Principal
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                {i !== 0 && (
                  <button type="button" onClick={() => hacerPrincipal(i)}
                    className="p-1 rounded bg-primary text-white hover:bg-primary/80" title="Hacer principal">
                    <Star size={12} />
                  </button>
                )}
                <button type="button" onClick={() => quitar(i)}
                  className="p-1 rounded bg-red-500 text-white hover:bg-red-600">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 text-xs">
          <ImageOff size={14} /> Sin imágenes — sube un archivo o pega una URL
        </div>
      )}
      <p className="campo-hint">La primera imagen es la principal.</p>
    </div>
  )
}

export default function ProductoForm({ modal, form, setForm, errores, handleChange, handleSubmit, cerrarModal, guardando, categorias, marcas, verificandoCodigo }) {
  const esNuevo = !modal.item
  return (
    <Modal abierto={modal.abierto} onCerrar={cerrarModal} bloquearCierre
      titulo={modal.item ? 'Editar Producto' : 'Nuevo Producto'} ancho="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="campo-label">Nombre *</label>
            <input value={form.nombre} onChange={e => handleChange('nombre', e.target.value)}
              className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`} placeholder="Nombre del producto" />
            {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
          </div>

          {!esNuevo && (
            <div className="col-span-2">
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-600">
                El precio se actualiza automáticamente al recibir compras. Precio actual:{' '}
                <strong>{form.precio ? `$${parseFloat(form.precio).toLocaleString('es-CO')}` : '—'}</strong>
              </div>
            </div>
          )}

          <BuscadorSelect label="Categoría" items={categorias} valorId={form.categoria_id}
            onSelect={id => setForm(p => ({ ...p, categoria_id: id }))} placeholder="Buscar categoría..." />
          <BuscadorSelect label="Marca" items={marcas} valorId={form.marca_id}
            onSelect={id => setForm(p => ({ ...p, marca_id: id }))} placeholder="Buscar marca..." />

          <div className="col-span-2">
            <label className="campo-label">Código de Barras (solo números)</label>
            <div className="relative">
              <input value={form.codigo_barras}
                onChange={e => { if (/^\d*$/.test(e.target.value)) handleChange('codigo_barras', e.target.value) }}
                inputMode="numeric"
                className={`campo-input pr-8 ${errores.codigo_barras ? 'border-red-400' : (form.codigo_barras && !verificandoCodigo && !errores.codigo_barras ? 'border-primary/40' : '')}`}
                placeholder="Ej: 7702001234567" />
              <div className="absolute right-2 bottom-2.5 flex items-center">
                {verificandoCodigo ? <Loader2 size={13} className="text-gray-400 animate-spin" />
                  : form.codigo_barras && !errores.codigo_barras ? <CheckCircle2 size={13} className="text-primary" />
                  : <Scan size={13} className="text-gray-400" />}
              </div>
            </div>
            {errores.codigo_barras && <p className="campo-error">{errores.codigo_barras}</p>}
            {verificandoCodigo && <span className="campo-hint flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Verificando...</span>}
          </div>

          <div className="col-span-2">
            <label className="campo-label">Descripción</label>
            <textarea value={form.descripcion} onChange={e => handleChange('descripcion', e.target.value)}
              rows={2} className="campo-input resize-none" />
          </div>

          <div className="col-span-2">
            <label className="campo-label">Imágenes ({(form.imagenes || []).length})</label>
            <GestorImagenes
              imagenes={form.imagenes || []}
              onChange={imgs => {
                // imgs puede ser array nuevo o función updater
                const nuevas = typeof imgs === 'function' ? imgs(form.imagenes || []) : imgs
                setForm(p => ({ ...p, imagenes: nuevas, imagen_url: nuevas[0] || '' }))
              }}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button type="submit" disabled={guardando || !!errores.codigo_barras || verificandoCodigo}
            className="btn-primary disabled:opacity-50">
            {guardando ? 'Guardando...' : 'Aceptar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}