import { useRef, useState } from 'react'
import { Upload, Plus, Trash2, ImageOff, Star } from 'lucide-react'

export default function GestorImagenes({ imagenes = [], onChange }) {
  const fileRef             = useRef(null)
  const [nuevaUrl, setNuevaUrl] = useState('')
  const [dragging, setDragging] = useState(false)

  const agregarDesdeFile = file => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = ev => {
      const base64 = ev.target.result
      onChange(imagenes.includes(base64) ? imagenes : [...imagenes, base64])
    }
    reader.readAsDataURL(file)
  }

  const handleInputFile = e => {
    Array.from(e.target.files).forEach(agregarDesdeFile)
    e.target.value = ''
  }

  const onDrop = e => {
    e.preventDefault(); setDragging(false)
    Array.from(e.dataTransfer.files).forEach(agregarDesdeFile)
  }

  const onDragOver = e => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const agregarUrl = () => {
    const url = nuevaUrl.trim()
    if (!url || imagenes.includes(url)) return
    onChange([...imagenes, url]); setNuevaUrl('')
  }

  const quitar = idx => onChange(imagenes.filter((_, i) => i !== idx))

  const hacerPrincipal = idx => {
    const nueva = [...imagenes]
    const [item] = nueva.splice(idx, 1)
    nueva.unshift(item); onChange(nueva)
  }

  return (
    <div className="space-y-2">
      {/* Zona drag and drop */}
      <div
        onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
        onClick={() => fileRef.current?.click()}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed
          text-xs cursor-pointer transition-colors
          ${dragging
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-gray-200 text-gray-400 hover:border-primary/40 hover:text-primary'
          }`}>
        <Upload size={13} />
        {dragging ? 'Suelta las imágenes aquí' : 'Subir o arrastrar imágenes'}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleInputFile} />

      {/* URL */}
      <div className="flex gap-2">
        <input value={nuevaUrl} onChange={e => setNuevaUrl(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); agregarUrl() } }}
          className="campo-input text-xs" placeholder="O pegar URL de imagen..." />
        <button type="button" onClick={agregarUrl} className="btn-outline shrink-0 px-2.5">
          <Plus size={14} />
        </button>
      </div>

      {/* Grid imágenes */}
      {imagenes.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {imagenes.map((url, i) => (
            <div key={i} className={`relative group rounded-lg overflow-hidden border-2 transition-colors ${
              i === 0 ? 'border-primary' : 'border-gray-200'
            }`}>
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
                    className="p-1 rounded bg-primary text-white hover:bg-primary/80">
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