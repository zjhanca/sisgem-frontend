import { Plus, Eye, Download, Ban } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
import { useVentas } from '../hooks/useVentas'
import VentaForm   from '../components/VentaForm'
import VentaDetalle from '../components/VentaDetalle'
import VentaAnular  from '../components/VentaAnular'
 
export default function Ventas() {
  const {
    ventasFiltradas, clientes, form, setForm,
    clientesFiltrados, prodBusqueda, prodsFiltrados, clienteBusqueda,
    setProdBusqueda, setClienteBusqueda,
    modalNuevo, modalDetalle, modalAnular, filtroEstado, filtroBusqueda,
    setModalNuevo, setModalDetalle, setModalAnular, setFiltroEstado, setFiltroBusqueda,
    buscarProducto, buscarPorCodigo, agregarProducto, quitarProducto,
    totalVenta, handleCrear, anular, getBadge, estados,
    creando, anulando,
  } = useVentas()
 
  const columnas = [
    { key: 'id',       label: '#' },
    { key: 'cliente',  label: 'Cliente' },
    { key: 'tipo_venta', label: 'Tipo', render: r => <span className={r.tipo_venta === 'domicilio' ? 'badge-proceso' : 'badge-activo'}>{r.tipo_venta === 'domicilio' ? 'Domicilio' : 'Mostrador'}</span> },
    { key: 'total',    label: 'Total', render: r => formatPrecio(r.total) },
    { key: 'estado',   label: 'Estado', render: r => <span className={getBadge(r.estado)}>{r.estado || '—'}</span> },
    { key: 'fecha_pedido', label: 'Fecha', render: r => formatFechaHora(r.fecha_pedido) },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Ventas</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarPDF('/reportes/ventas', 'reporte-ventas.pdf')} className="btn-outline"><Download size={14} /> Reporte</button>
          <button onClick={() => setModalNuevo(true)} className="btn-primary"><Plus size={14} /> Nueva Venta</button>
        </div>
      </div>
 
      <div className="flex gap-2 mb-4 flex-wrap">
        <input value={filtroBusqueda} onChange={e => setFiltroBusqueda(e.target.value)}
          placeholder="Buscar cliente o #..." className="campo-input w-48 text-xs" />
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="campo-input w-36 text-xs">
          <option value="">Todos los estados</option>
          {estados.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
        {(filtroEstado || filtroBusqueda) && <button onClick={() => { setFiltroEstado(''); setFiltroBusqueda('') }} className="btn-ghost text-xs text-red-400">Limpiar</button>}
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
 
      <VentaForm modalNuevo={modalNuevo} setModalNuevo={setModalNuevo}
        form={form} setForm={setForm} clientes={clientes}
        clientesFiltrados={clientesFiltrados} clienteBusqueda={clienteBusqueda} setClienteBusqueda={setClienteBusqueda}
        prodBusqueda={prodBusqueda} prodsFiltrados={prodsFiltrados}
        buscarProducto={buscarProducto} buscarPorCodigo={buscarPorCodigo}
        agregarProducto={agregarProducto} quitarProducto={quitarProducto}
        totalVenta={totalVenta} handleCrear={handleCrear} creando={creando} />
      <VentaDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle} setModalAnular={setModalAnular} getBadge={getBadge} />
      <VentaAnular modalAnular={modalAnular} setModalAnular={setModalAnular} anular={anular} anulando={anulando} />
    </div>
  )
}
