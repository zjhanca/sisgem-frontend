import { useState } from 'react'
import { Download, Settings, ShoppingCart, Bike, Tag, CheckCircle, Clock, XCircle, Eye, History, Plus } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
import { usePedidos }        from '../hooks/usePedidos'
import NuevoPedidoForm       from '../components/NuevoPedidoForm'
import PedidoDetalle         from '../components/PedidoDetalle'
import PedidoHistorial       from '../components/PedidoHistorial'
import TarifaForm            from '../components/TarifaForm'
 
const TABS = [
  { id: 'pedidos',    label: 'Pedidos',    icon: ShoppingCart },
  { id: 'domicilios', label: 'Domicilios', icon: Bike         },
  { id: 'tarifas',    label: 'Tarifas',    icon: Tag          },
]
const ICONOS_DOM  = { pendiente: Clock, entregado: CheckCircle, anulado: XCircle }
const COLORES_DOM = { pendiente: 'text-yellow-500', entregado: 'text-green-500', anulado: 'text-red-400' }
 
export default function Pedidos() {
  const p = usePedidos()
  const [modalNuevaTarifa, setModalNuevaTarifa] = useState(false)
 
  const getBadge = nombre => {
    if (!nombre) return 'badge-pendiente'
    const n = nombre.toLowerCase()
    if (n.includes('anula')) return 'badge-anulado'
    if (n.includes('entrega') || n.includes('paga')) return 'badge-activo'
    return 'badge-pendiente'
  }
 
  const columnasPedidos = [
    { key: 'id',         label: '#' },
    { key: 'cliente',    label: 'Cliente' },
    { key: 'tipo_venta', label: 'Tipo',
      render: r => <span className={`badge ${r.tipo_venta==='domicilio' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' : 'bg-primary/20 text-green-700 dark:text-primary'}`}>
        {r.tipo_venta==='domicilio' ? '🛵 Domicilio' : '🏪 Mostrador'}
      </span>
    },
    { key: 'total',  label: 'Total', render: r => formatPrecio(r.total) },
    { key: 'estado_id', label: 'Estado',
      render: r => (
        <select value={r.estado_id || ''} onChange={e => p.cambiarEstado.mutate({ id: r.id, estado_id: +e.target.value })}
          onClick={e => e.stopPropagation()}
          className="text-xs bg-transparent border border-gray-200 dark:border-dark-border rounded px-1 py-0.5 cursor-pointer">
          {p.estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
      )
    },
    { key: 'fecha_pedido', label: 'Fecha', render: r => formatFechaHora(r.fecha_pedido) },
  ]
 
  const columnasDom = [
    { key: 'id',        label: '#' },
    { key: 'pedido_id', label: 'Pedido #' },
    { key: 'cliente',   label: 'Cliente',   render: r => r.cliente || 'Ocasional' },
    { key: 'barrio',    label: 'Barrio',    render: r => r.barrio || '—' },
    { key: 'direccion', label: 'Dirección', render: r => (r.direccion || r.direccion_manual || '—').substring(0, 30) },
    { key: 'tarifa_aplicada', label: 'Tarifa', render: r => formatPrecio(r.tarifa_aplicada || 0) },
    { key: 'estado', label: 'Estado',
      render: r => {
        const key = p.getKeyEstadoDom(r.estado)
        const Ico = ICONOS_DOM[key] || Clock
        return <div className={`flex items-center gap-1.5 ${COLORES_DOM[key]}`}><Ico size={13} /><span className="text-xs capitalize">{p.ESTADOS_DOM.find(e => e.key===key)?.label || 'Pendiente'}</span></div>
      }
    },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pedidos</h1>
        <div className="flex gap-2">
          <button onClick={() => p.setModalConfig(true)} className="btn-ghost"><Settings size={14} /></button>
          <button onClick={() => descargarPDF('/reportes/pedidos', 'reporte-pedidos.pdf')} className="btn-outline">
            <Download size={14} /> Reporte
          </button>
          {/* botón Nueva Tarifa visible siempre en el header */}
          {p.tabActivo === 'tarifas' && (
            <button onClick={() => setModalNuevaTarifa(true)} className="btn-outline">
              <Tag size={14} /> Nueva Tarifa
            </button>
          )}
          {p.tabActivo === 'pedidos' && (
            <button onClick={() => p.setModalNuevo(true)} className="btn-primary">
              <Plus size={14} /> Nuevo Pedido
            </button>
          )}
        </div>
      </div>
 
      {/* tabs */}
      <div className="flex gap-1 p-1 bg-light-bg dark:bg-dark-bg rounded-xl mb-4 w-fit">
        {TABS.map(t => (
          <button key={t.id} onClick={() => p.setTabActivo(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              p.tabActivo===t.id ? 'bg-primary text-dark-bg shadow-sm' : 'text-gray-500 dark:text-dark-text/60 hover:text-primary'
            }`}>
            <t.icon size={13} /> {t.label}
            {t.id==='domicilios' && p.domFiltrados.filter(d => p.getKeyEstadoDom(d.estado)==='pendiente').length > 0 && (
              <span className={`ml-0.5 text-xs px-1.5 py-0.5 rounded-full ${p.tabActivo==='domicilios' ? 'bg-dark-bg/20' : 'bg-yellow-500/20 text-yellow-600'}`}>
                {p.domFiltrados.filter(d => p.getKeyEstadoDom(d.estado)==='pendiente').length}
              </span>
            )}
          </button>
        ))}
      </div>
 
      {/* TAB PEDIDOS */}
      {p.tabActivo === 'pedidos' && (<>
        <div className="flex gap-2 mb-4 flex-wrap items-end">
          <div><p className="campo-label mb-0.5">Buscar</p><input value={p.filtroBusqueda} onChange={e => p.setFiltroBusqueda(e.target.value)} placeholder="# o cliente..." className="campo-input w-36 text-xs" /></div>
          <div><p className="campo-label mb-0.5">Estado</p>
            <select value={p.filtroEstado} onChange={e => p.setFiltroEstado(e.target.value)} className="campo-input w-36 text-xs">
              <option value="">Todos</option>
              {p.estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div><p className="campo-label mb-0.5">Desde</p><input type="datetime-local" value={p.filtroDesde} onChange={e => p.setFiltroDesde(e.target.value)} className="campo-input text-xs" /></div>
          <div><p className="campo-label mb-0.5">Hasta</p><input type="datetime-local" value={p.filtroHasta} onChange={e => p.setFiltroHasta(e.target.value)} className="campo-input text-xs" /></div>
          {(p.filtroEstado||p.filtroDesde||p.filtroHasta||p.filtroBusqueda) && (
            <button onClick={() => { p.setFiltroEstado(''); p.setFiltroDesde(''); p.setFiltroHasta(''); p.setFiltroBusqueda('') }} className="btn-ghost text-xs text-red-400 self-end">Limpiar</button>
          )}
        </div>
        <Tabla columnas={columnasPedidos} datos={p.pedidosFiltrados} sinBusqueda
          acciones={fila => (<>
            <button onClick={() => p.setModalDetalle({ abierto: true, pedido: fila })} className="btn-ghost"><Eye size={14} /></button>
            <button onClick={() => descargarPDF(`/reportes/pedido/${fila.id}`, `comprobante-${fila.id}.pdf`)} className="btn-ghost"><Download size={14} /></button>
            <button onClick={() => p.setModalHistorial({ abierto: true, cliente: { id: fila.cliente_id_ref, nombre: fila.cliente } })} className="btn-ghost"><History size={14} /></button>
          </>)}
        />
      </>)}
 
      {/* TAB DOMICILIOS */}
      {p.tabActivo === 'domicilios' && (<>
        <div className="flex gap-2 mb-4">
          <select value={p.filtroDom} onChange={e => p.setFiltroDom(e.target.value)} className="campo-input w-44 text-xs">
            <option value="">Todos los estados</option>
            {p.ESTADOS_DOM.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
          </select>
          {p.filtroDom && <button onClick={() => p.setFiltroDom('')} className="btn-ghost text-xs text-red-400">Limpiar</button>}
        </div>
        <Tabla columnas={columnasDom} datos={p.domFiltrados} sinBusqueda
          acciones={fila => (
            <div className="flex gap-1">
              {p.ESTADOS_DOM.map(({ key, label }) => {
                const estado_id = p.getEstadoDomId(key)
                if (!estado_id) return null
                const esActual = p.getKeyEstadoDom(fila.estado) === key
                const Ico = ICONOS_DOM[key] || Clock
                return (
                  <button key={key} type="button"
                    onClick={() => p.cambiarEstadoDom.mutate({ id: fila.id, estado_id })} title={label}
                    className={`p-1.5 rounded-lg border transition-colors ${esActual ? ({ pendiente:'bg-yellow-500/20 border-yellow-500 text-yellow-500', entregado:'bg-green-500/20 border-green-500 text-green-500', anulado:'bg-red-500/20 border-red-400 text-red-400' }[key] || '') : 'border-gray-200 dark:border-dark-border text-gray-400 hover:border-primary/40'}`}>
                    <Ico size={12} />
                  </button>
                )
              })}
            </div>
          )}
        />
      </>)}
 
      {/* TAB TARIFAS */}
      {p.tabActivo === 'tarifas' && (
        <TarifaForm
          tarifas={p.tarifas} formTarifa={p.formTarifa} setFormTarifa={p.setFormTarifa}
          handleGuardarTarifa={p.handleGuardarTarifa} guardandoTarifa={p.guardandoTarifa}
          modalElimTarifa={p.modalElimTarifa} setModalElimTarifa={p.setModalElimTarifa}
          eliminarTarifa={p.eliminarTarifa} eliminandoTarifa={p.eliminandoTarifa}
          modalNuevaTarifa={modalNuevaTarifa} setModalNuevaTarifa={setModalNuevaTarifa}
        />
      )}
 
      {/* modales pedidos */}
      <NuevoPedidoForm
        modalNuevo={p.modalNuevo} setModalNuevo={p.setModalNuevo}
        form={p.form} setF={p.setF} setForm={p.setForm}
        clientes={p.clientes} clientesFiltrados={p.clientesFiltrados}
        clienteBusqueda={p.clienteBusqueda} setClienteBusqueda={p.setClienteBusqueda}
        prodBusqueda={p.prodBusqueda} prodsFiltrados={p.prodsFiltrados}
        buscarProducto={p.buscarProducto} buscarPorCodigo={p.buscarPorCodigo}
        agregarProducto={p.agregarProducto} quitarProducto={p.quitarProducto}
        totalPedido={p.totalPedido} handleCrear={p.handleCrear} creando={p.creando}
        barcodeRef={p.barcodeRef} tarifas={p.tarifas} direcciones={p.direcciones}
      />
      <PedidoDetalle
        modalDetalle={p.modalDetalle} setModalDetalle={p.setModalDetalle}
        estados={p.estados} domDetalle={p.domDetalle}
        cambiarEstado={p.cambiarEstado} cambiarEstadoDom={p.cambiarEstadoDom}
        asignarDomicilio={p.asignarDomicilio} anular={p.anular}
        ESTADOS_DOM={p.ESTADOS_DOM} getKeyEstadoDom={p.getKeyEstadoDom} getEstadoDomId={p.getEstadoDomId}
        formDomDetalle={p.formDomDetalle} setFormDomDetalle={p.setFormDomDetalle}
        handleAsignarDomDetalle={p.handleAsignarDomDetalle}
        tarifas={p.tarifas} dirsDetalle={p.dirsDetalle}
        puedeAnular={p.puedeAnular} anulando={p.anulando} asignando={p.asignando}
      />
      <PedidoHistorial
        modalHistorial={p.modalHistorial} setModalHistorial={p.setModalHistorial}
        historial={p.historial} getBadge={getBadge}
      />
 
      {/* modal config */}
      <Modal abierto={p.modalConfig} onCerrar={() => p.setModalConfig(false)} titulo="Configurar Cancelación" ancho="max-w-sm">
        <div className="space-y-4">
          <div>
            <label className="campo-label">Horas Máximas para Cancelar</label>
            <input type="number" min="1" max="72" value={p.configCancelacion.horas}
              onChange={e => p.setConfigCancelacion({ horas: +e.target.value })} className="campo-input" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => p.setModalConfig(false)} className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
            <button onClick={() => p.setModalConfig(false)} className="btn-primary">Aceptar</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
 
