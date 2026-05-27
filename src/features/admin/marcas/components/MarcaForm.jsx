import { useState, useRef, useEffect } from 'react'
import Modal from '@shared/components/Modal'
import { Search, Loader2, CheckCircle2, AlertCircle, Plus, ExternalLink } from 'lucide-react'
import { normalizarUrl } from '../hooks/useMarcas'

function BuscadorProveedor({ proveedores, valorId, onSelect }) {
  const [busq, setBusq] = useState('')
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)

  const seleccionado = proveedores.find(p => p.id === +valorId)

  const filtrados = proveedores.filter(p => {
    if (!busq) return true
    const t = busq.toLowerCase()
    return (
      p.nombre?.toLowerCase().includes(t) ||
      p.email?.toLowerCase().includes(t) ||
      p.documento?.toLowerCase().includes(t)
    )
  }).slice(0, 8)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const seleccionar = p => { onSelect(p.id); setBusq(''); setAbierto(false) }
  const limpiar = () => { onSelect(''); setBusq(''); setAbierto(false) }

  return (
    <div ref={ref}>
      <label className="campo-label">Proveedor Relacionado</label>
      {seleccionado && !busq ? (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-primary/40 bg-primary/5 text-xs">
          <div>
            <span className="font-medium text-primary">{seleccionado.nombre}</span>
            {seleccionado.email && <span className="text-gray-400 ml-2">{seleccionado.email}</span>}
          </div>
          <button type="button" onClick={limpiar} className="text-gray-400 hover:text-red-400 ml-2">✕</button>
        </div>
      ) : (
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
          <input
            value={busq}
            onChange={e => { setBusq(e.target.value); onSelect(''); setAbierto(true) }}
            onFocus={() => setAbierto(true)}
            className="campo-input pl-8 text-xs"
            placeholder="Buscar por nombre, correo o documento..."
          />
          {abierto && (
            <div className="absolute top-full left-0 right-0 z-30 bg-light-card dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg mt-1 max-h-44 overflow-y-auto">
              {filtrados.length === 0 ? (
                <div className="px-3 py-3 text-xs text-gray-400 text-center">
                  Sin coincidencias
                </div>
              ) : (
                filtrados.map(p => (
                  <button key={p.id} type="button"
                    onMouseDown={e => { e.preventDefault(); seleccionar(p) }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 flex justify-between items-center text-light-text dark:text-dark-text">
                    <div>
                      <p className="font-medium">{p.nombre}</p>
                      {(p.email || p.documento) && (
                        <p className="text-gray-400 text-xs">{p.documento}{p.email ? ` · ${p.email}` : ''}</p>
                      )}
                    </div>
                  </button>
                ))
              )}
              <div className="border-t border-gray-200 dark:border-dark-border">
                <button type="button" onMouseDown={e => { e.preventDefault(); onSelect(''); setBusq(''); setAbierto(false) }}
                  className="w-full text-left px-3 py-2 text-xs text-primary hover:bg-primary/10 flex items-center gap-1.5">
                  <Plus size={11} /> Sin proveedor
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function MarcaForm({ modal, form, setForm, errores, handleChange, handleSubmit, cerrarModal, guardando, proveedores, verificandoNombre }) {

  const urlPreview = form.sitio_web ? normalizarUrl(form.sitio_web) : ''
  const urlValida = urlPreview && (() => { try { new URL(urlPreview); return true } catch { return false } })()

  return (
    <Modal abierto={modal.abierto} onCerrar={cerrarModal}
      titulo={modal.item ? 'Editar Marca' : 'Nueva Marca'}>
      <form onSubmit={handleSubmit} className="space-y-3">

        {/* nombre */}
        <div>
          <label className="campo-label">Nombre *</label>
          <div className="relative">
            <input
              value={form.nombre}
              onChange={e => handleChange('nombre', e.target.value)}
              className={`campo-input pr-8 ${errores.nombre ? 'border-red-400' : (form.nombre && !errores.nombre && !verificandoNombre ? 'border-primary/40' : '')}`}
              placeholder="Nombre de la marca"
              maxLength={80}
            />
            <div className="absolute right-2.5 top-2.5">
              {verificandoNombre
                ? <Loader2 size={13} className="text-gray-400 animate-spin" />
                : form.nombre && !errores.nombre
                  ? <CheckCircle2 size={13} className="text-primary" />
                  : null
              }
            </div>
          </div>
          {errores.nombre
            ? <p className="campo-error flex items-center gap-1"><AlertCircle size={11} /> {errores.nombre}</p>
            : verificandoNombre
              ? <span className="campo-hint flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Verificando...</span>
              : form.nombre && <span className="campo-success"><CheckCircle2 size={10} /> Disponible</span>
          }
          {form.nombre && (
            <p className="campo-hint">{form.nombre.trim().length}/80 caracteres</p>
          )}
        </div>

        {/* proveedor buscador */}
        <BuscadorProveedor
          proveedores={proveedores}
          valorId={form.proveedor_id}
          onSelect={id => setForm(p => ({ ...p, proveedor_id: id }))}
        />

        {/* descripcion */}
        <div>
          <label className="campo-label">Descripción</label>
          <textarea value={form.descripcion} onChange={e => handleChange('descripcion', e.target.value)}
            rows={2} className="campo-input resize-none" placeholder="Descripción opcional..." />
        </div>

        {/* logo */}
        <div>
          <label className="campo-label">URL del Logo</label>
          <input value={form.logo} onChange={e => handleChange('logo', e.target.value)}
            className="campo-input" placeholder="https://ejemplo.com/logo.png" />
          {form.logo && (
            <img src={form.logo} alt="preview" className="mt-2 w-12 h-12 object-contain rounded border border-gray-200 dark:border-dark-border"
              onError={e => e.target.style.display = 'none'} />
          )}
        </div>

        {/* sitio web */}
        <div>
          <label className="campo-label">Sitio Web</label>
          <div className="relative">
            <input
              value={form.sitio_web}
              onChange={e => handleChange('sitio_web', e.target.value)}
              className={`campo-input pr-8 ${errores.sitio_web ? 'border-red-400' : ''}`}
              placeholder="ejemplo.com o https://www.marca.com"
            />
            {urlValida && (
              <a href={urlPreview} target="_blank" rel="noopener noreferrer"
                className="absolute right-2.5 top-2.5 text-primary hover:text-primary/70" title="Abrir en nueva pestaña">
                <ExternalLink size={13} />
              </a>
            )}
          </div>
          {errores.sitio_web
            ? <p className="campo-error flex items-center gap-1"><AlertCircle size={11} /> {errores.sitio_web}</p>
            : urlValida
              ? <p className="campo-hint flex items-center gap-1">
                  <CheckCircle2 size={10} className="text-primary" />
                  Se guardará como: <span className="text-primary">{urlPreview}</span>
                </p>
              : null
          }
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
          <button type="button" onClick={cerrarModal}
            className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">
            Cancelar
          </button>
          <button type="submit"
            disabled={guardando || !!errores.nombre || verificandoNombre}
            className="btn-primary disabled:opacity-50">
            {guardando ? 'Guardando...' : 'Aceptar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}