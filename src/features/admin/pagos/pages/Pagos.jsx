import { Plus, Eye, Download, Ban } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
import { usePagos } from '../hooks/usePagos'
import PagoForm    from '../components/PagoForm'
import PagoDetalle from '../components/PagoDetalle'
import PagoAnular  from '../components/PagoAnular'

export default function Pagos() {
  const {
    pagosFiltrados, pedidos, form, errores,
    modalNuevo, modalDetalle, modalAnular,
    setModalNuevo, setModalDetalle, setModalAnular,
    setForm, filtroEstado, setFiltroEstado,
    filtroDesde, setFiltroDesde,
    filtroHasta, setFiltroHasta,
    filtroBusqueda, setFiltroBusqueda,
    totalPedido, totalPagado, montoPendiente, pagoCompleto, esFiado,
    handleSubmit, anular, esAnulado, getFechaPago,
    getEstadoPago, tipoPagoActual,
    pedidoBusqueda, setPedidoBusqueda, pedidoDropdown, setPedidoDropdown,
    creando, anulando,
  } = usePagos()

  const hayFiltros = filtroEstado || filtroDesde || filtroHasta || filtroBusqueda

  const columnas = [
    { key: 'id',        label: '#' },
    { key: 'pedido_id', label: 'Pedido',  render: r => `#${r.pedido_id}` },
    { key: 'cliente',   label: 'Cliente', render: r => r.cliente || '—' },
    { key: 'monto',     label: 'Monto',   render: r => formatPrecio(r.monto) },
    { key: 'metodo',    label: 'Método',  render: r => r.metodo || '—' },
    { key: 'estado', label: 'Estado',
      render: r => {
        const { label, clase } = getEstadoPago(r.estado)
        return <span className={clase}>{label}</span>
      }
    },
    { key: 'fecha', label: 'Fecha', render: r => formatFechaHora(getFechaPago(r)) || '—' },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pagos</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarPDF('/reportes/pagos', 'reporte-pagos.pdf')} className="btn-outline">
            <Download size={14} /> Reporte
          </button>
          <button onClick={() => setModalNuevo(true)} className="btn-primary">
            <Plus size={14} /> Nuevo Pago
          </button>
        </div>
      </div>

      <Tabla columnas={columnas} datos={pagosFiltrados} sinBusqueda
        filtros={<>
          <input value={filtroBusqueda} onChange={e => setFiltroBusqueda(e.target.value)}
            placeholder="# o cliente..." className="campo-input w-36 text-xs" />
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="campo-input w-36 text-xs">
            <option value="">Todos</option>
            <option value="pagado">Pagados</option>
            <option value="abono">Abonos</option>
            <option value="anulado">Anulados</option>
          </select>
          <input type="datetime-local" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)}
            className="campo-input w-44 text-xs" title="Desde" />
          <input type="datetime-local" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)}
            className="campo-input w-44 text-xs" title="Hasta" />
          {hayFiltros && (
            <button onClick={() => { setFiltroEstado(''); setFiltroDesde(''); setFiltroHasta(''); setFiltroBusqueda('') }}
              className="btn-ghost text-xs text-red-400">Limpiar</button>
          )}
        </>}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, pago: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => descargarPDF(`/reportes/pagos/${fila.id}`, `pago-${fila.id}.pdf`)} className="btn-ghost"><Download size={14} /></button>
          {!esAnulado(fila.estado) && (
            <button onClick={() => setModalAnular({ abierto: true, pago: fila })} className="btn-ghost hover:text-red-400"><Ban size={14} /></button>
          )}
        </>)}
      />

      <PagoForm modalNuevo={modalNuevo} setModalNuevo={setModalNuevo}
        form={form} setForm={setForm} errores={errores} pedidos={pedidos}
        totalPedido={totalPedido} totalPagado={totalPagado} montoPendiente={montoPendiente}
        pagoCompleto={pagoCompleto} handleSubmit={handleSubmit} creando={creando}
        tipoPagoActual={tipoPagoActual} esFiado={esFiado}
        pedidoBusqueda={pedidoBusqueda} setPedidoBusqueda={setPedidoBusqueda}
        pedidoDropdown={pedidoDropdown} setPedidoDropdown={setPedidoDropdown} />
      <PagoDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle}
        setModalAnular={setModalAnular} esAnulado={esAnulado} />
      <PagoAnular modalAnular={modalAnular} setModalAnular={setModalAnular}
        anular={anular} anulando={anulando} />
    </div>
  )
}