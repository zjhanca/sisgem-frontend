import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import Tabla from '../../components/Tabla'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { Download, Plus, Eye, Settings, Bell, CheckCircle, XCircle, Clock, Search } from 'lucide-react'
import { formatPrecio, formatFechaHora } from '../../utils/validaciones'
import { descargarPDF } from '../../utils/reportes'

const tarifaVacia = { barrio: '', zona: '', tarifa: '', distancia_km: '' }
const domVacio    = { pedido_id: '', tipo_dir: 'registrada', direccion_id: '', direccion_manual: '', tarifa_id: '' }

// estados permitidos para domicilio (sin duplicados)
const ESTADOS_DOM = [
  { key: 'pendiente', label: 'Pendiente', color: 'yellow', icon: Clock },
  { key: 'entregado', label: 'Entregado', color: 'green',  icon: CheckCircle },
  { key: 'anulado',   label: 'Anulado',   color: 'red',    icon: XCircle },
]

export default function Domicilios() {
  const qc = useQueryClient()
  const [modalTarifa, setModalTarifa]   = useState(false)
  const [modalAsignar, setModalAsignar] = useState(false)
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, item: null })
  const [formTarifa, setFormTarifa]     = useState(tarifaVacia)
  const [formDom, setFormDom]           = useState(domVacio)
  const [filtroEstado, setFiltroEstado] = useState('')
  const [pedidoBusqueda, setPedidoBusqueda]     = useState('')
  const [pedidosFiltrados, setPedidosFiltrados] = useState([])
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null)

  const { data: domicilios = [] } = useQuery({ queryKey: ['domicilios'], queryFn: () => api.get('/domicilios').then(r => r.data.datos) })
  const { data: tarifas = [], refetch: refetchTarifas } = useQuery({ queryKey: ['tarifas'], queryFn: () => api.get('/domicilios/tarifas').then(r => r.data.datos) })
  const { data: pedidos = [] }    = useQuery({ queryKey: ['pedidos'], queryFn: () => api.get('/pedidos').then(r => r.data.datos) })
  const { data: estadosBD = [] }  = useQuery({ queryKey: ['estados-dom'], queryFn: () => api.get('/estados?tipo=domicilio').then(r => r.data.datos) })

  // obtener direcciones del cliente del pedido seleccionado
  const clienteIdDelPedido = pedidoSeleccionado?.cliente_id_ref || pedidoSeleccionado?.cliente_id
  const { data: direcciones = [] } = useQuery({
    queryKey: ['dirs-dom', clienteIdDelPedido],
    queryFn: () => api.get(`/clientes/${clienteIdDelPedido}/direcciones`).then(r => r.data.datos),
    enabled: !!clienteIdDelPedido
  })

  // mapear estadosBD a los 3 permitidos (sin duplicados)
  const getEstadoId = key => {
    const mapa = {
      pendiente: ['pendiente'],
      entregado: ['entregado', 'complet'],
      anulado:   ['anulado', 'cancel']
    }
    return estadosBD.find(e => mapa[key]?.some(k => e.nombre?.toLowerCase().includes(k)))?.id
  }

  const guardarTarifa = useMutation({
    mutationFn: data => api.post('/domicilios/tarifas', data),
    onSuccess: () => { refetchTarifas(); setFormTarifa(tarifaVacia); toast.success('tarifa guardada') },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })

  const asignar = useMutation({
    mutationFn: data => api.post('/domicilios', data),
    onSuccess: () => {
      qc.invalidateQueries(['domicilios'])
      setModalAsignar(false); setFormDom(domVacio)
      setPedidoBusqueda(''); setPedidoSeleccionado(null)
      toast.success('domicilio asignado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })

  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado_id }) => api.patch(`/domicilios/${id}/estado`, { estado_id }),
    onSuccess: () => { qc.invalidateQueries(['domicilios']); qc.invalidateQueries(['pedidos']); toast.success('estado actualizado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'no permitido')
  })

  const notificar = item => toast.success(`🔔 notificación enviada para domicilio #${item.id}`)

  // buscador de pedidos
  const buscarPedido = texto => {
    setPedidoBusqueda(texto)
    setPedidoSeleccionado(null)
    setFormDom(domVacio)
    if (!texto) { setPedidosFiltrados([]); return }
    const t = texto.toLowerCase()
    setPedidosFiltrados(pedidos.filter(p =>
      String(p.id).includes(t) || p.cliente?.toLowerCase().includes(t)
    ).slice(0, 6))
  }

  const seleccionarPedido = pedido => {
    setPedidoSeleccionado(pedido)
    setPedidoBusqueda(`#${pedido.id} — ${pedido.cliente}`)
    setPedidosFiltrados([])
    setFormDom({ ...domVacio, pedido_id: pedido.id,
      // si el pedido es de cliente manual (sin cliente_id), forzar dirección manual
      tipo_dir: pedido.cliente_id_ref ? 'registrada' : 'manual'
    })
  }

  const handleAsignar = e => {
    e.preventDefault()
    if (!formDom.pedido_id) { toast.error('selecciona un pedido'); return }
    if (formDom.tipo_dir === 'registrada' && !formDom.direccion_id) { toast.error('selecciona una dirección'); return }
    if (formDom.tipo_dir === 'manual' && !formDom.direccion_manual?.trim()) { toast.error('ingresa la dirección'); return }
    const tarifa = tarifas.find(t => t.id === +formDom.tarifa_id)
    asignar.mutate({
      pedido_id: +formDom.pedido_id,
      direccion_id: formDom.tipo_dir === 'registrada' ? +formDom.direccion_id : null,
      direccion_manual: formDom.tipo_dir === 'manual' ? formDom.direccion_manual : null,
      tarifa_id: formDom.tarifa_id ? +formDom.tarifa_id : null,
      tarifa_aplicada: tarifa?.tarifa || 0
    })
  }

  const getKeyEstado = nombre => {
    if (!nombre) return 'pendiente'
    const n = nombre.toLowerCase()
    if (n.includes('entrega') || n.includes('complet')) return 'entregado'
    if (n.includes('anula') || n.includes('cancel'))    return 'anulado'
    return 'pendiente'
  }

  const domFiltrados = domicilios.filter(d => {
    if (!filtroEstado) return true
    return getKeyEstado(d.estado) === filtroEstado
  })

  const columnas = [
    { key: 'id',        label: '#' },
    { key: 'pedido_id', label: 'Pedido #' },
    { key: 'cliente',   label: 'Cliente', render: r => r.cliente || 'cliente ocasional' },
    { key: 'barrio',    label: 'Barrio',  render: r => r.barrio || (r.direccion_manual ? '(manual)' : '-') },
    { key: 'direccion', label: 'Dirección', render: r => (r.direccion || r.direccion_manual || '-').substring(0, 28) },
    { key: 'tarifa_aplicada', label: 'Tarifa', render: r => formatPrecio(r.tarifa_aplicada || 0) },
    { key: 'estado', label: 'Estado',
      render: r => {
        const key = getKeyEstado(r.estado)
        const cfg = ESTADOS_DOM.find(e => e.key === key)
        const Ico = cfg?.icon || Clock
        return (
          <div className="flex items-center gap-1.5">
            <Ico size={13} className={key === 'entregado' ? 'text-green-400' : key === 'anulado' ? 'text-red-400' : 'text-yellow-400'} />
            <span className="text-xs capitalize">{cfg?.label || 'pendiente'}</span>
          </div>
        )
      }
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
          {ESTADOS_DOM.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
        </select>
        {filtroEstado && <button onClick={() => setFiltroEstado('')} className="btn-ghost text-xs text-red-400">limpiar</button>}
      </div>

      <Tabla columnas={columnas} datos={domFiltrados} sinBusqueda
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => notificar(fila)} className="btn-ghost hover:text-primary" title="notificar"><Bell size={14} /></button>
        </>)}
      />

      {/* ───── MODAL DETALLE — estado con botones ───── */}
      <Modal abierto={modalDetalle.abierto} onCerrar={() => setModalDetalle({ abierto: false, item: null })}
        titulo={`domicilio #${modalDetalle.item?.id}`}>
        {modalDetalle.item && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><p className="campo-label">pedido</p><p className="font-medium">#{modalDetalle.item.pedido_id}</p></div>
              <div><p className="campo-label">cliente</p><p>{modalDetalle.item.cliente || 'ocasional'}</p></div>
              <div><p className="campo-label">barrio</p><p>{modalDetalle.item.barrio || '-'}</p></div>
              <div><p className="campo-label">tarifa</p><p className="text-primary font-semibold">{formatPrecio(modalDetalle.item.tarifa_aplicada || 0)}</p></div>
              <div className="col-span-2">
                <p className="campo-label">dirección</p>
                <p>{modalDetalle.item.direccion || modalDetalle.item.direccion_manual || '-'}</p>
              </div>
            </div>

            {/* botones de estado — solo los 3, sin duplicados */}
            <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
              <p className="campo-label mb-2">cambiar estado</p>
              <div className="flex gap-2 flex-wrap">
                {ESTADOS_DOM.map(({ key, label, color, icon: Ico }) => {
                  const estado_id = getEstadoId(key)
                  if (!estado_id) return null
                  const esActual = getKeyEstado(modalDetalle.item.estado) === key
                  return (
                    <button key={key} type="button"
                      onClick={() => cambiarEstado.mutate({ id: modalDetalle.item.id, estado_id })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-all ${
                        esActual
                          ? color === 'green'  ? 'bg-green-500/20 border-green-500 text-green-500'
                            : color === 'red'  ? 'bg-red-500/20 border-red-400 text-red-400'
                            : 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                          : 'border-gray-200 dark:border-dark-border text-gray-500 hover:border-primary/40'
                      }`}>
                      <Ico size={11} /> {label}
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

      {/* ───── MODAL ASIGNAR DOMICILIO ───── */}
      <Modal abierto={modalAsignar}
        onCerrar={() => { setModalAsignar(false); setFormDom(domVacio); setPedidoBusqueda(''); setPedidoSeleccionado(null) }}
        titulo="asignar domicilio">
        <form onSubmit={handleAsignar} className="space-y-3">

          {/* buscador de pedido */}
          <div>
            <label className="campo-label">pedido *</label>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input value={pedidoBusqueda} onChange={e => buscarPedido(e.target.value)}
                className="campo-input pl-8 text-xs" placeholder="buscar pedido por # o nombre del cliente..." />
              {pedidosFiltrados.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-20 bg-light-card dark:bg-dark-card
                  border border-gray-200 dark:border-dark-border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                  {pedidosFiltrados.map(p => (
                    <button key={p.id} type="button" onClick={() => seleccionarPedido(p)}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 flex justify-between text-light-text dark:text-dark-text">
                      <span>#{p.id} — {p.cliente}</span>
                      <span className="text-primary">{formatPrecio(p.total)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {pedidoSeleccionado && (
              <div className="mt-1 p-2 rounded-lg bg-primary/10 text-xs">
                <p className="text-primary font-medium">pedido #{pedidoSeleccionado.id}</p>
                <p className="text-gray-500">cliente: {pedidoSeleccionado.cliente}</p>
                {!pedidoSeleccionado.cliente_id_ref && (
                  <p className="text-orange-400 mt-0.5">⚠ cliente no registrado — dirección manual requerida</p>
                )}
              </div>
            )}
          </div>

          {/* dirección — registrada o manual según el cliente del pedido */}
          {pedidoSeleccionado && (
            <div>
              <label className="campo-label">dirección de envío</label>

              {/* si el cliente está registrado, puede elegir */}
              {pedidoSeleccionado.cliente_id_ref && (
                <div className="flex gap-2 mb-2">
                  {[{ val: 'registrada', label: 'dirección guardada' }, { val: 'manual', label: 'ingresar manual' }].map(t => (
                    <button key={t.val} type="button"
                      onClick={() => setFormDom({ ...formDom, tipo_dir: t.val, direccion_id: '', direccion_manual: '' })}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        formDom.tipo_dir === t.val ? 'bg-primary text-dark-bg border-primary' : 'border-gray-200 dark:border-dark-border text-gray-500'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              )}

              {/* dirección registrada del cliente */}
              {formDom.tipo_dir === 'registrada' && pedidoSeleccionado.cliente_id_ref && (
                <select value={formDom.direccion_id}
                  onChange={e => setFormDom({ ...formDom, direccion_id: e.target.value })}
                  className="campo-input text-xs">
                  <option value="">seleccionar dirección guardada...</option>
                  {direcciones.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.direccion} {d.barrio ? `— ${d.barrio}` : ''}
                    </option>
                  ))}
                </select>
              )}

              {/* dirección manual */}
              {(formDom.tipo_dir === 'manual' || !pedidoSeleccionado.cliente_id_ref) && (
                <input value={formDom.direccion_manual}
                  onChange={e => setFormDom({ ...formDom, direccion_manual: e.target.value })}
                  className="campo-input text-xs" placeholder="barrio, dirección completa, indicaciones..." />
              )}
            </div>
          )}

          {/* tarifa por barrio */}
          <div>
            <label className="campo-label">tarifa de domicilio (por barrio)</label>
            <select value={formDom.tarifa_id}
              onChange={e => setFormDom({ ...formDom, tarifa_id: e.target.value })}
              className="campo-input text-xs">
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
            <button type="button"
              onClick={() => { setModalAsignar(false); setFormDom(domVacio); setPedidoBusqueda(''); setPedidoSeleccionado(null) }}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">cancelar</button>
            <button type="submit" disabled={asignar.isPending} className="btn-primary">
              {asignar.isPending ? 'asignando...' : 'asignar domicilio'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ───── MODAL TARIFAS POR BARRIO ───── */}
      <Modal abierto={modalTarifa} onCerrar={() => setModalTarifa(false)} titulo="tarifas por barrio" ancho="max-w-md">
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
            <p className="text-xs font-medium">agregar tarifa por barrio</p>
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