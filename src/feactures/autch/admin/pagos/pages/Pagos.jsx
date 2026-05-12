import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/services/api'
import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
import toast from 'react-hot-toast'
import { Plus, Eye, Download, Ban, CheckCircle, XCircle } from 'lucide-react'
import { formatPrecio, formatFecha } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
 
const formVacio = { pedido_id: '', monto: '', metodo: 'efectivo' }
 
export default function Pagos() {
  const qc = useQueryClient()
  const [modalNuevo, setModalNuevo]     = useState(false)
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, pago: null })
  const [modalAnular, setModalAnular]   = useState({ abierto: false, pago: null })
  const [form, setForm]     = useState(formVacio)
  const [errores, setErrores] = useState({})
  const [filtroEstado, setFiltroEstado] = useState('')
 
  const { data: pagos = [] }   = useQuery({ queryKey: ['pagos'],   queryFn: () => api.get('/pagos').then(r => r.data.datos) })
  const { data: pedidos = [] } = useQuery({ queryKey: ['pedidos'], queryFn: () => api.get('/pedidos').then(r =>
    r.data.datos.filter(p => !p.estado?.toLowerCase().includes('anula'))
  )})
 
  // calcular monto pagado por pedido
  const pagadoPorPedido = pedidos.reduce((acc, p) => {
    const pagosActivos = pagos.filter(pg => pg.pedido_id === p.id && !pg.estado?.toLowerCase().includes('anula'))
    acc[p.id] = pagosActivos.reduce((s, pg) => s + +pg.monto, 0)
    return acc
  }, {})
 
  const crear = useMutation({
    mutationFn: data => api.post('/pagos', data),
    onSuccess: () => {
      qc.invalidateQueries(['pagos']); qc.invalidateQueries(['pedidos'])
      setModalNuevo(false); setForm(formVacio); toast.success('pago registrado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const anular = useMutation({
    mutationFn: id => api.patch(`/pagos/${id}/anular`),
    onSuccess: () => {
      qc.invalidateQueries(['pagos'])
      setModalAnular({ abierto: false, pago: null })
      toast.success('pago anulado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const pedidoSel      = pedidos.find(p => p.id === +form.pedido_id)
  const totalPedido    = pedidoSel?.total || 0
  const totalPagado    = pagadoPorPedido[+form.pedido_id] || 0
  const montoPendiente = Math.max(0, totalPedido - totalPagado)
  const pagoCompleto   = totalPedido > 0 && montoPendiente === 0
 
  const validar = () => {
    const e = {}
    if (!form.pedido_id) e.pedido_id = 'selecciona un pedido'
    if (!form.monto || +form.monto <= 0) e.monto = 'monto inválido'
    if (pagoCompleto) e.monto = 'el pedido ya está completamente pagado'
    return e
  }
 
  const handleSubmit = e => {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length) { setErrores(e2); return }
    crear.mutate(form)
  }
 
  const esPagado  = nombre => nombre && (nombre.toLowerCase().includes('paga') || nombre.toLowerCase().includes('activ') || nombre.toLowerCase().includes('complet'))
  const esAnulado = nombre => nombre && (nombre.toLowerCase().includes('anula') || nombre.toLowerCase().includes('cancel'))
 
  const pagosFiltrados = pagos.filter(p => {
    if (filtroEstado === 'pagado')  return esPagado(p.estado)
    if (filtroEstado === 'anulado') return esAnulado(p.estado)
    return true
  })
 
  const columnas = [
    { key: 'id',        label: '#' },
    { key: 'pedido_id', label: 'Pedido', render: r => `#${r.pedido_id}` },
    { key: 'cliente',   label: 'Cliente', render: r => r.cliente || '-' },
    { key: 'monto',     label: 'Monto', render: r => formatPrecio(r.monto) },
    { key: 'metodo',    label: 'Método', render: r => r.metodo || '-' },
    { key: 'estado', label: 'Estado',
      render: r => (
        <div className="flex items-center gap-1">
          {esAnulado(r.estado)
            ? <XCircle size={13} className="text-red-400" />
            : <CheckCircle size={13} className="text-green-400" />}
          <span className={esAnulado(r.estado) ? 'badge-anulado' : 'badge-activo'}>
            {esAnulado(r.estado) ? 'anulado' : 'pagado'}
          </span>
        </div>
      )
    },
    { key: 'created_at', label: 'Fecha', render: r => formatFecha(r.created_at) },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">pagos</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarPDF('/reportes/pagos', 'reporte-pagos.pdf')} className="btn-outline">
            <Download size={14} /> reporte</button>
          <button onClick={() => setModalNuevo(true)} className="btn-primary"><Plus size={14} /> nuevo pago</button>
        </div>
      </div>
 
      {/* filtro — solo pagado o anulado */}
      <div className="flex gap-2 mb-4">
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="campo-input w-36 text-xs">
          <option value="">todos</option>
          <option value="pagado">pagados</option>
          <option value="anulado">anulados</option>
        </select>
        {filtroEstado && <button onClick={() => setFiltroEstado('')} className="btn-ghost text-xs text-red-400">limpiar</button>}
      </div>
 
      <Tabla columnas={columnas} datos={pagosFiltrados} sinBusqueda
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, pago: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => descargarPDF(`/reportes/pagos/${fila.id}`, `pago-${fila.id}.pdf`)} className="btn-ghost"><Download size={14} /></button>
          {!esAnulado(fila.estado) && (
            <button onClick={() => setModalAnular({ abierto: true, pago: fila })} className="btn-ghost hover:text-red-400">
              <Ban size={14} /></button>
          )}
        </>)}
      />
 
      {/* ───── MODAL NUEVO PAGO ───── */}
      <Modal abierto={modalNuevo} onCerrar={() => { setModalNuevo(false); setForm(formVacio); setErrores({}) }}
        titulo="registrar pago">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="campo-label">pedido *</label>
            <select value={form.pedido_id} onChange={e => setForm({ ...form, pedido_id: e.target.value })}
              className={`campo-input ${errores.pedido_id ? 'border-red-400' : ''}`}>
              <option value="">seleccionar pedido...</option>
              {pedidos.map(p => (
                <option key={p.id} value={p.id}>
                  #{p.id} — {p.cliente} — {formatPrecio(p.total)}
                </option>
              ))}
            </select>
            {errores.pedido_id && <p className="campo-error">{errores.pedido_id}</p>}
          </div>
 
          {form.pedido_id && (
            <div className="p-3 rounded-lg bg-light-bg dark:bg-dark-bg text-xs space-y-1">
              <div className="flex justify-between"><span className="text-gray-400">total pedido</span><span>{formatPrecio(totalPedido)}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">ya pagado</span><span className="text-green-400">{formatPrecio(totalPagado)}</span></div>
              <div className="flex justify-between font-semibold border-t border-gray-200 dark:border-dark-border pt-1">
                <span>pendiente</span>
                <span className={pagoCompleto ? 'text-green-400' : 'text-primary'}>
                  {pagoCompleto ? '✓ completamente pagado' : formatPrecio(montoPendiente)}
                </span>
              </div>
            </div>
          )}
 
          <div>
            <label className="campo-label">monto *</label>
            <input type="number" step="0.01" value={form.monto}
              onChange={e => setForm({ ...form, monto: e.target.value })}
              className={`campo-input ${errores.monto ? 'border-red-400' : ''}`}
              placeholder="0.00" disabled={pagoCompleto} />
            {errores.monto && <p className="campo-error">{errores.monto}</p>}
            {!pagoCompleto && montoPendiente > 0 && (
              <button type="button" onClick={() => setForm({ ...form, monto: montoPendiente })}
                className="text-xs text-primary mt-1 hover:underline">
                usar monto pendiente ({formatPrecio(montoPendiente)})
              </button>
            )}
          </div>
 
          <div>
            <label className="campo-label">método de pago</label>
            <select value={form.metodo} onChange={e => setForm({ ...form, metodo: e.target.value })} className="campo-input">
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="nequi">Nequi</option>
              <option value="daviplata">Daviplata</option>
              <option value="tarjeta">Tarjeta</option>
            </select>
          </div>
 
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button type="button" onClick={() => { setModalNuevo(false); setForm(formVacio); setErrores({}) }}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">cancelar</button>
            <button type="submit" disabled={crear.isPending || pagoCompleto} className="btn-primary">
              {crear.isPending ? 'registrando...' : 'registrar pago'}
            </button>
          </div>
        </form>
      </Modal>
 
      {/* ───── MODAL DETALLE ───── */}
      <Modal abierto={modalDetalle.abierto} onCerrar={() => setModalDetalle({ abierto: false, pago: null })}
        titulo={`pago #${modalDetalle.pago?.id}`}>
        {modalDetalle.pago && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="campo-label">pedido</p><p className="font-medium">#{modalDetalle.pago.pedido_id}</p></div>
              <div><p className="campo-label">cliente</p><p>{modalDetalle.pago.cliente || '-'}</p></div>
              <div><p className="campo-label">monto</p><p className="text-primary font-bold text-base">{formatPrecio(modalDetalle.pago.monto)}</p></div>
              <div><p className="campo-label">método</p><p>{modalDetalle.pago.metodo}</p></div>
              <div><p className="campo-label">estado</p>
                <div className="flex items-center gap-1">
                  {esAnulado(modalDetalle.pago.estado)
                    ? <XCircle size={13} className="text-red-400" />
                    : <CheckCircle size={13} className="text-green-400" />}
                  <span className={esAnulado(modalDetalle.pago.estado) ? 'badge-anulado' : 'badge-activo'}>
                    {esAnulado(modalDetalle.pago.estado) ? 'anulado' : 'pagado'}
                  </span>
                </div>
              </div>
              <div><p className="campo-label">fecha</p><p>{formatFecha(modalDetalle.pago.created_at)}</p></div>
            </div>
            {!esAnulado(modalDetalle.pago.estado) && (
              <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-dark-border">
                <button onClick={() => { setModalDetalle({ abierto: false, pago: null }); setModalAnular({ abierto: true, pago: modalDetalle.pago }) }}
                  className="px-3 py-1.5 text-xs border border-red-400/40 text-red-400 rounded-lg hover:bg-red-400/10">
                  anular pago
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
 
      {/* ───── MODAL ANULAR ───── */}
      <Modal abierto={modalAnular.abierto} onCerrar={() => setModalAnular({ abierto: false, pago: null })}
        titulo="confirmar anulación" ancho="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm">¿anular pago
            <span className="font-medium text-primary"> #{modalAnular.pago?.id}</span> de
            <span className="text-primary"> {formatPrecio(modalAnular.pago?.monto)}</span>?
            Esta acción no se puede deshacer.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => setModalAnular({ abierto: false, pago: null })}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">cancelar</button>
            <button onClick={() => anular.mutate(modalAnular.pago.id)} disabled={anular.isPending}
              className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50">
              {anular.isPending ? 'anulando...' : 'anular pago'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
