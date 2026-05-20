import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
import { Trash2 } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'
 
export default function TarifaForm({ tarifas, formTarifa, setFormTarifa, handleGuardarTarifa, guardandoTarifa, modalElimTarifa, setModalElimTarifa, eliminarTarifa, eliminandoTarifa }) {
  const columnas = [
    { key: 'barrio',       label: 'Barrio' },
    { key: 'zona',         label: 'Zona',      render: r => r.zona || '—' },
    { key: 'tarifa',       label: 'Tarifa',    render: r => formatPrecio(r.tarifa) },
    { key: 'distancia_km', label: 'Distancia', render: r => r.distancia_km ? `${r.distancia_km} km` : '—' },
  ]
  return (
    <div className="space-y-4">
      <Tabla columnas={columnas} datos={tarifas}
        acciones={fila => (
          <button onClick={() => setModalElimTarifa({ abierto: true, item: fila })} className="btn-ghost hover:text-red-400"><Trash2 size={14} /></button>
        )}
      />
      <div className="p-4 rounded-xl border border-gray-200 dark:border-dark-border bg-light-card dark:bg-dark-card">
        <p className="text-sm font-semibold mb-3">Agregar Tarifa por Barrio</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><label className="campo-label">Barrio *</label><input value={formTarifa.barrio} onChange={e => setFormTarifa(p => ({ ...p, barrio: e.target.value }))} className="campo-input text-xs" placeholder="Ej: Laureles" /></div>
          <div><label className="campo-label">Zona</label><input value={formTarifa.zona} onChange={e => setFormTarifa(p => ({ ...p, zona: e.target.value }))} className="campo-input text-xs" placeholder="Ej: Norte" /></div>
          <div><label className="campo-label">Tarifa *</label><input type="number" step="0.01" value={formTarifa.tarifa} onChange={e => setFormTarifa(p => ({ ...p, tarifa: e.target.value }))} className="campo-input text-xs" placeholder="0.00" /></div>
          <div><label className="campo-label">Distancia (km)</label><input type="number" step="0.1" value={formTarifa.distancia_km} onChange={e => setFormTarifa(p => ({ ...p, distancia_km: e.target.value }))} className="campo-input text-xs" placeholder="0.0" /></div>
        </div>
        <div className="flex justify-end mt-3">
          <button onClick={handleGuardarTarifa} disabled={guardandoTarifa} className="btn-primary">{guardandoTarifa ? 'Guardando...' : 'Aceptar'}</button>
        </div>
      </div>
      <Modal abierto={modalElimTarifa.abierto} onCerrar={() => setModalElimTarifa({ abierto: false, item: null })} titulo="Confirmar Eliminación" ancho="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm">¿Eliminar la tarifa del barrio <span className="font-medium text-primary">{modalElimTarifa.item?.barrio}</span>?</p>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => setModalElimTarifa({ abierto: false, item: null })} className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
            <button onClick={() => eliminarTarifa.mutate(modalElimTarifa.item.id)} disabled={eliminandoTarifa}
              className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50">
              {eliminandoTarifa ? 'Eliminando...' : 'Aceptar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
 
