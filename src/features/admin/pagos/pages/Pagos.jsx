import { useState } from 'react'
import { Eye, Download, Search } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import ReporteDescargaModal from '../components/ReporteDescargaModal'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'
import { usePagos } from '../hooks/usePagos'
import PagoDetalle         from '../components/PagoDetalle'
import PagoAnular          from '../components/PagoAnular'
import PagoConfirmDescarga from '../components/Pagoconfirmdescarga'

function BadgeEstado({ color, label }) {
  return (
    <span className={`inline-flex items-center justify-center h-6 min-w-24 px-3 rounded-full text-white text-xs font-semibold ${color}`}>
      {label}
    </span>
  )
}

const maxFechaHoy = () => new Date().toISOString().slice(0, 16)

export default function Pagos() {
  const {
    pagosAgrupadosFiltrados,
    modalDetalle, modalAnular, grupoDetalle, verHistorial,
    setModalDetalle, setModalAnular,
    filtroEstado, setFiltroEstado,
    filtroDesde, setFiltroDesde,
    filtroHasta, setFiltroHasta,
    filtroBusqueda, setFiltroBusqueda,
    esAnulado, getFechaPago,
    puedeAnularPago, getLimiteAnulacionVenta,
    getEstadoPago,
    anular, anulando,
    descargarReporte,
  } = usePagos()

  const [confirmDescarga, setConfirmDescarga] = useState(null)
  const [modalReporte, setModalReporte]       = useState(false)

  const hayFiltros = filtroEstado || filtroDesde || filtroHasta || filtroBusqueda

  const columnas = [
    { key: 'pedido_id', label: 'N. Venta',
      render: r => <span className="font-mono text-xs font-semibold text-gray-500">{r.pedido_id}</span> },
    { key: 'cliente', label: 'Cliente',
      render: r => r.cliente || '—' },
    { key: 'total_pagado', label: 'Pagado',
      render: r => <span className="text-light-text font-medium">{formatPrecio(r.total_pagado)}</span> },
    { key: 'saldo_pendiente', label: 'Estado',
      render: r => r.venta_anulada
        ? <BadgeEstado color="bg-gray-300"    label="Anulado"  />
        : r.completo
          ? <BadgeEstado color="bg-primary"   label="Completo" />
          : <BadgeEstado color="bg-amber-500" label={formatPrecio(r.saldo_pendiente)} />
    },
    { key: 'ultima_fecha', label: 'Último movimiento',
      render: r => formatFechaHora(r.ultima_fecha) || '—' },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pagos</h1>
        <button onClick={() => setModalReporte(true)} className="btn-outline">
          <Download size={14} /> Reporte
        </button>
      </div>

      <Tabla columnas={columnas} datos={pagosAgrupadosFiltrados} sinBusqueda
        filtros={<>
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={filtroBusqueda} onChange={e => setFiltroBusqueda(e.target.value)}
              placeholder="Buscar por # o cliente..."
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg border
                bg-light-bg dark:bg-dark-bg/60 border-gray-200 dark:border-dark-border
                text-light-text dark:text-dark-text placeholder:text-gray-400/60
                focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10
                transition-all duration-150 w-52" />
          </div>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}
            className="campo-input w-36 text-xs">
            <option value="">Todos</option>
            <option value="pagado">Completados</option>
            <option value="abono">Con saldo</option>
            <option value="anulado">Anulados</option>
          </select>
          <input type="datetime-local" value={filtroDesde} max={maxFechaHoy()}
            onChange={e => setFiltroDesde(e.target.value)}
            className="campo-input w-44 text-xs" title="Desde" />
          <input type="datetime-local" value={filtroHasta} max={maxFechaHoy()}
            onChange={e => setFiltroHasta(e.target.value)}
            className="campo-input w-44 text-xs" title="Hasta" />
          {hayFiltros && (
            <button onClick={() => { setFiltroEstado(''); setFiltroDesde(''); setFiltroHasta(''); setFiltroBusqueda('') }}
              className="btn-ghost text-xs text-red-400">Limpiar</button>
          )}
        </>}
        acciones={fila => (<>
          <button onClick={() => verHistorial(fila.pedido_id)}
            className="btn-ghost" title="Ver historial">
            <Eye size={14} />
          </button>
          <button onClick={() => setConfirmDescarga({ tipo: 'pago', id: fila.pedido_id })}
            className="btn-ghost">
            <Download size={14} />
          </button>
        </>)}
      />

      <PagoDetalle
        modalDetalle={modalDetalle} setModalDetalle={setModalDetalle}
        grupoDetalle={grupoDetalle} setModalAnular={setModalAnular}
        esAnulado={esAnulado} getEstadoPago={getEstadoPago}
        getFechaPago={getFechaPago} puedeAnularPago={puedeAnularPago}
        getLimiteAnulacionVenta={getLimiteAnulacionVenta} />
      <PagoAnular modalAnular={modalAnular} setModalAnular={setModalAnular}
        anular={anular} anulando={anulando} />
      <PagoConfirmDescarga confirmDescarga={confirmDescarga} setConfirmDescarga={setConfirmDescarga} />
      <ReporteDescargaModal abierto={modalReporte} setAbierto={setModalReporte}
        descargarReporte={descargarReporte} nombreEntidad="pagos" />
    </div>
  )
}