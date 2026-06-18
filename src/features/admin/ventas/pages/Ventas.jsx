import { Plus, Eye, Download, Ban, Search, CreditCard } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
import { useVentas } from '../hooks/useVentas'
import { usePagos } from '@features/admin/pagos/hooks/usePagos'
import VentaForm    from '../components/VentaForm'
import VentaDetalle from '../components/VentaDetalle'
import VentaAnular  from '../components/VentaAnular'
import PagoForm     from '@features/admin/pagos/components/PagoForm'

const capitalizar = str => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''

const getBadgeEstado = nombre => {
  if (!nombre) return { clase: 'badge-pendiente', label: 'Pendiente' }
  const l = nombre.toLowerCase()
  if (l.includes('anula'))                          return { clase: 'badge-anulado',  label: 'Anulado' }
  if (l.includes('complet') || l.includes('paga'))  return { clase: 'badge-activo',   label: 'Completado' }
  return { clase: 'badge-pendiente', label: 'Pendiente' }
}

export default function Ventas() {
  const {
    ventasFiltradas, clientes, form, setForm,
    clientesFiltrados, prodBusqueda, prodsFiltrados, clienteBusqueda,
    setProdBusqueda, setClienteBusqueda,
    modalNuevo, modalDetalle, modalAnular, filtroEstado, filtroBusqueda,
    filtroDesde, setFiltroDesde, filtroHasta, setFiltroHasta,
    setModalNuevo, setModalDetalle, setModalAnular, setFiltroEstado, setFiltroBusqueda,
    buscarProducto, buscarPorCodigo, agregarProducto, quitarProducto, cambiarCantidad,
    totalVenta, handleCrear, anular, getBadge, estados,
    creando, anulando,
  } = useVentas()

  const {
    abrirConPedido,
    pedidos, form: formPago, setForm: setFormPago, errores: erroresPago,
    totalPedido, totalPagado, montoPendiente, pagoCompleto, esFiado,
    handleSubmit: handleSubmitPago, tipoPagoActual,
    pedidoBusqueda, setPedidoBusqueda, pedidoDropdown, setPedidoDropdown,
    modalNuevo: modalPago, setModalNuevo: setModalPago,
    creando: creandoPago,
  } = usePagos()

  const estadosVenta = estados.filter(e => {
    const n = e.nombre?.toLowerCase()
    return n?.includes('pendiente') || n?.includes('complet') || n?.includes('anula')
  })

  const columnas = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'total', label: 'Total', render: r => formatPrecio(r.total) },
    { key: 'estado_id', label: 'Estado',
      render: r => {
        const { clase, label } = getBadgeEstado(r.estado)
        const esFiadoPendiente = r.permite_fiado && r.estado?.toLowerCase().includes('pendiente')
        return (
          <div className="flex items-center gap-1.5">
            <span className={clase}>{label}</span>
            {esFiadoPendiente && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-500 font-medium">
                Fiado
              </span>
            )}
          </div>
        )
      }
    },
    { key: 'fecha_pedido', label: 'Fecha', render: r => formatFechaHora(r.fecha_pedido) },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Ventas</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarPDF('/reportes/ventas', 'reporte-ventas.pdf')} className="btn-outline">
            <Download size={14} /> Reporte
          </button>
          <button onClick={() => setModalNuevo(true)} className="btn-primary">
            <Plus size={14} /> Nueva Venta
          </button>
        </div>
      </div>

      <Tabla columnas={columnas} datos={ventasFiltradas} sinBusqueda
        filtros={<>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={filtroBusqueda} onChange={e => setFiltroBusqueda(e.target.value)}
              placeholder="Buscar..."
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg border
                bg-light-bg dark:bg-dark-bg/60
                border-gray-200 dark:border-dark-border
                text-light-text dark:text-dark-text
                placeholder:text-gray-400/60
                focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10
                transition-all duration-150 w-52" />
          </div>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="campo-input w-40 text-xs">
            <option value="">Todos los estados</option>
            {estadosVenta.map(e => (
              <option key={e.id} value={e.id}>{capitalizar(e.nombre)}</option>
            ))}
          </select>
          <input type="datetime-local" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)}
            className="campo-input w-44 text-xs" title="Desde" />
          <input type="datetime-local" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)}
            className="campo-input w-44 text-xs" title="Hasta" />
          {(filtroEstado || filtroBusqueda || filtroDesde || filtroHasta) && (
            <button onClick={() => { setFiltroEstado(''); setFiltroBusqueda(''); setFiltroDesde(''); setFiltroHasta('') }}
              className="btn-ghost text-xs text-red-400">Limpiar</button>
          )}
        </>}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, venta: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => descargarPDF(`/reportes/pedido/${fila.id}`, `comprobante-${fila.id}.pdf`)} className="btn-ghost"><Download size={14} /></button>
          {fila.permite_fiado && fila.estado?.toLowerCase().includes('pendiente') && (
            <button onClick={() => abrirConPedido(fila.id)}
              className="btn-ghost hover:text-primary" title="Registrar abono">
              <CreditCard size={14} />
            </button>
          )}
          {(() => {
            const esAnulada = fila.estado?.toLowerCase().includes('anula')
            if (esAnulada) return null
            const esFiado = fila.permite_fiado && fila.estado?.toLowerCase().includes('pendiente')
            if (esFiado) {
              const horas = (new Date() - new Date(fila.fecha_pedido)) / (1000 * 60 * 60)
              if (horas > 48) return (
                <button disabled title="Solo se puede anular dentro de las primeras 48 horas"
                  className="btn-ghost opacity-30 cursor-not-allowed"><Ban size={14} /></button>
              )
            }
            return (
              <button onClick={() => setModalAnular({ abierto: true, venta: fila })}
                className="btn-ghost hover:text-red-400"
                title={esFiado ? `Anular fiado (quedan ${Math.max(0, Math.ceil(48 - (new Date() - new Date(fila.fecha_pedido)) / (1000 * 60 * 60)))}h)` : 'Anular'}>
                <Ban size={14} />
              </button>
            )
          })()}
        </>)}
      />

      <VentaForm modalNuevo={modalNuevo} setModalNuevo={setModalNuevo}
        form={form} setForm={setForm} clientes={clientes}
        clientesFiltrados={clientesFiltrados} clienteBusqueda={clienteBusqueda} setClienteBusqueda={setClienteBusqueda}
        prodBusqueda={prodBusqueda} prodsFiltrados={prodsFiltrados}
        buscarProducto={buscarProducto} buscarPorCodigo={buscarPorCodigo}
        agregarProducto={agregarProducto} quitarProducto={quitarProducto} cambiarCantidad={cambiarCantidad}
        totalVenta={totalVenta} handleCrear={handleCrear} creando={creando} />
      <VentaDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle} setModalAnular={setModalAnular} getBadge={getBadge} />
      <VentaAnular modalAnular={modalAnular} setModalAnular={setModalAnular} anular={anular} anulando={anulando} />
      <PagoForm modalNuevo={modalPago} setModalNuevo={setModalPago}
        form={formPago} setForm={setFormPago} errores={erroresPago} pedidos={pedidos}
        totalPedido={totalPedido} totalPagado={totalPagado} montoPendiente={montoPendiente}
        pagoCompleto={pagoCompleto} handleSubmit={handleSubmitPago} creando={creandoPago}
        tipoPagoActual={tipoPagoActual} esFiado={esFiado}
        pedidoBusqueda={pedidoBusqueda} setPedidoBusqueda={setPedidoBusqueda}
        pedidoDropdown={pedidoDropdown} setPedidoDropdown={setPedidoDropdown} />
    </div>
  )
}