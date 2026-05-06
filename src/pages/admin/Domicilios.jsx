import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import Tabla from '../../components/Tabla'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { Download, Plus, Eye, Settings, Bell, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatPrecio, formatFechaHora } from '../../utils/validaciones'
import { descargarPDF } from '../../utils/reportes'
 
const tarifaVacia = { barrio: '', zona: '', tarifa: '', distancia_km: '' }
const domVacio    = { pedido_id: '', cliente_id: '', direccion_id: '', tarifa_id: '', direccion_manual: '' }
 
export default function Domicilios() {
  const qc = useQueryClient()
  const [modalTarifa, setModalTarifa]   = useState(false)
  const [modalAsignar, setModalAsignar] = useState(false)
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, item: null })
  const [formTarifa, setFormTarifa]     = useState(tarifaVacia)
  const [formDom, setFormDom]           = useState(domVacio)
  const [filtroEstado, setFiltroEstado] = useState('')
 
  const { data: domicilios = [] } = useQuery({ queryKey: ['domicilios'], queryFn: () => api.get('/domicilios').then(r => r.data.datos) })
  const { data: tarifas = [], refetch: refetchTarifas } = useQuery({ queryKey: ['tarifas'], queryFn: () => api.get('/domicilios/tarifas').then(r => r.data.datos) })
  const { data: pedidos = [] } = useQuery({ queryKey: ['pedidos-dom'], queryFn: () => api.get('/pedidos').then(r => r.data.datos.filter(p => p.tipo_venta === 'domicilio' && !p.estado?.toLowerCase().includes('anula'))) })
  const { data: clientes = [] } = useQuery({ queryKey: ['clientes'], queryFn: () => api.get('/clientes').then(r => r.data.datos.filter(c => c.estado)) })
  const { data: estadosDom = [] } = useQuery({ queryKey: ['estados-dom'], queryFn: () => api.get('/estados?tipo=domicilio').then(r => r.data.datos) })
  const { data: direcciones = [] } = useQuery({
    queryKey: ['dirs-dom', formDom.cliente_id],
    queryFn: () => api.get(`/clientes/${formDom.cliente_id}/direcciones`).then(r => r.data.datos),
    enabled: !!formDom.cliente_id
  })
 
  const guardarTarifa = useMutation({
    mutationFn: data => api.post('/domicilios/tarifas', data),
    onSuccess: () => { refetchTarifas(); setFormTarifa(tarifaVacia); toast.success('tarifa guardada') },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const asignar = useMutation({
    mutationFn: data => api.post('/domicilios', data),
    onSuccess: () => { qc.invalidateQueries(['domicilios']); setModalAsignar(false); setFormDom(domVacio); toast.success('domicilio asignado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado_id }) => api.patch(`/domicilios/${id}/estado`, { estado_id }),
    onSuccess: () => { qc.invalidateQueries(['domicilios']); qc.invalidateQueries(['pedidos']); toast.success('estado actualizado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'estado no permitido')
  })
 
  const notificar = item => toast.success(`🔔 Notificacion enviada para domicilio #${item.id}`)
 
  const handleAsignar = e => {
    e.preventDefault()
    if (!formDom.pedido_id) { toast.error('selecciona un pedido'); return }
    if (!formDom.direccion_id && !formDom.direccion_manual?.trim()) { toast.error('ingresa una direccion'); return }
    const tarifa = tarifas.find(t => t.id === +formDom.tarifa_id)
    asignar.mutate({
      pedido_id: +formDom.pedido_id,
      direccion_id: formDom.direccion_id ? +formDom.direccion_id : null,
      direccion_manual: formDom.direccion_manual || null,
      tarifa_id: formDom.tarifa_id ? +formDom.tarifa_id : null,
      tarifa_aplicada: tarifa?.tarifa || 0
    })
  }
 
  const getIconEstado = nombre => {
    if (!nombre) return <Clock size={14} className="text-yellow-400" />
    const n = nombre.toLowerCase()
    if (n.includes('entregado')) return <CheckCircle size={14} className="text-green-400" />
    if (n.includes('anulado'))   return <XCircle size={14} className="text-red-400" />
    return <Clock size={14} className="text-yellow-400" />
  }
 
  const domFiltrados = domicilios.filter(d => !filtroEstado || d.estado_id === +filtroEstado)
 
  const columnas = [
    { key: 'id',        label: '#' },
    { key: 'pedido_id', label: 'Pedido #' },
    { key: 'cliente',   label: 'Cliente', render: r => r.cliente || 'cliente ocasional' },
    { key: 'barrio',    label: 'Barrio',  render: r => r.barrio || '-' },
    { key: 'direccion', label: 'Direccion', render: r => (r.direccion || r.direccion_manual || '-').substring(0, 30) },
    { key: 'tarifa_aplicada', label: 'Tarifa', render: r => formatPrecio(r.tarifa_aplicada || 0) },
    { key: 'estado', label: 'Estado',
      render: r => (
        <div className="flex items-center gap-1.5">
          {getIconEstado(r.estado)}
          <span className="text-xs">{r.estado || 'pendiente'}</span>
        </div>
      )
    },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">domicilios</h1>
        <div className="flex gap-2">
          <button onClick={() => setModalTarifa(true)} className="btn-outline"><Settings size={14} /> tarifas</button>
          <button onClick={() => descargarPDF('/reportes/domicilios', 'reporte-domicilios.pdf')} className="btn-outline">
            <Download size={14} /> reporte</button>
          <button onClick={() => setModalAsignar(true)} className="btn-primary"><Plus size={14} /> asignar domicilio</button>
        </div>
      </div>
 
      <div className="flex gap-2 mb-4">
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="campo-input w-44 text-xs">
          <option value="">todos los estados</option>
          {estadosDom.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
        {filtroEstado && <button onClick={() => setFiltroEstado('')} className="btn-ghost text-xs text-red-400">limpiar</button>}
      </div>
 
      <Tabla columnas={columnas} datos={domFiltrados} sinBusqueda
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => notificar(fila)} className="btn-ghost hover:text-primary" title="notificar"><Bell size={14} /></button>
        </>)}
      />
 
      {/* MODAL DETALLE */}
      <Modal abierto={modalDetalle.abierto} onCerrar={() => setModalDetalle({ abierto: false, item: null })}
        titulo={`domicilio #${modalDetalle.item?.id}`}>
        {modalDetalle.item && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><p className="campo-label">pedido</p><p className="font-medium">#{modalDetalle.item.pedido_id}</p></div>
              <div><p className="campo-label">cliente</p><p>{modalDetalle.item.cliente || 'ocasional'}</p></div>
              <div><p className="campo-label">barrio</p><p>{modalDetalle.item.barrio || '-'}</p></div>
              <div><p className="campo-label">tarifa</p><p className="text-primary font-semibold">{formatPrecio(modalDetalle.item.tarifa_aplicada || 0)}</p></div>
              <div className="col-span-2"><p className="campo-label">direccion</p>
                <p>{modalDetalle.item.direccion || modalDetalle.item.direccion_manual || '-'}</p></div>
            </div>
            {/* botones estado */}
            <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
              <p className="campo-label mb-2">cambiar estado</p>
              <div className="flex gap-2 flex-wrap">
                {estadosDom.map(e => {
                  const n = e.nombre.toLowerCase()
                  const activo = modalDetalle.item.estado_id === e.id
                  return (
                    <button key={e.id} type="button"
                      onClick={() => cambiarEstado.mutate({ id: modalDetalle.item.id, estado_id: e.id })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                        activo
                          ? n.includes('entregado') ? 'bg-green-500/20 border-green-500 text-green-500'
                            : n.includes('anulado') ? 'bg-red-500/20 border-red-400 text-red-400'
                            : 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                          : 'border-gray-200 dark:border-dark-border text-gray-500 hover:border-primary/40'
                      }`}>
                      {getIconEstado(e.nombre)} {e.nombre}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-dark-border">
              <button onClick={() => notificar(modalDetalle.item)} className="btn-outline text-xs">
                <Bell size={12} /> notificar cliente
              </button>
            </div>
          </div>
        )}
      </Modal>
 
      {/* MODAL ASIGNAR */}
      <Modal abierto={modalAsignar} onCerrar={() => setModalAsignar(false)} titulo="asignar domicilio">
        <form onSubmit={handleAsignar} className="space-y-3">
          <div>
            <label className="campo-label">pedido con domicilio *</label>
            <select value={formDom.pedido_id} onChange={e => setFormDom({ ...formDom, pedido_id: e.target.value })} className="campo-input">
              <option value="">seleccionar pedido...</option>
              {pedidos.map(p => <option key={p.id} value={p.id}>#{p.id} — {p.cliente} — {formatPrecio(p.total)}</option>)}
            </select>
          </div>
          <div>
            <label className="campo-label">cliente (para buscar direcciones)</label>
            <select value={formDom.cliente_id}
              onChange={e => setFormDom({ ...formDom, cliente_id: e.target.value, direccion_id: '' })}
              className="campo-input">
              <option value="">seleccionar cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
            </select>
          </div>
          {formDom.cliente_id ? (
            <div>
              <label className="campo-label">direccion guardada</label>
              <select value={formDom.direccion_id}
                onChange={e => setFormDom({ ...formDom, direccion_id: e.target.value, direccion_manual: '' })}
                className="campo-input">
                <option value="">seleccionar...</option>
                {direcciones.map(d => <option key={d.id} value={d.id}>{d.direccion} {d.barrio ? `— ${d.barrio}` : ''}</option>)}
              </select>
            </div>
          ) : (
            <div>
              <label className="campo-label">o ingresar direccion manual</label>
              <input value={formDom.direccion_manual}
                onChange={e => setFormDom({ ...formDom, direccion_manual: e.target.value, direccion_id: '' })}
                className="campo-input" placeholder="barrio, direccion completa..." />
            </div>
          )}
          <div>
            <label className="campo-label">tarifa de domicilio</label>
            <select value={formDom.tarifa_id} onChange={e => setFormDom({ ...formDom, tarifa_id: e.target.value })} className="campo-input">
              <option value="">seleccionar tarifa...</option>
              {tarifas.map(t => (
                <option key={t.id} value={t.id}>
                  {t.barrio || t.ciudad} {t.zona ? `(${t.zona})` : ''} — {formatPrecio(t.tarifa)}
                  {t.distancia_km ? ` — ${t.distancia_km}km` : ''}
                </option>
              ))}
            </select>
            {formDom.tarifa_id && (
              <p className="text-xs text-primary mt-1 font-medium">
                tarifa: {formatPrecio(tarifas.find(t => t.id === +formDom.tarifa_id)?.tarifa || 0)}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button type="button" onClick={() => setModalAsignar(false)}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">cancelar</button>
            <button type="submit" disabled={asignar.isPending} className="btn-primary">
              {asignar.isPending ? 'asignando...' : 'asignar domicilio'}
            </button>
          </div>
        </form>
      </Modal>
 
      {/* MODAL TARIFAS */}
      <Modal abierto={modalTarifa} onCerrar={() => setModalTarifa(false)} titulo="tarifas de domicilio" ancho="max-w-md">
        <div className="space-y-4">
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {tarifas.length === 0 && <p className="text-xs text-center text-gray-400 py-3">sin tarifas configuradas</p>}
            {tarifas.map(t => (
              <div key={t.id} className="flex justify-between items-center p-2 rounded-lg border border-gray-200 dark:border-dark-border text-xs">
                <div>
                  <span className="font-medium">{t.barrio || t.ciudad}</span>
                  {t.zona && <span className="text-gray-400 ml-1">({t.zona})</span>}
                  {t.distancia_km && <span className="text-gray-400 ml-1">· {t.distancia_km}km</span>}
                </div>
                <span className="text-primary font-semibold">{formatPrecio(t.tarifa)}</span>
              </div>
            ))}
          </div>
          <form onSubmit={e => { e.preventDefault(); guardarTarifa.mutate(formTarifa) }}
            className="space-y-2 pt-3 border-t border-gray-200 dark:border-dark-border">
            <p className="text-xs font-medium">agregar tarifa</p>
            <div className="grid grid-cols-2 gap-2">
              <input value={formTarifa.barrio} onChange={e => setFormTarifa({ ...formTarifa, barrio: e.target.value })}
                className="campo-input text-xs" placeholder="barrio *" />
              <input value={formTarifa.zona} onChange={e => setFormTarifa({ ...formTarifa, zona: e.target.value })}
                className="campo-input text-xs" placeholder="zona (ej: norte)" />
              <input type="number" step="0.01" value={formTarifa.tarifa} onChange={e => setFormTarifa({ ...formTarifa, tarifa: e.target.value })}
                className="campo-input text-xs" placeholder="tarifa *" />
              <input type="number" step="0.1" value={formTarifa.distancia_km} onChange={e => setFormTarifa({ ...formTarifa, distancia_km: e.target.value })}
                className="campo-input text-xs" placeholder="distancia km" />
            </div>
            <button type="submit" disabled={guardarTarifa.isPending} className="btn-primary w-full justify-center">
              {guardarTarifa.isPending ? 'guardando...' : 'agregar tarifa'}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  )
}
 
