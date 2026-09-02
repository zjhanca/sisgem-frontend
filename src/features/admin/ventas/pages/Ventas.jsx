import { useState } from 'react'
import { Plus, Eye, Download, Ban, Search, CreditCard, CheckCircle } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import ReporteDescargaModal from '../components/ReporteDescargaModal'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'
import { useVentas } from '../hooks/useVentas'
import { usePagos } from '@features/admin/pagos/hooks/usePagos'
import VentaForm            from '../components/VentaForm'
import VentaDetalle         from '../components/VentaDetalle'
import VentaAnular          from '../components/VentaAnular'
import VentaConfirmDescarga from '../components/Ventaconfirmdescarga'
import PagoForm             from '@features/admin/pagos/components/PagoForm'

const capitalizar = str => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ''

const getBadgeEstado = nombre => {
  if (!nombre) return { color: 'bg-amber-500', label: 'Pendiente' }
  const l = nombre.toLowerCase()
  if (l.includes('anula'))                         return { color: 'bg-gray-300', label: 'Anulado'    }
  if (l.includes('complet') || l.includes('paga')) return { color: 'bg-primary',  label: 'Completado' }
  return { color: 'bg-amber-500', label: 'Pendiente' }
}

function BadgeEstado({ color, label }) {
  return (
    <span className={`inline-flex items-center justify-center h-6 w-24 rounded-full text-white text-xs font-semibold ${color}`}>
      {label}
    </span>
  )
}

const maxFechaHoy = () => new Date().toISOString().slice(0, 16)

