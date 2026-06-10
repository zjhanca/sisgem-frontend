import { useRef } from 'react'
import Modal from '@shared/components/Modal'
import { Upload, Link as LinkIcon, X } from 'lucide-react'

export default function CategoriaForm({
  modal, form, errores,
  handleChange, handleSubmit,
  cerrarModal, guardando
}) {
  const fileRef = useRef(null)
  const esNuevo = !modal.item

  const handleFile = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => handleChange('icono', ev.target.result)
    reader.readAsDataURL(file)
  }

  return (
    <Modal
      abierto={modal.abierto}
      onCerrar={cerrarModal}
      titulo={modal.item ? 'Editar Categoría' : 'Nueva Categoría'}>
      <form onSubmit={handleSubmit} className="space-y-3">

        <div className={`grid gap-3 ${esNuevo ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <div>
            <label className="campo-label">Nombre *</label>
            <input
              value={form.nombre}
              onChange={e => handleChange('nombre', e.target.value)}
              className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`}
              placeholder="Nombre de la categoría"
              maxLength={100}
            />
            {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
          </div>

          {esNuevo && (
            <div>
              <label className="campo-label">Margen de ganancia (%) *</label>
              <input
                type="number" min="0" max="500" step="0.5"
                value={form.margen ?? ''}
                onChange={e => handleChange('margen', e.target.value)}
                className={`campo-input ${errores.margen ? 'border-red-400' : ''}`}
                placeholder="Ej: 45"
              />
              {errores.margen
                ? <p className="campo-error">{errores.margen}</p>
                : <p className="text-xs text-gray-400 mt-1">Precio = costo × (1 + margen / 100)</p>
              }
            </div>
          )}
        </div>

        {/* ícono */}
        <div>
          <label className="campo-label">Ícono de categoría</label>
          <div className="flex gap-3 items-start">
            <div className="shrink-0 w-16 h-16 rounded-full bg-primary flex items-center justify-center overflow-hidden border-2 border-primary/30">
              {form.icono
                ? <img src={form.icono} alt="preview"
                    className="w-10 h-10 object-contain"
                    onError={e => e.target.style.display='none'} />
                : <span className="text-xs text-white text-center px-1 leading-tight">Sin ícono</span>
              }
            </div>

            <div className="flex-1 space-y-2">
              <button type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed
                  border-gray-200 dark:border-dark-border text-xs text-gray-400
                  hover:border-primary/40 hover:text-primary transition-colors">
                <Upload size={13} /> Subir desde mis archivos
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

              <div className="relative">
                <LinkIcon size={12} className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
                <input
                  value={form.icono?.startsWith('data:') ? '' : (form.icono ?? '')}
                  onChange={e => handleChange('icono', e.target.value)}
                  className="campo-input pl-7 text-xs"
                  placeholder="O pegar URL de imagen..."
                />
              </div>

              {form.icono && (
                <button type="button"
                  onClick={() => handleChange('icono', '')}
                  className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500">
                  <X size={11} /> Quitar ícono
                </button>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="campo-label">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={e => handleChange('descripcion', e.target.value)}
            rows={2}
            className="campo-input resize-none"
            placeholder="Descripción de la categoría"
            maxLength={500}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
          <button type="button" onClick={cerrarModal}
            className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg hover:border-primary/40">
            Cancelar
          </button>
          <button type="submit" disabled={guardando} className="btn-primary">
            {guardando ? 'Guardando...' : 'Aceptar'}
          </button>
        </div>

      </form>
    </Modal>
  )
}