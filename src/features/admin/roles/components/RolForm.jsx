import Modal from '@shared/components/Modal'
import { Edit2, Shield } from 'lucide-react'

export default function RolForm({
  modal, form, setForm, errores, tab, setTab,
  permisosSeleccionados, gruposPermisos, todosPermisos,
  handleSubmit, cerrarModal, guardando,
  togglePermiso, toggleModulo, seleccionarTodos, limpiarTodos,
  handleNombreChange,
}) {
  return (
    <Modal abierto={modal.abierto} onCerrar={cerrarModal} bloquearCierre
      titulo={modal.item ? `Editar Rol — ${modal.item.nombre}` : 'Nuevo Rol'} ancho="max-w-2xl">
      <div className="flex gap-1 mb-4 p-1 bg-gray-50 rounded-xl">
        {[{ id:'info', label:'Información', icon:Edit2 }, { id:'permisos', label:'Permisos', icon:Shield }].map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 flex-1 justify-center py-2 rounded-lg text-xs font-medium transition-all ${
              tab === t.id ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-primary'
            }`}>
            <t.icon size={13} /> {t.label}
            {t.id === 'permisos' && permisosSeleccionados.length > 0 && (
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${tab==='permisos' ? 'bg-white/20' : 'bg-primary/15 text-primary'}`}>
                {permisosSeleccionados.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {tab === 'info' && (
          <div className="space-y-3">
            <div>
              <label className="campo-label">Nombre del Rol *</label>
              <input value={form.nombre} onChange={e => handleNombreChange(e.target.value)}
                className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`}
                placeholder="Nombre del rol" />
              {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
            </div>
            <div>
              <label className="campo-label">Descripción</label>
              <textarea value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                rows={2} className="campo-input resize-none" placeholder="Descripción del rol..." />
            </div>
            {!modal.item && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-600">
                💡 Puedes asignar permisos en la pestaña "Permisos" o hacerlo después.
              </div>
            )}
          </div>
        )}

        {tab === 'permisos' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">{permisosSeleccionados.length} de {todosPermisos.length} permisos</p>
              <div className="flex gap-2">
                <button type="button" onClick={seleccionarTodos} className="text-xs text-primary hover:underline">Todos</button>
                <span className="text-gray-300">|</span>
                <button type="button" onClick={limpiarTodos} className="text-xs text-gray-400 hover:underline">Limpiar</button>
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {Object.entries(gruposPermisos).map(([modulo, perms]) => {
                const todosSelec = perms.every(p => permisosSeleccionados.includes(p.id))
                return (
                  <div key={modulo} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-gray-50">
                      <span className="text-xs font-semibold capitalize">{modulo}</span>
                      <button type="button" onClick={() => toggleModulo(perms)}
                        className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                          todosSelec ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-500 hover:border-primary/40'
                        }`}>
                        {todosSelec ? 'Quitar' : 'Todos'}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-px bg-gray-100">
                      {perms.map(p => (
                        <label key={p.id} className="flex items-center gap-2 px-3 py-2 text-xs cursor-pointer bg-white hover:bg-primary/5 transition-colors">
                          <input type="checkbox" checked={permisosSeleccionados.includes(p.id)} onChange={() => togglePermiso(p.id)} className="accent-primary shrink-0" />
                          <span>{p.nombre.replace(/_/g, ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3 mt-3 border-t border-gray-100">
          <button type="submit" disabled={guardando || !!errores.nombre} className="btn-primary disabled:opacity-50">
            {guardando ? 'Guardando...' : 'Aceptar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}