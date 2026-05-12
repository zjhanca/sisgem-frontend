import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/services/api'
import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
import toast from 'react-hot-toast'
import { Plus, Eye, Download, Trash2, History, Settings, Scan, ShoppingCart, Bike, Search } from 'lucide-react'
import { formatPrecio, formatFechaHora, formatFecha } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
 
const formVacio = {
  tipo_cliente: 'registrado',
  cliente_id: '', cliente_nombre: '',
  tipo_venta: 'mostrador',
  notas: '', productos: []
}
 
export default function Pedidos() {
  const qc = useQueryClient()
  const barcodeRef = useRef(null)
  const [modalNuevo, setModalNuevo]         = useState(false)
  const [modalDetalle, setModalDetalle]     = useState({ abierto: false, pedido: null })
  const [modalHistorial, setModalHistorial] = useState({ abierto: false, cliente: null })
  const [modalConfig, setModalConfig]       = useState(false)
  const [filtroEstado, setFiltroEstado]     = useState('')
  const [filtroDesde, setFiltroDesde]       = useState('')
  const [filtroHasta, setFiltroHasta]       = useState('')
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [configCancelacion, setConfigCancelacion] = useState({ horas: 24 })
  const [form, setForm]             = useState(formVacio)
  const [prodBusqueda, setProdBusqueda]       = useState('')
  const [prodsFiltrados, setProdsFiltrados]   = useState([])
  const [clienteBusqueda, setClienteBusqueda] = useState('')
 
  const { data: pedidos = [] }  = useQuery({ queryKey: ['pedidos'],        queryFn: () => api.get('/pedidos').then(r => r.data.datos) })
  const { data: clientes = [] } = useQuery({ queryKey: ['clientes'],       queryFn: () => api.get('/clientes').then(r => r.data.datos.filter(c => c.estado)) })
  const { data: productos = [] }= useQuery({ queryKey: ['productos'],      queryFn: () => api.get('/productos').then(r => r.data.datos.filter(p => p.estado && p.stock > 0)) })
  const { data: estados = [] }  = useQuery({ queryKey: ['estados-pedido'], queryFn: () => api.get('/estados?tipo=pedido').then(r => r.data.datos) })
  const { data: historial = [] }= useQuery({
    queryKey: ['historial', modalHistorial.cliente?.id],
    queryFn: () => api.get(`/pedidos?cliente_id=${modalHistorial.cliente?.id}`).then(r => r.data.datos),
    enabled: !!modalHistorial.cliente?.id
  })
 
  const crearPedido = useMutation({
    mutationFn: data => api.post('/pedidos', data),
    onSuccess: () => {
      qc.invalidateQueries(['pedidos']); qc.invalidateQueries(['productos'])
      setModalNuevo(false); setForm(formVacio); setProdBusqueda(''); setClienteBusqueda('')
      toast.success('pedido creado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const cambiarEstado = useMutation({
    mutationFn: ({ id, estado_id }) => api.patch(`/pedidos/${id}/estado`, { estado_id }),
    onSuccess: () => { qc.invalidateQueries(['pedidos']); toast.success('estado actualizado') }
  })
 
  const anular = useMutation({
    mutationFn: id => {
      const e = estados.find(e => e.nombre?.toLowerCase().includes('anula'))
      return api.patch(`/pedidos/${id}/estado`, { estado_id: e?.id || 3 })
    },
    onSuccess: () => { qc.invalidateQueries(['pedidos']); setModalDetalle({ abierto: false, pedido: null }); toast.success('pedido anulado') }
  })
 
  // clientes filtrados por búsqueda
  const clientesFiltrados = clientes.filter(c =>
    !clienteBusqueda || `${c.nombre} ${c.apellido}`.toLowerCase().includes(clienteBusqueda.toLowerCase())
  ).slice(0, 6)
 
  const buscarProducto = texto => {
    if (!texto) { setProdsFiltrados([]); return }
    const t = texto.toLowerCase()
    setProdsFiltrados(productos.filter(p =>
      p.nombre.toLowerCase().includes(t) || (p.codigo_barras && p.codigo_barras.includes(t))
    ).slice(0, 8))
  }
 
  const buscarPorCodigo = async codigo => {
    if (!codigo) return
    try {
      const { data } = await api.get(`/productos/barcode/${codigo}`)
      if (data.ok) { agregarProducto(data.datos); toast.success(`agregado: ${data.datos.nombre}`) }
      else toast.error('producto no encontrado')
    } catch { toast.error('producto no encontrado') }
  }
 
  const agregarProducto = prod => {
    const id = prod.id || prod.producto_id
    const existe = form.productos.find(p => p.producto_id === id)
    if (existe) {
      setForm({ ...form, productos: form.productos.map(p => p.producto_id === id ? { ...p, cantidad: p.cantidad + 1 } : p) })
    } else {
      setForm({ ...form, productos: [...form.productos, { producto_id: id, cantidad: 1, precio_unitario: parseFloat(prod.precio), nombre: prod.nombre }] })
    }
    setProdBusqueda(''); setProdsFiltrados([])
  }
 
  const quitarProducto = idx => setForm({ ...form, productos: form.productos.filter((_, i) => i !== idx) })
  const totalPedido = form.productos.reduce((s, p) => s + p.precio_unitario * p.cantidad, 0)
 
  const handleCrear = e => {
    e.preventDefault()
    if (form.tipo_cliente === 'registrado' && !form.cliente_id) { toast.error('selecciona un cliente'); return }
    if (form.tipo_cliente === 'manual' && !form.cliente_nombre.trim()) { toast.error('ingresa el nombre del cliente'); return }
    if (!form.productos.length) { toast.error('agrega al menos un producto'); return }
    crearPedido.mutate({
      cliente_id: form.tipo_cliente === 'registrado' ? form.cliente_id : null,
      cliente_nombre: form.tipo_cliente === 'manual' ? form.cliente_nombre : null,
      tipo_venta: form.tipo_venta, notas: form.notas, productos: form.productos
    })
  }
 
  const puedeAnular = pedido => {
    if (!pedido) return false
    const anulado = estados.find(e => e.nombre?.toLowerCase().includes('anula'))
    if (pedido.estado_id === anulado?.id) return false
    return (new Date() - new Date(pedido.fecha_pedido)) / (1000 * 60 * 60) <= configCancelacion.horas
  }
 
  const pedidosFiltrados = pedidos.filter(p => {
    if (filtroEstado && p.estado_id !== +filtroEstado) return false
    if (filtroDesde && new Date(p.fecha_pedido) < new Date(filtroDesde)) return false
    if (filtroHasta && new Date(p.fecha_pedido) > new Date(filtroHasta)) return false
    if (filtroBusqueda && !`${p.id} ${p.cliente}`.toLowerCase().includes(filtroBusqueda.toLowerCase())) return false
    return true
  })
 
  const getBadge = nombre => {
    if (!nombre) return 'badge-pendiente'
    const n = nombre.toLowerCase()
    if (n.includes('anula') || n.includes('cancel')) return 'badge-anulado'
    if (n.includes('entrega') || n.includes('paga')) return 'badge-activo'
    if (n.includes('proceso')) return 'badge-proceso'
    return 'badge-pendiente'
  }
 
  const columnas = [
    { key: 'id', label: '#' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'tipo_venta', label: 'Tipo',
      render: r => <span className={`badge ${r.tipo_venta === 'domicilio' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-primary/20 text-green-700 dark:text-primary'}`}>
        {r.tipo_venta === 'domicilio' ? '🛵 domicilio' : '🏪 mostrador'}
      </span>
    },
    { key: 'total', label: 'Total', render: r => formatPrecio(r.total) },
    { key: 'estado_id', label: 'Estado',
      render: r => (
        <select value={r.estado_id || ''} onChange={e => cambiarEstado.mutate({ id: r.id, estado_id: +e.target.value })}
          onClick={e => e.stopPropagation()}
          className="text-xs bg-transparent border border-gray-200 dark:border-dark-border rounded px-1 py-0.5 cursor-pointer">
          {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
      )
    },
    { key: 'fecha_pedido', label: 'Fecha', render: r => formatFechaHora(r.fecha_pedido) },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">pedidos</h1>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setModalConfig(true)} className="btn-ghost"><Settings size={14} /></button>
          <button onClick={() => descargarPDF('/reportes/pedidos', 'reporte-pedidos.pdf')} className="btn-outline"><Download size={14} /> reporte</button>
          <button onClick={() => setModalNuevo(true)} className="btn-primary"><Plus size={14} /> nuevo pedido</button>
        </div>
      </div>
 
      {/* filtros */}
      <div className="flex gap-2 mb-4 flex-wrap items-end">
        <div>
          <p className="campo-label mb-0.5">buscar</p>
          <input value={filtroBusqueda} onChange={e => setFiltroBusqueda(e.target.value)} placeholder="# o cliente..." className="campo-input w-36 text-xs" />
        </div>
        <div>
          <p className="campo-label mb-0.5">estado</p>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="campo-input w-36 text-xs">
            <option value="">todos</option>
            {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
          </select>
        </div>
        <div>
          <p className="campo-label mb-0.5">desde</p>
          <input type="datetime-local" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)} className="campo-input text-xs" />
        </div>
        <div>
          <p className="campo-label mb-0.5">hasta</p>
          <input type="datetime-local" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)} className="campo-input text-xs" />
        </div>
        {(filtroEstado || filtroDesde || filtroHasta || filtroBusqueda) && (
          <button onClick={() => { setFiltroEstado(''); setFiltroDesde(''); setFiltroHasta(''); setFiltroBusqueda('') }}
            className="btn-ghost text-xs text-red-400 self-end">limpiar</button>
        )}
      </div>
 
      <Tabla columnas={columnas} datos={pedidosFiltrados} sinBusqueda
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, pedido: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => descargarPDF(`/reportes/pedido/${fila.id}`, `comprobante-${fila.id}.pdf`)} className="btn-ghost"><Download size={14} /></button>
          <button onClick={() => setModalHistorial({ abierto: true, cliente: { id: fila.cliente_id_ref, nombre: fila.cliente } })} className="btn-ghost"><History size={14} /></button>
        </>)}
      />
 
      {/* ───── MODAL NUEVO PEDIDO ───── */}
      <Modal abierto={modalNuevo}
        onCerrar={() => { setModalNuevo(false); setForm(formVacio); setProdBusqueda(''); setClienteBusqueda('') }}
        titulo="nuevo pedido" ancho="max-w-2xl">
        <form onSubmit={handleCrear} className="space-y-4">
 
          {/* TIPO DE VENTA — 2 botones visuales */}
          <div>
            <label className="campo-label">tipo de venta</label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {[
                { val: 'mostrador', label: 'Mostrador', Icon: ShoppingCart, color: 'primary' },
                { val: 'domicilio', label: 'Domicilio',  Icon: Bike,         color: 'blue' }
              ].map(({ val, label, Icon, color }) => (
                <button key={val} type="button" onClick={() => setForm({ ...form, tipo_venta: val })}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    form.tipo_venta === val
                      ? color === 'primary' ? 'border-primary bg-primary/10 text-primary' : 'border-blue-500 bg-blue-500/10 text-blue-500'
                      : 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-text/60'
                  }`}>
                  <Icon size={16} /> {label}
                </button>
              ))}
            </div>
          </div>
 
          {/* CLIENTE — registrado o manual */}
          <div>
            <label className="campo-label">cliente</label>
            <div className="flex gap-2 mb-2">
              {[{ val: 'registrado', label: 'cliente registrado' }, { val: 'manual', label: 'nombre manual' }].map(t => (
                <button key={t.val} type="button"
                  onClick={() => { setForm({ ...form, tipo_cliente: t.val, cliente_id: '', cliente_nombre: '' }); setClienteBusqueda('') }}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    form.tipo_cliente === t.val ? 'bg-primary text-dark-bg border-primary' : 'border-gray-200 dark:border-dark-border text-gray-500'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
 
            {form.tipo_cliente === 'registrado' ? (
              <div className="relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input value={clienteBusqueda}
                  onChange={e => setClienteBusqueda(e.target.value)}
                  className="campo-input pl-8 text-xs" placeholder="buscar cliente por nombre..." />
                {clienteBusqueda && clientesFiltrados.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 bg-light-card dark:bg-dark-card
                    border border-gray-200 dark:border-dark-border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {clientesFiltrados.map(c => (
                      <button key={c.id} type="button"
                        onClick={() => { setForm({ ...form, cliente_id: c.id }); setClienteBusqueda(`${c.nombre} ${c.apellido}`) }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-primary/10 transition-colors flex justify-between ${
                          form.cliente_id === c.id ? 'bg-primary/10 text-primary' : 'text-light-text dark:text-dark-text'
                        }`}>
                        <span>{c.nombre} {c.apellido}</span>
                        {c.telefono && <span className="text-gray-400">{c.telefono}</span>}
                      </button>
                    ))}
                  </div>
                )}
                {form.cliente_id && (
                  <p className="text-xs text-primary mt-1">
                    ✓ seleccionado: {clientes.find(c => c.id === +form.cliente_id)?.nombre} {clientes.find(c => c.id === +form.cliente_id)?.apellido}
                  </p>
                )}
              </div>
            ) : (
              <input value={form.cliente_nombre}
                onChange={e => setForm({ ...form, cliente_nombre: e.target.value })}
                className="campo-input" placeholder="nombre del cliente ocasional" />
            )}
          </div>
 
          {/* PRODUCTOS — buscador + código de barras */}
          <div className="p-3 rounded-xl border border-gray-200 dark:border-dark-border space-y-3">
            <p className="text-xs font-semibold text-light-text dark:text-dark-text">productos</p>
            <div className="flex gap-2">
              {/* búsqueda por nombre */}
              <div className="flex-1 relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input value={prodBusqueda}
                  onChange={e => { setProdBusqueda(e.target.value); buscarProducto(e.target.value) }}
                  className="campo-input pl-8 text-xs" placeholder="buscar por nombre o código..." />
                {prodsFiltrados.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 bg-light-card dark:bg-dark-card
                    border border-gray-200 dark:border-dark-border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {prodsFiltrados.map(p => (
                      <button key={p.id} type="button" onClick={() => agregarProducto(p)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 flex justify-between items-center">
                        <div>
                          <span className="text-light-text dark:text-dark-text">{p.nombre}</span>
                          {p.codigo_barras && <span className="text-gray-400 font-mono ml-2">{p.codigo_barras}</span>}
                        </div>
                        <span className="text-primary shrink-0 ml-2">{formatPrecio(p.precio)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {/* código de barras */}
              <div className="relative">
                <input ref={barcodeRef} placeholder="cód. barras"
                  className="campo-input w-28 text-xs pr-7"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); buscarPorCodigo(e.target.value); e.target.value = '' }}} />
                <Scan size={13} className="absolute right-2 top-2.5 text-gray-400" />
              </div>
            </div>
 
            {/* lista productos agregados */}
            {form.productos.length > 0 && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {form.productos.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-light-bg dark:bg-dark-bg">
                    <span className="flex-1 truncate mr-2 text-light-text dark:text-dark-text">{p.nombre}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1">
                        <button type="button"
                          onClick={() => setForm({ ...form, productos: form.productos.map((pp, ii) => ii === i ? { ...pp, cantidad: Math.max(1, pp.cantidad - 1) } : pp) })}
                          className="w-5 h-5 rounded bg-gray-200 dark:bg-dark-border text-center text-xs leading-5">-</button>
                        <span className="w-6 text-center font-medium">{p.cantidad}</span>
                        <button type="button"
                          onClick={() => setForm({ ...form, productos: form.productos.map((pp, ii) => ii === i ? { ...pp, cantidad: pp.cantidad + 1 } : pp) })}
                          className="w-5 h-5 rounded bg-gray-200 dark:bg-dark-border text-center text-xs leading-5">+</button>
                      </div>
                      <span className="text-primary font-medium w-16 text-right">{formatPrecio(p.precio_unitario * p.cantidad)}</span>
                      <button type="button" onClick={() => quitarProducto(i)} className="text-red-400"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-semibold pt-2 border-t border-gray-200 dark:border-dark-border">
                  <span>total</span>
                  <span className="text-primary text-sm">{formatPrecio(totalPedido)}</span>
                </div>
              </div>
            )}
          </div>
 
          {/* NOTAS */}
          <div>
            <label className="campo-label">notas / observaciones (opcional)</label>
            <textarea value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })}
              rows={2} className="campo-input resize-none" placeholder="instrucciones especiales..." />
          </div>
 
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button type="button"
              onClick={() => { setModalNuevo(false); setForm(formVacio); setProdBusqueda(''); setClienteBusqueda('') }}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">cancelar</button>
            <button type="submit" disabled={crearPedido.isPending} className="btn-primary">
              {crearPedido.isPending ? 'creando...' : 'crear pedido'}
            </button>
          </div>
        </form>
      </Modal>
 
      {/* ───── MODAL DETALLE ───── */}
      <Modal abierto={modalDetalle.abierto} onCerrar={() => setModalDetalle({ abierto: false, pedido: null })}
        titulo={`pedido #${modalDetalle.pedido?.id}`}>
        {modalDetalle.pedido && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><p className="campo-label">cliente</p><p className="font-medium">{modalDetalle.pedido.cliente}</p></div>
              <div><p className="campo-label">tipo</p>
                <span className={`badge ${modalDetalle.pedido.tipo_venta === 'domicilio' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-primary/20 text-green-700 dark:text-primary'}`}>
                  {modalDetalle.pedido.tipo_venta}</span></div>
              <div><p className="campo-label">estado</p><span className={getBadge(modalDetalle.pedido.estado)}>{modalDetalle.pedido.estado}</span></div>
              <div><p className="campo-label">total</p><p className="text-primary font-bold text-sm">{formatPrecio(modalDetalle.pedido.total)}</p></div>
              <div className="col-span-2"><p className="campo-label">fecha</p><p>{formatFechaHora(modalDetalle.pedido.fecha_pedido)}</p></div>
              {modalDetalle.pedido.notas && <div className="col-span-2"><p className="campo-label">notas</p><p className="italic text-gray-500">{modalDetalle.pedido.notas}</p></div>}
            </div>
            <div className="pt-2 border-t border-gray-200 dark:border-dark-border">
              <p className="campo-label mb-1">cambiar estado</p>
              <div className="flex flex-wrap gap-1">
                {estados.map(e => (
                  <button key={e.id} type="button"
                    onClick={() => cambiarEstado.mutate({ id: modalDetalle.pedido.id, estado_id: e.id })}
                    className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                      modalDetalle.pedido.estado_id === e.id
                        ? 'bg-primary text-dark-bg border-primary'
                        : 'border-gray-200 dark:border-dark-border text-gray-500 hover:border-primary/40'
                    }`}>
                    {e.nombre}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
              <button onClick={() => descargarPDF(`/reportes/pedido/${modalDetalle.pedido.id}`, `comprobante-${modalDetalle.pedido.id}.pdf`)}
                className="btn-outline text-xs"><Download size={12} /> comprobante</button>
              {puedeAnular(modalDetalle.pedido) && (
                <button onClick={() => anular.mutate(modalDetalle.pedido.id)} disabled={anular.isPending}
                  className="px-3 py-1.5 text-xs border border-red-400/40 text-red-400 rounded-lg hover:bg-red-400/10">
                  {anular.isPending ? 'anulando...' : 'anular pedido'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
 
      {/* ───── MODAL HISTORIAL ───── */}
      <Modal abierto={modalHistorial.abierto} onCerrar={() => setModalHistorial({ abierto: false, cliente: null })}
        titulo={`historial — ${modalHistorial.cliente?.nombre || ''}`} ancho="max-w-lg">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {historial.length === 0 && <p className="text-xs text-center text-gray-400 py-6">sin pedidos</p>}
          {historial.map(p => (
            <div key={p.id} className="flex justify-between p-3 rounded-lg border border-gray-200 dark:border-dark-border text-xs">
              <div><p className="font-medium">#{p.id}</p><p className="text-gray-400 mt-0.5">{formatFecha(p.fecha_pedido)}</p></div>
              <div className="text-right">
                <p className="text-primary font-medium">{formatPrecio(p.total)}</p>
                <span className={getBadge(p.estado)}>{p.estado}</span>
              </div>
            </div>
          ))}
        </div>
      </Modal>
 
      {/* ───── MODAL CONFIG ───── */}
      <Modal abierto={modalConfig} onCerrar={() => setModalConfig(false)} titulo="configurar cancelación" ancho="max-w-sm">
        <div className="space-y-4">
          <div>
            <label className="campo-label">horas máximas para cancelar</label>
            <input type="number" min="1" max="72" value={configCancelacion.horas}
              onChange={e => setConfigCancelacion({ horas: +e.target.value })} className="campo-input" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => setModalConfig(false)}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">cancelar</button>
            <button onClick={() => { setModalConfig(false); toast.success('guardado') }} className="btn-primary">guardar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
