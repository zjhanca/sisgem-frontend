import { useRef, useState } from 'react'
import { Upload, Link as LinkIcon, X, Image } from 'lucide-react'

export default function ZonaImagen({
  valor, onChange, placeholder = 'O pegar URL de imagen...',
  label = 'Imagen', preview = true, circular = false,
}) {
  const fileRef             = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = file => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = ev => onChange(ev.target.result)
    reader.readAsDataURL(file)
  }

  const onInputFile = e => { handleFile(e.target.files[0]); e.target.value = '' }

  const onDrop = e => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const onDragOver = e => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const previewClass = circular
    ? 'w-16 h-16 rounded-full'
    : 'w-16 h-16 rounded-lg'

  return (
    <div className="space-y-2">
      <div className="flex gap-3 items-start">
        {preview && (
          <div className={`shrink-0 ${previewClass} bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20`}>
            {valor
              ? <img src={valor} alt="preview" className="w-full h-full object-contain"
                  onError={e => e.target.style.display='none'} />
              : <Image size={20} className="text-primary/30" />
            }
          </div>
        )}
        <div className="flex-1 space-y-2">
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
            {dragging ? 'Suelta la imagen aquí' : 'Subir o arrastrar imagen'}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onInputFile} />

          {/* URL */}
          <div className="relative">
            <LinkIcon size={12} className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
            <input
              value={valor?.startsWith('data:') ? '' : (valor ?? '')}
              onChange={e => onChange(e.target.value)}
              className="campo-input pl-7 text-xs"
              placeholder={placeholder} />
          </div>

          {valor && (
            <button type="button" onClick={() => onChange('')}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500">
              <X size={11} /> Quitar imagen
            </button>
          )}
        </div>
      </div>
    </div>
  )
}