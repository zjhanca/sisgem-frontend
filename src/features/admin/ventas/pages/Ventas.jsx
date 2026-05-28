import { Plus, Eye, Download, Ban } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
import { useVentas } from '../hooks/useVentas'
import VentaForm    from '../components/VentaForm'
import VentaDetalle from '../components/VentaDetalle'
import VentaAnular  from '../components/VentaAnular'

// capitalizar primera letra
const capitalizar = str => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''

// badge según estado
const getBadgeEstado = nombre => {
  if (!nombre) return 'badge-pendiente'
  const l = nombre.toLowerCase()
  if (l.includes('anula'))   return 'badge-anulado'
  if (l.includes('complet') || l.includes('paga')) return 'badge-activo'
  return 'badge-pendiente'
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
    totalVenta, handleCrear, anular, cambiarEstado, getBadge, estados,
    creando, anulando,
  } = useVentas()

  // solo mostrar Pendiente, Completado y Anulado (sin otros)
  const estadosVenta = estados.filter(e => {
    const n = e.nombre?.toLowerCase()
    return n?.includes('pendiente') || n?.includes('complet') || n?.includes('anula')
  })

  const columnas = [
    { key: 'id',       label: '#' },
    { key: 'cliente',  label: 'Cliente' },
    { key: 'tipo_venta', label: 'Tipo',
      render: r => <span className="badge-activo">{r.tipo_venta === 'domicilio' ? 'Domicilio' : 'Mostrador'}</span>
    },
    { key: 'total', label: 'Total', render: r => formatPrecio(r.total) },
    { key: 'estado_id', label: 'Estado',
      render: r => {
        const esAnulado = r.estado?.toLowerCase().includes('anula')
        return (
          <div className="flex gap-1 flex-wrap" onClick={e => e.stopPropagation()}>
            {estadosVenta
              .filter(e => !e.nombre?.toLowerCase().includes('anula')) // pendiente y completado como botones
              .map(e => {
                const activo = r.estado_id === e.id
                const isPendiente = e.nombre?.toLowerCase().includes('pendiente')
                return (
                  <button key={e.id} type="button"
                    disabled={esAnulado || activo}
                    onClick={() => !activo && cambiarEstado.mutate({ id: r.id, estado_id: e.id })}
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-all disabled:cursor-default ${
                      activo
                        ? isPendiente
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-500'
                          : 'bg-primary/20 border-primary/40 text-primary'
                        : esAnulado
                          ? 'opacity-30 border-gray-200 dark:border-dark-border text-gray-400'
                          : 'border-gray-200 dark:border-dark-border text-gray-400 hover:border-primary/40 hover:text-primary'
                    }`}>
                    {capitalizar(e.nombre)}
                  </button>
                )
              })
            }
            {/* badge anulado si está anulado */}
            {esAnulado && <span className="badge-anulado">Anulado</span>}
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

      <div className="flex gap-2 mb-4 flex-wrap items-end">
        <div>
          <p className="campo-label mb-0.5">Buscar</p>
          <input value={filtroBusqueda} onChange={e => setFiltroBusqueda(e.target.value)}
            placeholder="# o cliente..." className="campo-input w-36 text-xs" />
        </div>
        <div>
          <p className="campo-label mb-0.5">Estado</p>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="campo-input w-40 text-xs">
            <option value="">Todos los estados</option>
            {estadosVenta.map(e => (
              <option key={e.id} value={e.id}>{capitalizar(e.nombre)}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="campo-label mb-0.5">Desde</p>
          <input type="datetime-local" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)}
            className="campo-input text-xs" />
        </div>
        <div>
          <p className="campo-label mb-0.5">Hasta</p>
          <input type="datetime-local" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)}
            className="campo-input text-xs" />
        </div>
        {(filtroEstado || filtroBusqueda || filtroDesde || filtroHasta) && (
          <button onClick={() => { setFiltroEstado(''); setFiltroBusqueda(''); setFiltroDesde(''); setFiltroHasta('') }}
            className="btn-ghost text-xs text-red-400 self-end">Limpiar</button>
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

      <VentaForm modalNuevo={modalNuevo} setModalNuevo={setModalNuevo}
        form={form} setForm={setForm} clientes={clientes}
        clientesFiltrados={clientesFiltrados} clienteBusqueda={clienteBusqueda} setClienteBusqueda={setClienteBusqueda}
        prodBusqueda={prodBusqueda} prodsFiltrados={prodsFiltrados}
        buscarProducto={buscarProducto} buscarPorCodigo={buscarPorCodigo}
        agregarProducto={agregarProducto} quitarProducto={quitarProducto} cambiarCantidad={cambiarCantidad}
        totalVenta={totalVenta} handleCrear={handleCrear} creando={creando} />
      <VentaDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle} setModalAnular={setModalAnular} getBadge={getBadge} />
      <VentaAnular modalAnular={modalAnular} setModalAnular={setModalAnular} anular={anular} anulando={anulando} />
    </div>
  )
}