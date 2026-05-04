import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import Tabla from '../../components/Tabla'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { Plus, Eye, Download, Trash2, Ban } from 'lucide-react'
import { formatPrecio, formatFechaHora } from '../../utils/validaciones'
import { descargarPDF } from '../../utils/reportes'
 
export default function Ventas() {
  const qc = useQueryClient()
  const [modalNuevo, setModalNuevo]     = useState(false)
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, venta: null })
  const [modalAnular, setModalAnular]   = useState({ abierto: false, venta: null })
  const [filtroTipo, setFiltroTipo]     = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroBusqueda, setFiltroBusqueda] = useState('')
  const [form, setForm] = useState({ cliente_id: '', tipo_venta: 'mostrador', productos: [] })
  const [prodSel, setProdSel] = useState({ producto_id: '', cantidad: 1 })
 
  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos'],
    queryFn: () => api.get('/pedidos').then(r => r.data.datos)
  })
  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => api.get('/clientes').then(r => r.data.datos.filter(c => c.estado))
  })
  const { data: productos = [] } = useQuery({
    queryKey: ['productos'],
    queryFn: () => api.get('/productos').then(r => r.data.datos.filter(p => p.estado && p.stock > 0))
  })
  const { data: estados = [] } = useQuery({
    queryKey: ['estados-pedido'],
    queryFn: () => api.get('/estados?tipo=pedido').then(r => r.data.datos)
  })
 
  const crearVenta = useMutation({
    mutationFn: data => api.post('/pedidos', data),
    onSuccess: () => {
      qc.invalidateQueries(['pedidos'])
      setModalNuevo(false)
      setForm({ cliente_id: '', tipo_venta: 'mostrador', productos: [] })
      toast.success('venta registrada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const anular = useMutation({
    mutationFn: id => api.patch(`/pedidos/${id}/estado`, { estado_id: 3 }),
    onSuccess: () => {
      qc.invalidateQueries(['pedidos'])
      setModalAnular({ abierto: false, venta: null })
      toast.success('venta anulada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error al anular')
  })
 
  const agregarProducto = () => {
    if (!prodSel.producto_id) { toast.error('selecciona un producto'); return }
    const prod = productos.find(p => p.id === +prodSel.producto_id)
    if (!prod) return
    const existe = form.productos.find(p => p.producto_id === +prodSel.producto_id)
    if (existe) {
      setForm({ ...form, productos: form.productos.map(p =>
        p.producto_id === +prodSel.producto_id
          ? { ...p, cantidad: p.cantidad + +prodSel.cantidad } : p
      )})
    } else {
      setForm({ ...form, productos: [...form.productos, {
        producto_id: +prodSel.producto_id,
        cantidad: +prodSel.cantidad,
        precio_unitario: parseFloat(prod.precio),
        nombre: prod.nombre
      }]})
    }
    setProdSel({ producto_id: '', cantidad: 1 })
  }
 
  const quitarProducto = idx =>
    setForm({ ...form, productos: form.productos.filter((_, i) => i !== idx) })
 
  const totalVenta = form.productos.reduce(
    (s, p) => s + p.precio_unitario * p.cantidad, 0
  )
 
  const handleCrear = e => {
    e.preventDefault()
    if (!form.cliente_id)       { toast.error('selecciona un cliente'); return }
    if (!form.productos.length) { toast.error('agrega al menos un producto'); return }
    crearVenta.mutate(form)
  }
 
  const descargarReporte = () => {
    const params = new URLSearchParams()
    if (filtroTipo)   params.append('tipo_venta', filtroTipo)
    if (filtroEstado) params.append('estado_id', filtroEstado)
    descargarPDF(`/reportes/ventas?${params}`, 'reporte-ventas.pdf')
  }
 
  const ventasFiltradas = pedidos.filter(p => {
    if (filtroTipo && p.tipo_venta !== filtroTipo) return false
    if (filtroEstado && p.estado_id !== +filtroEstado) return false
    if (filtroBusqueda && !`${p.id} ${p.cliente} ${p.tipo_venta}`
      .toLowerCase().includes(filtroBusqueda.toLowerCase())) return false
    return true
  })
 
  const columnas = [
    { key: 'id',         label: '#' },
    { key: 'cliente',    label: 'Cliente' },
    { key: 'tipo_venta', label: 'Tipo',
      render: r => (
        <span className={`badge ${r.tipo_venta === 'domicilio'
          ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
          : 'bg-primary/20 text-green-700 dark:text-primary'}`}>
          {r.tipo_venta}
        </span>
      )
    },
    { key: 'total', label: 'Total', render: r => formatPrecio(r.total) },
    { key: 'estado', label: 'Estado',
      render: r => (
        <span className={r.estado_id === 3 ? 'badge-anulado' :
          r.estado_id === 2 ? 'badge-proceso' : 'badge-pendiente'}>
          {r.estado}
        </span>
      )
    },
    { key: 'fecha_pedido', label: 'Fecha', render: r => formatFechaHora(r.fecha_pedido) },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">ventas</h1>
        <div className="flex gap-2">
          <button onClick={descargarReporte} className="btn-outline">
            <Download size={14} /> reporte
          </button>
          <button onClick={() => setModalNuevo(true)} className="btn-primary">
            <Plus size={14} /> nueva venta
          </button>
        </div>
      </div>
 
      {/* filtros */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input value={filtroBusqueda}
          onChange={e => setFiltroBusqueda(e.target.value)}
          placeholder="buscar por cliente o #..."
          className="campo-input w-48 text-xs" />
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}
          className="campo-input w-36 text-xs">
          <option value="">todos los tipos</option>
          <option value="mostrador">mostrador</option>
          <option value="domicilio">domicilio</option>
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
          className="campo-input w-36 text-xs">
          <option value="">todos los estados</option>
          {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
        {(filtroTipo || filtroEstado || filtroBusqueda) && (
          <button
            onClick={() => { setFiltroTipo(''); setFiltroEstado(''); setFiltroBusqueda('') }}
            className="btn-ghost text-xs text-red-400">
            limpiar
          </button>
        )}
      </div>
 
      <Tabla columnas={columnas} datos={ventasFiltradas} sinBusqueda
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, venta: fila })}
            className="btn-ghost" title="ver detalles">
            <Eye size={14} />
          </button>
          <button
            onClick={() => descargarPDF(`/reportes/pedido/${fila.id}`, `comprobante-${fila.id}.pdf`)}
            className="btn-ghost" title="descargar comprobante">
            <Download size={14} />
          </button>
          {fila.estado_id !== 3 && (
            <button onClick={() => setModalAnular({ abierto: true, venta: fila })}
              className="btn-ghost hover:text-red-400" title="anular venta">
              <Ban size={14} />
            </button>
          )}
        </>)}
      />
 
      {/* modal nueva venta */}
      <Modal abierto={modalNuevo} onCerrar={() => setModalNuevo(false)}
        titulo="registrar venta" ancho="max-w-xl">
        <form onSubmit={handleCrear} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="campo-label">cliente *</label>
              <select value={form.cliente_id}
                onChange={e => setForm({ ...form, cliente_id: e.target.value })}
                className="campo-input">
                <option value="">seleccionar...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="campo-label">tipo de venta</label>
              <select value={form.tipo_venta}
                onChange={e => setForm({ ...form, tipo_venta: e.target.value })}
                className="campo-input">
                <option value="mostrador">mostrador</option>
                <option value="domicilio">domicilio</option>
              </select>
            </div>
          </div>
 
          <div className="p-3 rounded-lg border border-gray-200 dark:border-dark-border space-y-2">
            <p className="text-xs font-medium text-light-text dark:text-dark-text">productos</p>
            <div className="flex gap-2">
              <select value={prodSel.producto_id}
                onChange={e => setProdSel({ ...prodSel, producto_id: e.target.value })}
                className="campo-input flex-1 text-xs">
                <option value="">seleccionar producto...</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} - {formatPrecio(p.precio)} (stock: {p.stock})
                  </option>
                ))}
              </select>
              <input type="number" min="1" value={prodSel.cantidad}
                onChange={e => setProdSel({ ...prodSel, cantidad: e.target.value })}
                className="campo-input w-16 text-xs" placeholder="cant" />
              <button type="button" onClick={agregarProducto} className="btn-primary text-xs">
                +
              </button>
            </div>
 
            {form.productos.length > 0 && (
              <div className="space-y-1 max-h-36 overflow-y-auto">
                {form.productos.map((p, i) => (
                  <div key={i} className="flex items-center justify-between text-xs
                    p-2 rounded bg-light-bg dark:bg-dark-bg">
                    <span className="text-light-text dark:text-dark-text">{p.nombre}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">
                        {p.cantidad} x {formatPrecio(p.precio_unitario)}
                      </span>
                      <span className="text-primary font-medium">
                        {formatPrecio(p.precio_unitario * p.cantidad)}
                      </span>
                      <button type="button" onClick={() => quitarProducto(i)}
                        className="text-red-400 hover:text-red-300">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between text-xs font-medium pt-1
                  border-t border-gray-200 dark:border-dark-border">
                  <span className="text-light-text dark:text-dark-text">total</span>
                  <span className="text-primary">{formatPrecio(totalVenta)}</span>
                </div>
              </div>
            )}
          </div>
 
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button type="button" onClick={() => setModalNuevo(false)}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border
                text-gray-500 dark:text-dark-text/60 rounded-lg hover:border-primary/40">
              cancelar
            </button>
            <button type="submit" disabled={crearVenta.isPending} className="btn-primary">
              {crearVenta.isPending ? 'registrando...' : 'registrar venta'}
            </button>
          </div>
        </form>
      </Modal>
 
      {/* modal detalles */}
      <Modal abierto={modalDetalle.abierto}
        onCerrar={() => setModalDetalle({ abierto: false, venta: null })}
        titulo={`venta #${modalDetalle.venta?.id}`}>
        {modalDetalle.venta && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="campo-label">cliente</p>
                <p className="text-light-text dark:text-dark-text font-medium">
                  {modalDetalle.venta.cliente}
                </p>
              </div>
              <div>
                <p className="campo-label">tipo de venta</p>
                <span className={`badge ${modalDetalle.venta.tipo_venta === 'domicilio'
                  ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400'
                  : 'bg-primary/20 text-green-700 dark:text-primary'}`}>
                  {modalDetalle.venta.tipo_venta}
                </span>
              </div>
              <div>
                <p className="campo-label">estado</p>
                <span className={modalDetalle.venta.estado_id === 3 ? 'badge-anulado' :
                  modalDetalle.venta.estado_id === 2 ? 'badge-proceso' : 'badge-pendiente'}>
                  {modalDetalle.venta.estado}
                </span>
              </div>
              <div>
                <p className="campo-label">total</p>
                <p className="text-primary font-semibold text-sm">
                  {formatPrecio(modalDetalle.venta.total)}
                </p>
              </div>
              <div className="col-span-2">
                <p className="campo-label">fecha</p>
                <p className="text-light-text dark:text-dark-text">
                  {formatFechaHora(modalDetalle.venta.fecha_pedido)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
              <button
                onClick={() => descargarPDF(`/reportes/pedido/${modalDetalle.venta.id}`, `comprobante-${modalDetalle.venta.id}.pdf`)}
                className="btn-outline text-xs">
                <Download size={12} /> comprobante
              </button>
              {modalDetalle.venta.estado_id !== 3 && (
                <button onClick={() => {
                  setModalDetalle({ abierto: false, venta: null })
                  setModalAnular({ abierto: true, venta: modalDetalle.venta })
                }} className="px-3 py-1.5 text-xs border border-red-400/40 text-red-400
                  rounded-lg hover:bg-red-400/10 transition-colors">
                  anular venta
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
 
      {/* modal confirmar anular */}
      <Modal abierto={modalAnular.abierto}
        onCerrar={() => setModalAnular({ abierto: false, venta: null })}
        titulo="confirmar anulacion" ancho="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-light-text dark:text-dark-text">
            estas seguro que deseas anular la venta
            <span className="font-medium text-primary"> #{modalAnular.venta?.id}</span> de
            <span className="font-medium"> {modalAnular.venta?.cliente}</span> por
            <span className="font-medium text-primary"> {formatPrecio(modalAnular.venta?.total)}</span>?
            esta accion no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => setModalAnular({ abierto: false, venta: null })}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border
                text-gray-500 dark:text-dark-text/60 rounded-lg hover:border-primary/40">
              cancelar
            </button>
            <button onClick={() => anular.mutate(modalAnular.venta.id)}
              disabled={anular.isPending}
              className="px-4 py-1.5 text-sm bg-red-500 hover:bg-red-600
                text-white rounded-lg transition-colors disabled:opacity-50">
              {anular.isPending ? 'anulando...' : 'anular venta'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
