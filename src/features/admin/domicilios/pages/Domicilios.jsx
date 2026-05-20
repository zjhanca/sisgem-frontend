import { Bike, Tag, CheckCircle, Clock, XCircle } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import { formatPrecio } from '@shared/utils/validaciones'
import { useDomicilios } from '../hooks/useDomicilios'
import DomicilioEstado from '../components/DomicilioEstado'
import TarifaForm      from '../components/TarifaForm'
 
const TABS = [
  { id: 'domicilios', label: 'Domicilios', icon: Bike },
  { id: 'tarifas',    label: 'Tarifas',    icon: Tag  },
]
 
const ICONOS = { pendiente: Clock, entregado: CheckCircle, anulado: XCircle }
const COLORES_TEXT = { pendiente: 'text-yellow-500', entregado: 'text-green-500', anulado: 'text-red-400' }
 
export default function Domicilios() {
  const {
    domFiltrados, tarifas,
    filtroDom, setFiltroDom,
    formTarifa, setFormTarifa,
    modalEliminarTarifa, setModalEliminarTarifa,
    cambiarEstado, guardarTarifa, eliminarTarifa,
    getKeyEstado, getEstadoId, ESTADOS_DOM,
    handleGuardarTarifa, guardandoTarifa, eliminandoTarifa,
  } = useDomicilios()
 
  const [tabActivo, setTabActivo] = useState('domicilios')
 
  const columnasDom = [
    { key: 'id',       label: '#' },
    { key: 'pedido_id',label: 'Pedido #' },
    { key: 'cliente',  label: 'Cliente',   render: r => r.cliente || 'Ocasional' },
    { key: 'barrio',   label: 'Barrio',    render: r => r.barrio || '—' },
    { key: 'direccion',label: 'Dirección', render: r => (r.direccion || r.direccion_manual || '—').substring(0, 30) },
    { key: 'tarifa_aplicada', label: 'Tarifa', render: r => formatPrecio(r.tarifa_aplicada || 0) },
    { key: 'estado', label: 'Estado',
      render: r => {
        const key = getKeyEstado(r.estado)
        const Ico = ICONOS[key] || Clock
        return (
          <div className={`flex items-center gap-1.5 ${COLORES_TEXT[key]}`}>
            <Ico size={13} />
            <span className="text-xs capitalize">{ESTADOS_DOM.find(e => e.key === key)?.label || 'Pendiente'}</span>
          </div>
        )
      }
    },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Domicilios</h1>
      </div>
 
      <div className="flex gap-1 p-1 bg-light-bg dark:bg-dark-bg rounded-xl mb-4 w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTabActivo(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              tabActivo === t.id ? 'bg-primary text-dark-bg shadow-sm' : 'text-gray-500 dark:text-dark-text/60 hover:text-primary'
            }`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>
 
      {tabActivo === 'domicilios' && (
        <>
          <div className="flex gap-2 mb-4">
            <select value={filtroDom} onChange={e => setFiltroDom(e.target.value)} className="campo-input w-44 text-xs">
              <option value="">Todos los estados</option>
              {ESTADOS_DOM.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
            </select>
            {filtroDom && <button onClick={() => setFiltroDom('')} className="btn-ghost text-xs text-red-400">Limpiar</button>}
          </div>
          <Tabla columnas={columnasDom} datos={domFiltrados} sinBusqueda
            acciones={fila => (
              <DomicilioEstado fila={fila} getKeyEstado={getKeyEstado}
                getEstadoId={getEstadoId} ESTADOS_DOM={ESTADOS_DOM} cambiarEstado={cambiarEstado} />
            )}
          />
        </>
      )}
 
      {tabActivo === 'tarifas' && (
        <TarifaForm
          tarifas={tarifas} formTarifa={formTarifa} setFormTarifa={setFormTarifa}
          handleGuardarTarifa={handleGuardarTarifa} guardandoTarifa={guardandoTarifa}
          modalEliminarTarifa={modalEliminarTarifa} setModalEliminarTarifa={setModalEliminarTarifa}
          eliminarTarifa={eliminarTarifa} eliminandoTarifa={eliminandoTarifa}
        />
      )}
    </div>
  )
}
