import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import Tabla from '../../components/Tabla'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { Plus, Eye, Download, Trash2, Ban, Search, Scan } from 'lucide-react'
import { formatPrecio, formatFechaHora } from '../../utils/validaciones'
import { descargarPDF } from '../../utils/reportes'
 
export default function Ventas() {
  const qc = useQueryClient()
  const [modalNuevo, setModalNuevo]     = useState(false)
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, venta: null })
  const [modalAnular, setModalAnular]   = useState({ abierto: false, venta: null })
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [form, setForm] = useState({ tipo_cliente: 'registrado', cliente_id: '', cliente_nombre: '', productos: [] })
  const [prodBusqueda, setProdBusqueda]   = useState('')
  const [prodsFiltrados, setProdsFiltrados] = useState([])
 
  const { data: pedidos = [] } = useQuery({ queryKey: ['pedidos'], queryFn: () => api.get('/pedidos').then(r => r.data.datos) })
  const { data: clientes = [] } = useQuery({ queryKey: ['clientes'], queryFn: () => api.get('/clientes').then(r => r.data.datos.filter(c => c.estado)) })
  const { data: productos = [] } = useQuery({ queryKey: ['productos'], queryFn: () => api.get('/productos').then(r => r.data.datos.filter(p => p.estado && p.stock > 0)) })
  const { data: estados = [] } = useQuery({ queryKey: ['estados-pedido'], queryFn: () => api.get('/estados?tipo=pedido').then(r => r.data.datos) })
 
  const crearVenta = useMutation({
    mutationFn: data => api.post('/pedidos', { ...data, tipo_venta: 'mostrador' }),
    onSuccess: () => {
      qc.invalidateQueries(['pedidos'])
      setModalNuevo(false)
      setForm({ tipo_cliente: 'registrado', cliente_id: '', cliente_nombre: '', productos: [] })
      toast.success('venta registrada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const anular = useMutation({
    mutationFn: id => {
      const e = estados.find(e => e.nombre?.toLowerCase().includes('anula'))
      return api.patch(`/pedidos/${id}/estado`, { estado_id: e?.id || 3 })
    },
    onSuccess: () => {
      qc.invalidateQueries(['pedidos'])
      setModalAnular({ abierto: false, venta: null })
      toast.success('venta anulada')
    }
  })
 
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
      if (data.ok) agregarProducto(data.datos)
      else toast.error('producto no encontrado')
    } catch { toast.error('producto no encontrado') }
  }
 
  const agregarProducto = prod => {
    const existe = form.productos.find(p => p.producto_id === prod.id)
    if (existe) {
      setForm({ ...form, productos: form.productos.map(p => p.producto_id === prod.id ? { ...p, cantidad: p.cantidad + 1 } : p) })
    } else {
      setForm({ ...form, productos: [...form.productos, { producto_id: prod.id, cantidad: 1, precio_unitario: parseFloat(prod.precio), nombre: prod.nombre }] })
    }
    setProdBusqueda(''); setProdsFiltrados([])
  }
 
  const quitarProducto = idx => setForm({ ...form, productos: form.productos.filter((_, i) => i !== idx) })
  const totalVenta = form.productos.reduce((s, p) => s + p.precio_unitario * p.cantidad, 0)
 
  const handleCrear = e => {
    e.preventDefault()
    if (form.tipo_cliente === 'registrado' && !form.cliente_id) { toast.error('selecciona un cliente'); return }
    if (form.tipo_cliente === 'manual' && !form.cliente_nombre.trim()) { toast.error('ingresa el nombre'); return }
    if (!form.productos.length) { toast.error('agrega al menos un producto'); return }
    crearVenta.mutate({
      cliente_id: form.tipo_cliente === 'registrado' ? form.cliente_id : null,
      cliente_nombre: form.tipo_cliente === 'manual' ? form.cliente_nombre : null,
      productos: form.productos
    })
  }
 
  const getBadge = nombre => {
    if (!nombre) return 'badge-pendiente'
    const n = nombre.toLowerCase()
    if (n.includes('anula')) return 'badge-anulado'
    if (n.includes('entrega') || n.includes('paga')) return 'badge-activo'
    if (n.includes('proceso')) return 'badge-proceso'
    return 'badge-pendiente'
  }
 
  const ventasFiltradas = pedidos.filter(p => {
    if (filtroEstado && p.estado_id !== +filtroEstado) return false
    if (filtroBusqueda && !`${p.id} ${p.cliente}`.toLowerCase().includes(filtroBusqueda.toLowerCase())) return false
    return true
  })
 
  const columnas = [
    { key: 'id', label: '#' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'tipo_venta', label: 'Tipo',
      render: r => (
        <span className={`badge ${r.tipo_venta === 'domicilio' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-primary/20 text-green-700 dark:text-primary'}`}>
          {r.tipo_venta === 'domicilio' ? '🛵 domicilio' : '🏪 mostrador'}
        </span>
      )
    },
    { key: 'total', label: 'Total', render: r => formatPrecio(r.total) },
    { key: 'estado', label: 'Estado', render: r => <span className={getBadge(r.estado)}>{r.estado || '-'}</span> },
    { key: 'fecha_pedido', label: 'Fecha', render: r => formatFechaHora(r.fecha_pedido) },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">ventas</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarPDF('/reportes/ventas', 'reporte-ventas.pdf')} className="btn-outline">
            <Download size={14} /> reporte</button>
          <button onClick={() => setModalNuevo(true)} className="btn-primary"><Plus size={14} /> nueva venta</button>
        </div>
      </div>
 
      <div className="flex gap-2 mb-4 flex-wrap">
        <input value={filtroBusqueda} onChange={e => setFiltroBusqueda(e.target.value)}
          placeholder="buscar cliente o #..." className="campo-input w-48 text-xs" />
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="campo-input w-36 text-xs">
          <option value="">todos los estados</option>
          {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
        {(filtroEstado || filtroBusqueda) && (
          <button onClick={() => { setFiltroEstado(''); setFiltroBusqueda('') }} className="btn-ghost text-xs text-red-400">limpiar</button>
        )}
      </div>
 
      <Tabla columnas={columnas} datos={ventasFiltradas} sinBusqueda
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, venta: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => descargarPDF(`/reportes/pedido/${fila.id}`, `comprobante-${fila.id}.pdf`)} className="btn-ghost"><Download size={14} /></button>
          {!fila.estado?.toLowerCase().includes('anula') && (
            <button onClick={() => setModalAnular({ abierto: true, venta: fila })} className="btn-ghost hover:text-red-400"><Ban size={14} /></button>
          )}
        </>)}
      />
 
      {/* MODAL NUEVA VENTA */}
      <Modal abierto={modalNuevo} onCerrar={() => setModalNuevo(false)} titulo="registrar venta — mostrador" ancho="max-w-xl">
        <form onSubmit={handleCrear} className="space-y-3">
          <div>
            <label className="campo-label">cliente</label>
            <div className="flex gap-2 mb-2">
              {[{ val: 'registrado', label: 'registrado' }, { val: 'manual', label: 'nombre manual' }].map(t => (
                <button key={t.val} type="button"
                  onClick={() => setForm({ ...form, tipo_cliente: t.val, cliente_id: '', cliente_nombre: '' })}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${form.tipo_cliente === t.val ? 'bg-primary text-dark-bg border-primary' : 'border-gray-200 dark:border-dark-border text-gray-500'}`}>
                  {t.label}
                </button>
              ))}
            </div>
            {form.tipo_cliente === 'registrado' ? (
              <select value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value })} className="campo-input">
                <option value="">seleccionar...</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>)}
              </select>
            ) : (
              <input value={form.cliente_nombre} onChange={e => setForm({ ...form, cliente_nombre: e.target.value })}
                className="campo-input" placeholder="nombre del cliente" />
            )}
          </div>
 
          <div className="p-3 rounded-xl border border-gray-200 dark:border-dark-border space-y-2">
            <p className="text-xs font-semibold">productos</p>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input value={prodBusqueda} onChange={e => { setProdBusqueda(e.target.value); buscarProducto(e.target.value) }}
                  className="campo-input pl-8 text-xs" placeholder="buscar por nombre..." />
                {prodsFiltrados.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-20 bg-light-card dark:bg-dark-card
                    border border-gray-200 dark:border-dark-border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                    {prodsFiltrados.map(p => (
                      <button key={p.id} type="button" onClick={() => agregarProducto(p)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 flex justify-between">
                        <span>{p.nombre}</span>
                        <span className="text-primary">{formatPrecio(p.precio)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <input placeholder="cod. barras" className="campo-input w-28 text-xs pr-7"
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); buscarPorCodigo(e.target.value); e.target.value = '' }}} />
                <Scan size={12} className="absolute right-2 top-2.5 text-gray-400" />
              </div>
            </div>
            {form.productos.length > 0 && (
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {form.productos.map((p, i) => (
                  <div key={i} className="flex justify-between items-center text-xs p-2 rounded bg-light-bg dark:bg-dark-bg">
                    <span className="flex-1 truncate">{p.nombre}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => setForm({ ...form, productos: form.productos.map((pp, ii) => ii === i ? { ...pp, cantidad: Math.max(1, pp.cantidad - 1) } : pp) })}
                          className="w-5 h-5 rounded bg-gray-200 dark:bg-dark-border text-center text-xs leading-5">-</button>
                        <span className="w-5 text-center">{p.cantidad}</span>
                        <button type="button" onClick={() => setForm({ ...form, productos: form.productos.map((pp, ii) => ii === i ? { ...pp, cantidad: pp.cantidad + 1 } : pp) })}
                          className="w-5 h-5 rounded bg-gray-200 dark:bg-dark-border text-center text-xs leading-5">+</button>
                      </div>
                      <span className="text-primary font-medium w-16 text-right">{formatPrecio(p.precio_unitario * p.cantidad)}</span>
                      <button type="button" onClick={() => quitarProducto(i)} className="text-red-400"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-bold pt-1 border-t border-gray-200 dark:border-dark-border">
                  <span>total</span><span className="text-primary">{formatPrecio(totalVenta)}</span>
                </div>
              </div>
            )}
          </div>
 
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button type="button" onClick={() => setModalNuevo(false)}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">cancelar</button>
            <button type="submit" disabled={crearVenta.isPending} className="btn-primary">
              {crearVenta.isPending ? 'registrando...' : 'registrar venta'}
            </button>
          </div>
        </form>
      </Modal>
 
      {/* MODAL DETALLE (solo lectura) */}
      <Modal abierto={modalDetalle.abierto} onCerrar={() => setModalDetalle({ abierto: false, venta: null })}
        titulo={`venta #${modalDetalle.venta?.id}`}>
        {modalDetalle.venta && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="campo-label">cliente</p><p className="font-medium">{modalDetalle.venta.cliente}</p></div>
              <div><p className="campo-label">tipo</p>
                <span className={`badge ${modalDetalle.venta.tipo_venta === 'domicilio' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-primary/20 text-green-700 dark:text-primary'}`}>
                  {modalDetalle.venta.tipo_venta}</span></div>
              <div><p className="campo-label">estado</p><span className={getBadge(modalDetalle.venta.estado)}>{modalDetalle.venta.estado}</span></div>
              <div><p className="campo-label">total</p><p className="text-primary font-bold text-sm">{formatPrecio(modalDetalle.venta.total)}</p></div>
              <div className="col-span-2"><p className="campo-label">fecha</p><p>{formatFechaHora(modalDetalle.venta.fecha_pedido)}</p></div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
              <button onClick={() => descargarPDF(`/reportes/pedido/${modalDetalle.venta.id}`, `comprobante-${modalDetalle.venta.id}.pdf`)}
                className="btn-outline text-xs"><Download size={12} /> comprobante</button>
              {!modalDetalle.venta.estado?.toLowerCase().includes('anula') && (
                <button onClick={() => { setModalDetalle({ abierto: false, venta: null }); setModalAnular({ abierto: true, venta: modalDetalle.venta }) }}
                  className="px-3 py-1.5 text-xs border border-red-400/40 text-red-400 rounded-lg hover:bg-red-400/10">anular venta</button>
              )}
            </div>
          </div>
        )}
      </Modal>
 
      {/* MODAL ANULAR */}
      <Modal abierto={modalAnular.abierto} onCerrar={() => setModalAnular({ abierto: false, venta: null })}
        titulo="confirmar anulacion" ancho="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm">estas seguro de anular la venta
            <span className="font-medium text-primary"> #{modalAnular.venta?.id}</span> de
            <span className="font-medium"> {modalAnular.venta?.cliente}</span> por
            <span className="text-primary"> {formatPrecio(modalAnular.venta?.total)}</span>?
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => setModalAnular({ abierto: false, venta: null })}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">cancelar</button>
            <button onClick={() => anular.mutate(modalAnular.venta.id)} disabled={anular.isPending}
              className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50">
              {anular.isPending ? 'anulando...' : 'anular'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
