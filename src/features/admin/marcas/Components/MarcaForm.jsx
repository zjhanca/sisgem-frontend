import Modal from '@shared/components/Modal'
 
export default function MarcaForm({ modal, form, setForm, errores, handleSubmit, cerrarModal, guardando, proveedores }) {
  return (
    <Modal abierto={modal.abierto} onCerrar={cerrarModal}
      titulo={modal.item ? 'Editar Marca' : 'Nueva Marca'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="campo-label">Nombre *</label>
          <input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
            className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`} placeholder="Nombre de la marca" />
          {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
        </div>
        <div>
          <label className="campo-label">Proveedor Relacionado</label>
          <select value={form.proveedor_id} onChange={e => setForm(p => ({ ...p, proveedor_id: e.target.value }))} className="campo-input">
            <option value="">Seleccionar proveedor...</option>
            {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="campo-label">Descripción</label>
          <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
            rows={2} className="campo-input resize-none" />
        </div>
        <div>
          <label className="campo-label">URL del Logo</label>
          <input value={form.logo} onChange={e => setForm(p => ({ ...p, logo: e.target.value }))}
            className="campo-input" placeholder="https://ejemplo.com/logo.png" />
          {form.logo && (
            <img src={form.logo} alt="preview" className="mt-2 w-12 h-12 object-contain rounded border border-gray-200 dark:border-dark-border"
              onError={e => e.target.style.display = 'none'} />
          )}
        </div>
        <div>
          <label className="campo-label">Sitio Web</label>
          <input value={form.sitio_web} onChange={e => setForm(p => ({ ...p, sitio_web: e.target.value }))}
            className="campo-input" placeholder="https://www.marca.com" />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
          <button type="button" onClick={cerrarModal} className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
          <button type="submit" disabled={guardando} className="btn-primary">{guardando ? 'Guardando...' : 'Aceptar'}</button>
        </div>
      </form>
    </Modal>
  )
}
