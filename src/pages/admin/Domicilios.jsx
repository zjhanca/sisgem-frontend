import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import Tabla from '../../components/Tabla'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { Edit2, Download, Plus, Eye, Settings, MapPin } from 'lucide-react'
import { descargarPDF } from '../../utils/reportes'
import { formatPrecio, formatFechaHora } from '../../utils/validaciones'
 
const tarifaVacia = { ciudad: '', tarifa: '' }
const domVacio    = { pedido_id: '', direccion_id: '', tarifa_id: '' }
 
export default function Domicilios() {
  const qc = useQueryClient()
  const [modalTarifa, setModalTarifa]     = useState(false)
  const [modalAsignar, setModalAsignar]   = useState(false)
  const [modalDetalle, setModalDetalle]   = useState({ abierto: false, item: null })
  const [formTarifa, setFormTarifa]       = useState(tarifaVacia)
  const [formDom, setFormDom]             = useState(domVacio)
  const [filtroCliente, setFiltroCliente] = useState('')
  const [filtroEstado, setFiltroEstado]   = useState('')
  const [erroresTarifa, setErroresTarifa] = useState({})
 
  const { data: domicilios = [] } = useQuery({
    queryKey: ['domicilios'],
    queryFn: () => api.get('/domicilios').then(r => r.data.datos)
  })
  const { data: tarifas = [], refetch: refetchTarifas } = useQuery({
    queryKey: ['tarifas'],
    queryFn: () => api.get('/domicilios/tarifas').then(r => r.data.datos)
  })
  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos-domicilio'],
    queryFn: () => api.get('/pedidos').then(r =>
      r.data.datos.filter(p => p.tipo_venta === 'domicilio' && p.estado_id !== 3)
    )
  })
  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => api.get('/clientes').then(r => r.data.datos.filter(c => c.estado))
  })
  const { data: estados = [] } = useQuery({
    queryKey: ['estados-domicilio'],
    queryFn: () => api.get('/estados?tipo=domicilio').then(r => r.data.datos)
  })
  const { data: direccionesCliente = [] } = useQuery({
    queryKey: ['dirs-cliente', formDom.cliente_id],
    queryFn: () => api.get(`/clientes/${formDom.cliente_id}/direcciones`).then(r => r.data.datos),
    enabled: !!formDom.cliente_id
  })
 
  const guardarTarifa = useMutation({
    mutationFn: data => api.post('/domicilios/tarifas', data),
    onSuccess: () => {
      refetchTarifas()
      setFormTarifa(tarifaVacia)
      toast.success('tarifa guardada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const asignarDomicilio = useMutation({
    mutationFn: data => api.post('/domicilios', data),
    onSuccess: () => {
      qc.invalidateQueries(['domicilios'])
      setModalAsignar(false)
      setFormDom(domVacio)
      toast.success('domicilio asignado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado_id }) => api.patch(`/domicilios/${id}/estado`, { estado_id }),
    onSuccess: () => {
      qc.invalidateQueries(['domicilios'])
      toast.success('estado actualizado')
    }
  })
 
  const validarTarifa = () => {
    const e = {}
    if (!formTarifa.ciudad.trim()) e.ciudad = 'la ciudad es obligatoria'
    if (!formTarifa.tarifa || +formTarifa.tarifa <= 0) e.tarifa = 'tarifa invalida'
    return e
  }
 
  const handleGuardarTarifa = e => {
    e.preventDefault()
    const e2 = validarTarifa()
    if (Object.keys(e2).length) { setErroresTarifa(e2); return }
    setErroresTarifa({})
    guardarTarifa.mutate(formTarifa)
  }
 
  const handleAsignar = e => {
    e.preventDefault()
    if (!formDom.pedido_id)    { toast.error('selecciona un pedido'); return }
    if (!formDom.direccion_id) { toast.error('selecciona una direccion'); return }
    if (!formDom.tarifa_id)    { toast.error('selecciona una tarifa'); return }
    const tarifa = tarifas.find(t => t.id === +formDom.tarifa_id)
    asignarDomicilio.mutate({
      pedido_id:      +formDom.pedido_id,
      direccion_id:   +formDom.direccion_id,
      tarifa_id:      +formDom.tarifa_id,
      tarifa_aplicada: tarifa?.tarifa || 0
    })
  }
 
  const notificarCliente = item => {
    toast.success(`notificacion enviada al cliente del domicilio #${item.id}`)
  }
 
  const domiciliosFiltrados = domicilios.filter(d => {
    if (filtroEstado && d.estado_id !== +filtroEstado) return false
    if (filtroCliente && !d.direccion?.toLowerCase().includes(filtroCliente.toLowerCase()) &&
        !d.ciudad?.toLowerCase().includes(filtroCliente.toLowerCase())) return false
    return true
  })
 
  const columnas = [
    { key: 'id',              label: '#' },
    { key: 'pedido_id',       label: 'Pedido #' },
    { key: 'direccion',       label: 'Direccion',
      render: r => r.direccion || '-' },
    { key: 'ciudad',          label: 'Ciudad',
      render: r => r.ciudad || '-' },
    { key: 'tarifa_aplicada', label: 'Tarifa',
      render: r => formatPrecio(r.tarifa_aplicada || 0) },
    { key: 'estado', label: 'Estado',
      render: r => (
        <select value={r.estado_id || ''}
          onChange={e => cambiarEstado.mutate({ id: r.id, estado_id: +e.target.value })}
          className="text-xs bg-transparent border-none outline-none cursor-pointer
            text-light-text dark:text-dark-text"
          onClick={e => e.stopPropagation()}>
          {estados.map(e => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </select>
      )
    },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">domicilios</h1>
        <div className="flex gap-2">
          <button onClick={() => setModalTarifa(true)} className="btn-outline">
            <Settings size={14} /> tarifas
          </button>
          <button
            onClick={() => descargarPDF('/reportes/domicilios', 'reporte-domicilios.pdf')}
            className="btn-outline">
            <Download size={14} /> reporte
          </button>
          <button onClick={() => setModalAsignar(true)} className="btn-primary">
            <Plus size={14} /> asignar domicilio
          </button>
        </div>
      </div>
 
      {/* filtros */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input value={filtroCliente}
          onChange={e => setFiltroCliente(e.target.value)}
          placeholder="filtrar por ciudad o direccion..."
          className="campo-input w-52 text-xs" />
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          className="campo-input w-36 text-xs">
          <option value="">todos los estados</option>
          {estados.map(e => (
            <option key={e.id} value={e.id}>{e.nombre}</option>
          ))}
        </select>
        {(filtroCliente || filtroEstado) && (
          <button onClick={() => { setFiltroCliente(''); setFiltroEstado('') }}
            className="btn-ghost text-xs text-red-400">
            limpiar
          </button>
        )}
      </div>
 
      <Tabla columnas={columnas} datos={domiciliosFiltrados} sinBusqueda
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })}
            className="btn-ghost" title="ver detalle">
            <Eye size={14} />
          </button>
          <button onClick={() => notificarCliente(fila)}
            className="btn-ghost hover:text-primary" title="notificar cliente">
            <MapPin size={14} />
          </button>
        </>)}
      />
 
      {/* modal tarifas */}
      <Modal abierto={modalTarifa} onCerrar={() => setModalTarifa(false)}
        titulo="configurar tarifas de domicilio" ancho="max-w-md">
        <div className="space-y-4">
          {/* lista de tarifas */}
          <div>
            <p className="campo-label mb-2">tarifas configuradas</p>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {tarifas.length === 0 && (
                <p className="text-xs text-gray-400 dark:text-dark-text/40 text-center py-3">
                  sin tarifas configuradas
                </p>
              )}
              {tarifas.map(t => (
                <div key={t.id}
                  className="flex items-center justify-between p-2 rounded-lg
                    border border-gray-200 dark:border-dark-border text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className="text-primary" />
                    <span className="text-light-text dark:text-dark-text">{t.ciudad}</span>
                  </div>
                  <span className="text-primary font-semibold">
                    {formatPrecio(t.tarifa)}
                  </span>
                </div>
              ))}
            </div>
          </div>
 
          {/* agregar tarifa */}
          <form onSubmit={handleGuardarTarifa}
            className="space-y-3 pt-3 border-t border-gray-200 dark:border-dark-border">
            <p className="text-xs font-medium text-light-text dark:text-dark-text">
              agregar nueva tarifa
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <input value={formTarifa.ciudad}
                  onChange={e => setFormTarifa({ ...formTarifa, ciudad: e.target.value })}
                  className={`campo-input ${erroresTarifa.ciudad ? 'border-red-400' : ''}`}
                  placeholder="ciudad *" />
                {erroresTarifa.ciudad && <p className="campo-error">{erroresTarifa.ciudad}</p>}
              </div>
              <div>
                <input type="number" step="0.01" value={formTarifa.tarifa}
                  onChange={e => setFormTarifa({ ...formTarifa, tarifa: e.target.value })}
                  className={`campo-input ${erroresTarifa.tarifa ? 'border-red-400' : ''}`}
                  placeholder="tarifa *" />
                {erroresTarifa.tarifa && <p className="campo-error">{erroresTarifa.tarifa}</p>}
              </div>
            </div>
            <button type="submit" disabled={guardarTarifa.isPending}
              className="btn-primary w-full justify-center">
              {guardarTarifa.isPending ? 'guardando...' : 'agregar tarifa'}
            </button>
          </form>
        </div>
      </Modal>
 
      {/* modal asignar domicilio */}
      <Modal abierto={modalAsignar} onCerrar={() => setModalAsignar(false)}
        titulo="asignar domicilio a pedido">
        <form onSubmit={handleAsignar} className="space-y-3">
          <div>
            <label className="campo-label">pedido con domicilio *</label>
            <select value={formDom.pedido_id}
              onChange={e => setFormDom({ ...formDom, pedido_id: e.target.value })}
              className="campo-input">
              <option value="">seleccionar pedido...</option>
              {pedidos.map(p => (
                <option key={p.id} value={p.id}>
                  #{p.id} - {p.cliente} - {formatPrecio(p.total)}
                </option>
              ))}
            </select>
          </div>
 
          <div>
            <label className="campo-label">cliente</label>
            <select value={formDom.cliente_id || ''}
              onChange={e => setFormDom({ ...formDom, cliente_id: e.target.value, direccion_id: '' })}
              className="campo-input">
              <option value="">seleccionar cliente...</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
              ))}
            </select>
          </div>
 
          <div>
            <label className="campo-label">direccion de envio *</label>
            <select value={formDom.direccion_id}
              onChange={e => setFormDom({ ...formDom, direccion_id: e.target.value })}
              className="campo-input"
              disabled={!formDom.cliente_id}>
              <option value="">
                {formDom.cliente_id ? 'seleccionar direccion...' : 'selecciona un cliente primero'}
              </option>
              {direccionesCliente.map(d => (
                <option key={d.id} value={d.id}>
                  {d.direccion} {d.ciudad ? `- ${d.ciudad}` : ''}
                </option>
              ))}
            </select>
          </div>
 
          <div>
            <label className="campo-label">tarifa de domicilio *</label>
            <select value={formDom.tarifa_id}
              onChange={e => setFormDom({ ...formDom, tarifa_id: e.target.value })}
              className="campo-input">
              <option value="">seleccionar tarifa...</option>
              {tarifas.map(t => (
                <option key={t.id} value={t.id}>
                  {t.ciudad} - {formatPrecio(t.tarifa)}
                </option>
              ))}
            </select>
          </div>
 
          {formDom.tarifa_id && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-light-text dark:text-dark-text">
                tarifa aplicada:
                <span className="font-semibold text-primary ml-1">
                  {formatPrecio(tarifas.find(t => t.id === +formDom.tarifa_id)?.tarifa || 0)}
                </span>
              </p>
            </div>
          )}
 
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button type="button" onClick={() => setModalAsignar(false)}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border
                text-gray-500 dark:text-dark-text/60 rounded-lg hover:border-primary/40">
              cancelar
            </button>
            <button type="submit" disabled={asignarDomicilio.isPending} className="btn-primary">
              {asignarDomicilio.isPending ? 'asignando...' : 'asignar domicilio'}
            </button>
          </div>
        </form>
      </Modal>
 
      {/* modal detalle domicilio */}
      <Modal abierto={modalDetalle.abierto}
        onCerrar={() => setModalDetalle({ abierto: false, item: null })}
        titulo={`domicilio #${modalDetalle.item?.id}`}>
        {modalDetalle.item && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="campo-label">pedido</p>
                <p className="text-light-text dark:text-dark-text font-medium">
                  #{modalDetalle.item.pedido_id}
                </p>
              </div>
              <div>
                <p className="campo-label">estado</p>
                <span className={modalDetalle.item.estado_id === 9 ? 'badge-anulado' :
                  modalDetalle.item.estado_id === 8 ? 'badge-activo' : 'badge-pendiente'}>
                  {modalDetalle.item.estado || 'pendiente'}
                </span>
              </div>
              <div className="col-span-2">
                <p className="campo-label">direccion</p>
                <p className="text-light-text dark:text-dark-text">
                  {modalDetalle.item.direccion || '-'}
                </p>
              </div>
              <div>
                <p className="campo-label">ciudad</p>
                <p className="text-light-text dark:text-dark-text">
                  {modalDetalle.item.ciudad || '-'}
                </p>
              </div>
              <div>
                <p className="campo-label">tarifa aplicada</p>
                <p className="text-primary font-semibold">
                  {formatPrecio(modalDetalle.item.tarifa_aplicada || 0)}
                </p>
              </div>
            </div>
 
            {/* cambiar estado */}
            <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
              <label className="campo-label">cambiar estado</label>
              <div className="flex gap-2 mt-1">
                <select
                  defaultValue={modalDetalle.item.estado_id}
                  onChange={e => cambiarEstado.mutate({
                    id: modalDetalle.item.id,
                    estado_id: +e.target.value
                  })}
                  className="campo-input flex-1 text-xs">
                  {estados.map(e => (
                    <option key={e.id} value={e.id}>{e.nombre}</option>
                  ))}
                </select>
                <button onClick={() => notificarCliente(modalDetalle.item)}
                  className="btn-outline text-xs">
                  <MapPin size={12} /> notificar
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
