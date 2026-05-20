import Modal from '@shared/components/Modal'
 
export default function ClienteDirecciones({ modalDir, setModalDir, direcciones, formDir, setFormDir, handleSubmitDir, guardandoDir }) {
  const cerrar = () => setModalDir({ abierto: false, cliente: null })
  const cliente = modalDir.cliente
 
  return (
    <Modal abierto={modalDir.abierto} onCerrar={cerrar}
      titulo={`Direcciones — ${cliente?.nombre || ''} ${cliente?.apellido || ''}`}
      ancho="max-w-lg">
      <div className="space-y-4">
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {direcciones.length === 0 && <p className="text-xs text-center text-gray-400 py-4">Sin direcciones</p>}
          {direcciones.map(d => (
            <div key={d.id} className="p-3 rounded-lg border border-gray-200 dark:border-dark-border">
              <p className="text-sm font-medium">{d.direccion}</p>
              {d.barrio && <p className="text-xs text-gray-400 mt-0.5">Barrio: {d.barrio}</p>}
              {d.indicaciones && <p className="text-xs text-gray-400 italic mt-0.5">{d.indicaciones}</p>}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmitDir} className="space-y-2 pt-3 border-t border-gray-200 dark:border-dark-border">
          <p className="text-xs font-medium">Agregar Nueva Dirección</p>
          <input value={formDir.direccion} onChange={e => setFormDir(p => ({ ...p, direccion: e.target.value }))}
            className="campo-input" placeholder="Dirección completa *" />
          <div className="grid grid-cols-2 gap-2">
            <input value={formDir.barrio} onChange={e => setFormDir(p => ({ ...p, barrio: e.target.value }))}
              className="campo-input" placeholder="Barrio" />
            <input value={formDir.indicaciones} onChange={e => setFormDir(p => ({ ...p, indicaciones: e.target.value }))}
              className="campo-input" placeholder="Indicaciones" />
          </div>
          <button type="submit" disabled={guardandoDir} className="btn-primary w-full justify-center">
            {guardandoDir ? 'Guardando...' : 'Agregar Dirección'}
          </button>
        </form>
      </div>
    </Modal>
  )
}
