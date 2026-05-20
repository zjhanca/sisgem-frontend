import { formatPrecio } from '@shared/utils/validaciones'
 
export default function DomicilioAsignar({ formDomDetalle, setFormDomDetalle, dirsDetalle, tarifas, clienteDetallId, handleAsignarDomDetalle, asignando }) {
  return (
    <div className="space-y-2 p-3 rounded-lg border border-dashed border-blue-300 dark:border-blue-500/30 bg-blue-50/30 dark:bg-blue-500/5">
      <p className="text-xs text-blue-500 italic">Sin domicilio asignado. Asignar ahora:</p>
      {clienteDetallId && dirsDetalle.length > 0 && (
        <div className="flex gap-2">
          {[{ val:'registrada', label:'Guardada' }, { val:'manual', label:'Manual' }].map(t => (
            <button key={t.val} type="button" onClick={() => setFormDomDetalle(p => ({ ...p, tipo_dir: t.val }))}
              className={`px-2.5 py-1 text-xs rounded-full border ${formDomDetalle.tipo_dir===t.val ? 'bg-blue-500 text-white border-blue-500' : 'border-gray-200 text-gray-500'}`}>
              {t.label}
            </button>
          ))}
        </div>
      )}
      {formDomDetalle.tipo_dir === 'registrada' && dirsDetalle.length > 0 ? (
        <select value={formDomDetalle.direccion_id} onChange={e => setFormDomDetalle(p => ({ ...p, direccion_id: e.target.value }))} className="campo-input text-xs">
          <option value="">Seleccionar dirección...</option>
          {dirsDetalle.map(d => <option key={d.id} value={d.id}>{d.direccion}{d.barrio ? ` — ${d.barrio}` : ''}</option>)}
        </select>
      ) : (
        <input value={formDomDetalle.direccion_manual} onChange={e => setFormDomDetalle(p => ({ ...p, direccion_manual: e.target.value }))}
          className="campo-input text-xs" placeholder="Barrio, dirección, indicaciones..." />
      )}
      <select value={formDomDetalle.tarifa_id} onChange={e => setFormDomDetalle(p => ({ ...p, tarifa_id: e.target.value }))} className="campo-input text-xs">
        <option value="">Tarifa por barrio (opcional)...</option>
        {tarifas.map(t => <option key={t.id} value={t.id}>{t.barrio}{t.zona ? ` (${t.zona})` : ''} — {formatPrecio(t.tarifa)}</option>)}
      </select>
      <button type="button" onClick={handleAsignarDomDetalle} disabled={asignando}
        className="btn-primary text-xs w-full justify-center">
        {asignando ? 'Asignando...' : 'Asignar Domicilio'}
      </button>
    </div>
  )
}
