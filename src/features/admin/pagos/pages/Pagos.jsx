import { useState } from 'react'
import { Plus, Eye, Download, Ban, Search, CreditCard } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'
import { usePagos } from '../hooks/usePagos'
import PagoForm            from '../components/PagoForm'
import PagoDetalle         from '../components/PagoDetalle'
import PagoAnular          from '../components/PagoAnular'
import PagoConfirmDescarga from '../components/Pagoconfirmdescarga'

export default function Pagos() {
  const {
    pagosAgrupadosFiltrados, pedidos, form, errores,
    modalNuevo, modalDetalle, modalAnular, grupoDetalle, verHistorial,
    setModalNuevo, setModalDetalle, setModalAnular,
    setForm, filtroEstado, setFiltroEstado,
    filtroDesde, setFiltroDesde,
    filtroHasta, setFiltroHasta,
    filtroBusqueda, setFiltroBusqueda,
    totalPedido, totalPagado, montoPendiente, pagoCompleto, esFiado,
    handleSubmit, handleMontoChange, handlePedidoChange,
    anular, esAnulado, getFechaPago,
    puedeAnularPago, getLimiteAnulacionVenta,
    getEstadoPago, tipoPagoActual,
    pedidoBusqueda, setPedidoBusqueda, pedidoDropdown, setPedidoDropdown,
    abrirConPedido,
    creando, anulando,
  } = usePagos()

  const [confirmDescarga, setConfirmDescarga] = useState(null) // null | { tipo: 'reporte' } | { tipo: 'pago', id }

  const hayFiltros = filtroEstado || filtroDesde || filtroHasta || filtroBusqueda

  const columnas = [
    { key: 'cliente',   label: 'Cliente', render: r => r.cliente || '—' },
    { key: 'total_pagado', label: 'Pagado', render: r => <span className="text-green-600 font-medium">{formatPrecio(r.total_pagado)}</span> },
    { key: 'saldo_pendiente', label: 'Pendiente/Estado',
      render: r => r.completo
        ? <span className="badge-activo">Completo</span>
        : <span className="text-primary font-medium">{formatPrecio(r.saldo_pendiente)}</span>
    },
    { key: 'ultima_fecha', label: 'Último movimiento', render: r => formatFechaHora(r.ultima_fecha) || '—' },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pagos</h1>
        <div className="flex gap-2">
          <button onClick={() => setConfirmDescarga({ tipo: 'reporte' })} className="btn-outline">
            <Download size={14} /> Reporte
          </button>
          <button onClick={() => setModalNuevo(true)} className="btn-primary">
            <Plus size={14} /> Nuevo
          </button>
        </div>
      </div>

      <Tabla columnas={columnas} datos={pagosAgrupadosFiltrados} sinBusqueda
        filtros={<>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={filtroBusqueda} onChange={e => setFiltroBusqueda(e.target.value)}
              placeholder="Buscar por # o cliente..."
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg border
                bg-light-bg dark:bg-dark-bg/60
                border-gray-200 dark:border-dark-border
                text-light-text dark:text-dark-text
                placeholder:text-gray-400/60
                focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10
                transition-all duration-150 w-52" />
          </div>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="campo-input w-36 text-xs">
            <option value="">Todos</option>
            <option value="pagado">Completados</option>
            <option value="abono">Con saldo</option>
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
          <button onClick={() => verHistorial(fila.pedido_id)} className="btn-ghost" title="Ver historial de pagos"><Eye size={14} /></button>
          <button onClick={() => setConfirmDescarga({ tipo: 'pago', id: fila.pedido_id })} className="btn-ghost"><Download size={14} /></button>
          {!fila.completo && (
            <button onClick={() => abrirConPedido(fila.pedido_id)} className="btn-ghost hover:text-primary" title="Registrar abono">
              <CreditCard size={14} />
            </button>
          )}
        </>)}
      />

      <PagoForm modalNuevo={modalNuevo} setModalNuevo={setModalNuevo}
        form={form} setForm={setForm} errores={errores} pedidos={pedidos}
        totalPedido={totalPedido} totalPagado={totalPagado} montoPendiente={montoPendiente}
        pagoCompleto={pagoCompleto} handleSubmit={handleSubmit}
        handleMontoChange={handleMontoChange} handlePedidoChange={handlePedidoChange}
        creando={creando} tipoPagoActual={tipoPagoActual} esFiado={esFiado}
        pedidoBusqueda={pedidoBusqueda} setPedidoBusqueda={setPedidoBusqueda}
        pedidoDropdown={pedidoDropdown} setPedidoDropdown={setPedidoDropdown} />
      <PagoDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle}
        grupoDetalle={grupoDetalle} setModalAnular={setModalAnular} esAnulado={esAnulado}
        getEstadoPago={getEstadoPago} getFechaPago={getFechaPago}
        puedeAnularPago={puedeAnularPago} getLimiteAnulacionVenta={getLimiteAnulacionVenta} />
      <PagoAnular modalAnular={modalAnular} setModalAnular={setModalAnular}
        anular={anular} anulando={anulando} />
      <PagoConfirmDescarga confirmDescarga={confirmDescarga} setConfirmDescarga={setConfirmDescarga} />
    </div>
  )
}