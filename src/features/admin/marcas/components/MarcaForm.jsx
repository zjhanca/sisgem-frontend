import { useState, useRef, useEffect } from 'react'
import Modal from '@shared/components/Modal'
import { Search, Loader2, CheckCircle2, AlertCircle, Plus, ExternalLink, X } from 'lucide-react'
import { normalizarUrl } from '../hooks/useMarcas'

function BuscadorProveedores({ proveedores, seleccionados, onAgregar, onQuitar }) {
  const [busq, setBusq] = useState('')
  const [abierto, setAbierto] = useState(false)
  const ref = useRef(null)

  const disponibles = proveedores.filter(p => {
    if (seleccionados.find(s => s.id === p.id)) return false
    if (!busq) return true
    const t = busq.toLowerCase()
    return p.nombre?.toLowerCase().includes(t) || p.email?.toLowerCase().includes(t)
  }).slice(0, 8)

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref}>
      <label className="campo-label">Proveedores Relacionados</label>

      {/* chips de seleccionados */}
      {seleccionados.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {seleccionados.map(p => (
            <span key={p.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
              bg-primary/10 border border-primary/20 text-xs text-primary font-medium">
              {p.nombre}
              <button type="button" onClick={() => onQuitar(p.id)}
                className="hover:text-red-400 transition-colors ml-0.5">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* buscador */}
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
        <input value={busq}
          onChange={e => { setBusq(e.target.value); setAbierto(true) }}
          onFocus={() => setAbierto(true)}
          className="campo-input pl-8 text-xs"
          placeholder="Buscar y agregar proveedor..." />
        {abierto && (
          <div className="absolute top-full left-0 right-0 z-30 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-44 overflow-y-auto">
            {disponibles.length === 0
              ? <div className="px-3 py-3 text-xs text-gray-400 text-center">
                  {busq ? 'Sin coincidencias' : 'Todos los proveedores ya fueron agregados'}
                </div>
              : disponibles.map(p => (
                <button key={p.id} type="button"
                  onMouseDown={e => { e.preventDefault(); onAgregar(p); setBusq(''); setAbierto(false) }}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 text-light-text flex items-center gap-2">
                  <Plus size={11} className="text-primary shrink-0" />
                  <div>
                    <p className="font-medium">{p.nombre}</p>
                    {p.email && <p className="text-gray-400">{p.email}</p>}
                  </div>
                </button>
              ))
            }
          </div>
        )}
      </div>
      {seleccionados.length === 0 && (
        <p className="campo-hint">Puedes asociar uno o varios proveedores a esta marca.</p>
      )}
    </div>
  )
}

export default function MarcaForm({ modal, form, setForm, errores, handleChange, handleSubmit, cerrarModal, guardando, proveedores, verificandoNombre }) {
  const urlPreview = form.sitio_web ? normalizarUrl(form.sitio_web) : ''
  const urlValida = urlPreview && (() => { try { new URL(urlPreview); return true } catch { return false } })()

  const proveedoresSeleccionados = form.proveedores || []

  const agregarProveedor = p => {
    if (proveedoresSeleccionados.find(s => s.id === p.id)) return
    setForm(prev => ({ ...prev, proveedores: [...proveedoresSeleccionados, { id: p.id, nombre: p.nombre }] }))
  }
  const quitarProveedor = id => {
    setForm(prev => ({ ...prev, proveedores: proveedoresSeleccionados.filter(p => p.id !== id) }))
  }

  return (
    <Modal abierto={modal.abierto} onCerrar={cerrarModal} bloquearCierre
      titulo={modal.item ? 'Editar Marca' : 'Nueva Marca'}>
      <form onSubmit={handleSubmit} className="space-y-3">

        <div>
          <label className="campo-label">Nombre *</label>
          <div className="relative">
            <input value={form.nombre} onChange={e => handleChange('nombre', e.target.value)}
              className={`campo-input pr-8 ${errores.nombre ? 'border-red-400' : (form.nombre && !errores.nombre && !verificandoNombre ? 'border-primary/40' : '')}`}
              placeholder="Nombre de la marca" maxLength={80} />
            <div className="absolute right-2.5 top-2.5">
              {verificandoNombre ? <Loader2 size={13} className="text-gray-400 animate-spin" />
                : form.nombre && !errores.nombre ? <CheckCircle2 size={13} className="text-primary" />
                : null}
            </div>
          </div>
          {errores.nombre
            ? <p className="campo-error flex items-center gap-1"><AlertCircle size={11} /> {errores.nombre}</p>
            : verificandoNombre
              ? <span className="campo-hint flex items-center gap-1"><Loader2 size={10} className="animate-spin" /> Verificando...</span>
              : form.nombre && <span className="campo-success flex items-center gap-1"><CheckCircle2 size={10} /> Disponible</span>
          }
        </div>

        <BuscadorProveedores
          proveedores={proveedores}
          seleccionados={proveedoresSeleccionados}
          onAgregar={agregarProveedor}
          onQuitar={quitarProveedor}
        />

        <div>
          <label className="campo-label">Descripción</label>
          <textarea value={form.descripcion} onChange={e => handleChange('descripcion', e.target.value)}
            rows={2} className="campo-input resize-none" placeholder="Descripción opcional..." />
        </div>

        <div>
          <label className="campo-label">URL del Logo</label>
          <input value={form.logo} onChange={e => handleChange('logo', e.target.value)}
            className="campo-input" placeholder="https://ejemplo.com/logo.png" />
          {form.logo && (
            <img src={form.logo} alt="preview" className="mt-2 w-12 h-12 object-contain rounded border border-gray-200"
              onError={e => e.target.style.display='none'} />
          )}
        </div>

        <div>
          <label className="campo-label">Sitio Web</label>
          <div className="relative">
            <input value={form.sitio_web} onChange={e => handleChange('sitio_web', e.target.value)}
              className={`campo-input pr-8 ${errores.sitio_web ? 'border-red-400' : ''}`}
              placeholder="ejemplo.com o https://www.marca.com" />
            {urlValida && (
              <a href={urlPreview} target="_blank" rel="noopener noreferrer"
                className="absolute right-2.5 top-2.5 text-primary hover:text-primary/70">
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

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button type="submit" disabled={guardando || !!errores.nombre || verificandoNombre}
            className="btn-primary disabled:opacity-50">
            {guardando ? 'Guardando...' : 'Aceptar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}