export default function Ventas() {
  const {
    ventasFiltradas, clientes, form, setForm,
    clientesFiltrados, prodBusqueda, prodsFiltrados, clienteBusqueda,
    setProdBusqueda, setClienteBusqueda,
    modalNuevo, modalDetalle, modalAnular, filtroEstado, filtroBusqueda,
    filtroDesde, setFiltroDesde, filtroHasta, setFiltroHasta,
    setModalNuevo, setModalDetalle, setModalAnular, setFiltroEstado, setFiltroBusqueda,
    buscarProducto, buscarPorCodigo, agregarProducto, quitarProducto, cambiarCantidad,
    totalVenta, handleCrear, anular, getBadge, estados, cambiarEstado,
    completarPedidoMovil, marcarEntregado,
    getFechaLimiteAnulacion, puedeAnular, horasRestantesAnulacion,
    descargarReporte,
    clienteSeleccionado, cupoFiadoDisponible, excedeCupoFiado, montoFiado, montoInmediato,
    creando, anulando, MINIMO_FIADO,
  } = useVentas()

  const {
    abrirConPedido,
    form: formPago, setForm: setFormPago, errores: erroresPago,
    clienteSel, clientesFiltradosModal, deudaCliente, deudaPorCliente,
    totalDeuda, pedidosCliente, pagoCompleto, montoPendiente: montoPendientePago,
    clienteBusqueda: clienteBusquedaPago, setClienteBusqueda: setClienteBusquedaPago,
    clienteDropdown, setClienteDropdown,
    handleSubmit: handleSubmitPago, handleMontoChange, tipoPagoActual,
    modalNuevo: modalPago, setModalNuevo: setModalPago,
    creando: creandoPago,
  } = usePagos()

  const [confirmDescarga, setConfirmDescarga]           = useState(null)
  const [modalReporte, setModalReporte]                 = useState(false)
  const [modalCompletarMovil, setModalCompletarMovil]   = useState({ abierto: false, venta: null })
  const [metodoCompletarMovil, setMetodoCompletarMovil] = useState('efectivo')

  const estadosVenta = estados.filter(e => {
    const n = e.nombre?.toLowerCase()
    return n?.includes('pendiente') || n?.includes('complet') || n?.includes('anula')
  })

  const columnas = [
    { key: 'cliente', label: 'Cliente' },
    { key: 'total',   label: 'Total', render: r => formatPrecio(r.total) },
    { key: 'estado_id', label: 'Estado',
      render: r => {
        const { color, label } = getBadgeEstado(r.estado)
        return (
          <div className="flex items-center gap-1.5">
            <BadgeEstado color={color} label={label} />
            {r.origen === 'movil' && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-500 font-medium">
                App
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
          <button onClick={() => setModalReporte(true)} className="btn-outline">
            <Download size={14} /> Reporte
          </button>
          <button onClick={() => setModalNuevo(true)} className="btn-primary">
            <Plus size={14} /> Nueva
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
          <input type="datetime-local" value={filtroDesde} max={maxFechaHoy()}
            onChange={e => setFiltroDesde(e.target.value)} className="campo-input w-44 text-xs" title="Desde" />
          <input type="datetime-local" value={filtroHasta} max={maxFechaHoy()}
            onChange={e => setFiltroHasta(e.target.value)} className="campo-input w-44 text-xs" title="Hasta" />
          {(filtroEstado || filtroBusqueda || filtroDesde || filtroHasta) && (
            <button onClick={() => { setFiltroEstado(''); setFiltroBusqueda(''); setFiltroDesde(''); setFiltroHasta('') }}
              className="btn-ghost text-xs text-red-400">Limpiar</button>
          )}
        </>}
        acciones={fila => {
          const esPendiente = fila.estado?.toLowerCase().includes('pendiente')
          const esAnulada   = fila.estado?.toLowerCase().includes('anula')

          const esPedidoMovilPendiente  = esPendiente && fila.origen === 'movil' && !fila.es_fiado
          const esFiadoMovilNoEntregado = esPendiente && fila.origen === 'movil' && fila.es_fiado && !fila.entregado
          const esFiadoMovilEntregado   = esPendiente && fila.origen === 'movil' && fila.es_fiado && fila.entregado

          return (<>
            <button onClick={() => setModalDetalle({ abierto: true, venta: fila })} className="btn-ghost">
              <Eye size={14} />
            </button>
            <button onClick={() => setConfirmDescarga({ tipo: 'comprobante', id: fila.id })} className="btn-ghost">
              <Download size={14} />
            </button>

            {esPedidoMovilPendiente && (
              <button
                onClick={() => {
                  setModalCompletarMovil({ abierto: true, venta: fila })
                  setMetodoCompletarMovil('efectivo')
                }}
                className="btn-ghost hover:text-primary"
                title={fila.tipo_venta === 'domicilio' ? 'Confirmar entrega' : 'Confirmar recepción'}>
                <CheckCircle size={14} />
              </button>
            )}

            {esFiadoMovilNoEntregado && (
              <button
                onClick={() => marcarEntregado.mutate({ id: fila.id })}
                className="btn-ghost hover:text-green-500"
                title="Confirmar entrega">
                <CheckCircle size={14} />
              </button>
            )}

            {(esFiadoMovilEntregado || (fila.es_fiado && esPendiente && fila.origen !== 'movil')) && (
              <button onClick={() => abrirConPedido(fila.id)}
                className="btn-ghost hover:text-primary" title="Registrar abono">
                <CreditCard size={14} />
              </button>
            )}

            {(() => {
              if (esAnulada) return null
              if (!puedeAnular(fila)) return (
                <button disabled title="Solo se puede anular dentro de las primeras 72 horas"
                  className="btn-ghost opacity-30 cursor-not-allowed"><Ban size={14} /></button>
              )
              const horas = horasRestantesAnulacion(fila)
              return (
                <button onClick={() => setModalAnular({ abierto: true, venta: fila })}
                  className="btn-ghost hover:text-red-400"
                  title={horas !== null ? `Anular (quedan ${horas}h)` : 'Anular'}>
                  <Ban size={14} />
                </button>
              )
            })()}
          </>)
        }}
      />

      {/* Modal confirmar entrega pedido móvil sin fiado */}
      {modalCompletarMovil.abierto && modalCompletarMovil.venta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50"
            onClick={() => setModalCompletarMovil({ abierto: false, venta: null })} />
          <div className="relative z-10 w-full max-w-sm bg-white rounded-2xl border border-gray-200 shadow-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold">
              Confirmar {modalCompletarMovil.venta.tipo_venta === 'domicilio' ? 'entrega' : 'recepción'} — Pedido #{modalCompletarMovil.venta.id}
            </h3>
            <p className="text-xs text-gray-500">
              El cliente {modalCompletarMovil.venta.tipo_venta === 'domicilio'
                ? 'recibió el pedido a domicilio'
                : 'recogió el pedido en la tienda'}.
              Selecciona cómo pagó:
            </p>
            <p className="text-sm font-bold text-primary">
              Total: {formatPrecio(modalCompletarMovil.venta.total)}
            </p>
            <div>
              <label className="campo-label">Método de pago recibido</label>
              <div className="flex gap-2 mt-1">
                {['efectivo', 'transferencia'].map(m => (
                  <button key={m} type="button"
                    onClick={() => setMetodoCompletarMovil(m)}
                    className={`flex-1 py-2 text-xs rounded-lg border transition-all capitalize ${
                      metodoCompletarMovil === m
                        ? 'bg-primary text-white border-primary'
                        : 'border-gray-200 text-gray-500 hover:border-primary/40'
                    }`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button type="button"
                onClick={() => setModalCompletarMovil({ abierto: false, venta: null })}
                className="px-4 py-1.5 text-sm border border-gray-200 text-gray-500 rounded-lg">
                Cancelar
              </button>
              <button type="button"
                disabled={completarPedidoMovil.isPending}
                onClick={() => {
                  completarPedidoMovil.mutate({
                    id:          modalCompletarMovil.venta.id,
                    total:       modalCompletarMovil.venta.total,
                    metodo_pago: metodoCompletarMovil,
                  }, {
                    onSuccess: () => setModalCompletarMovil({ abierto: false, venta: null })
                  })
                }}
                className="btn-primary disabled:opacity-50">
                {completarPedidoMovil.isPending ? 'Guardando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <VentaForm
        modalNuevo={modalNuevo} setModalNuevo={setModalNuevo}
        form={form} setForm={setForm} clientes={clientes}
        clientesFiltrados={clientesFiltrados} clienteBusqueda={clienteBusqueda}
        setClienteBusqueda={setClienteBusqueda}
        prodBusqueda={prodBusqueda} prodsFiltrados={prodsFiltrados}
        buscarProducto={buscarProducto} buscarPorCodigo={buscarPorCodigo}
        agregarProducto={agregarProducto} quitarProducto={quitarProducto}
        cambiarCantidad={cambiarCantidad}
        totalVenta={totalVenta} handleCrear={handleCrear} creando={creando}
        clienteSeleccionado={clienteSeleccionado} cupoFiadoDisponible={cupoFiadoDisponible}
        excedeCupoFiado={excedeCupoFiado} montoFiado={montoFiado} montoInmediato={montoInmediato}
        MINIMO_FIADO={MINIMO_FIADO}
      />
      <VentaDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle}
        setModalAnular={setModalAnular} getBadge={getBadge} />
      <VentaAnular modalAnular={modalAnular} setModalAnular={setModalAnular}
        anular={anular} anulando={anulando} />
      <VentaConfirmDescarga confirmDescarga={confirmDescarga} setConfirmDescarga={setConfirmDescarga} />
      <ReporteDescargaModal abierto={modalReporte} setAbierto={setModalReporte}
        descargarReporte={descargarReporte} nombreEntidad="ventas" />

      {/* PagoForm — por cliente */}
      <PagoForm
        modalNuevo={modalPago} setModalNuevo={setModalPago}
        form={formPago} setForm={setFormPago} errores={erroresPago}
        clienteSel={clienteSel}
        clientesFiltradosModal={clientesFiltradosModal}
        clienteBusqueda={clienteBusquedaPago} setClienteBusqueda={setClienteBusquedaPago}
        clienteDropdown={clienteDropdown} setClienteDropdown={setClienteDropdown}
        deudaCliente={deudaCliente} deudaPorCliente={deudaPorCliente}
        totalDeuda={totalDeuda} pedidosCliente={pedidosCliente}
        pagoCompleto={pagoCompleto} montoPendiente={montoPendientePago}
        handleSubmit={handleSubmitPago} handleMontoChange={handleMontoChange}
        creando={creandoPago} tipoPagoActual={tipoPagoActual}
      />
    </div>
  )
}