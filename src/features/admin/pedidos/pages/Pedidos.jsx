import { Eye, Search, CheckCircle } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'
import { usePedidos } from '../hooks/usePedidos'
import PedidoDetalle from '../components/PedidoDetalle'

const FILTROS_ESTADO = [
  { key: '',            label: 'Todos'       },
  { key: 'pendiente',   label: 'Pendiente'   },
  { key: 'sin_recoger', label: 'Sin recoger' },
  { key: 'entregado',   label: 'Entregado'   },
  { key: 'anulado',     label: 'Anulado'     },
]

export default function Pedidos() {
  const {
    pedidosFiltrados,
    modalDetalle, setModalDetalle,
    modalConfirmarEntrega, setModalConfirmarEntrega,
    filtroEstado, setFiltroEstado,
    filtroBusqueda, setFiltroBusqueda,
    confirmarEntrega, confirmando,
    getColorEstado, getLabelEstado,
  } = usePedidos()

  const columnas = [
    { key: 'id', label: 'N. Pedido',
      render: r => <span className="font-mono text-xs font-semibold text-gray-500">{r.id}</span> },
    { key: 'cliente', label: 'Cliente', render: r => r.cliente || 'Sin nombre' },
    { key: 'total',   label: 'Total',   render: r => formatPrecio(r.total) },
    { key: 'estado',  label: 'Estado',
      render: r => (
        <span className={`inline-flex items-center justify-center h-6 px-3 min-w-24
          rounded-full text-white text-xs font-semibold ${getColorEstado(r.estado)}`}>
          {getLabelEstado(r.estado)}
        </span>
      )
    },
    { key: 'fecha_pedido', label: 'Fecha', render: r => formatFechaHora(r.fecha_pedido) },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pedidos</h1>
      </div>

      <Tabla columnas={columnas} datos={pedidosFiltrados} sinBusqueda
        filtros={<>
          {/* Buscador */}
          <div className="relative">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input value={filtroBusqueda} onChange={e => setFiltroBusqueda(e.target.value)}
              placeholder="Buscar # o cliente..."
              className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200
                bg-white text-light-text placeholder:text-gray-400/60
                focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10
                transition-all w-48" />
          </div>

          {/* Pills de estado */}
          <div className="flex gap-1">
            {FILTROS_ESTADO.map(f => (
              <button key={f.key} onClick={() => setFiltroEstado(f.key)}
                className={`px-3 py-1.5 text-xs rounded-lg border transition-all ${
                  filtroEstado === f.key
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-200 text-gray-500 hover:border-primary/40'
                }`}>
                {f.label}
              </button>
            ))}
          </div>

          {(filtroEstado || filtroBusqueda) && (
            <button onClick={() => { setFiltroEstado(''); setFiltroBusqueda('') }}
              className="text-xs text-red-400 hover:underline">
              Limpiar
            </button>
          )}
        </>}
        acciones={fila => {
          const esPendiente  = (fila.estado || '').toLowerCase().includes('pendiente')
          const esSinRecoger = (fila.estado || '').toLowerCase().includes('sin recoger')
          return (<>
            <button onClick={() => setModalDetalle({ abierto: true, pedido: fila })}
              className="btn-ghost" title="Ver detalle">
              <Eye size={14} />
            </button>
            {(esPendiente || esSinRecoger) && (
              <button
                onClick={() => setModalConfirmarEntrega({ abierto: true, pedido: fila })}
                className="btn-ghost hover:text-primary" title="Confirmar entrega">
                <CheckCircle size={14} />
              </button>
            )}
          </>)
        }}
      />

      <PedidoDetalle
        modalDetalle={modalDetalle}
        setModalDetalle={setModalDetalle}
        getColorEstado={getColorEstado}
        getLabelEstado={getLabelEstado}
        onConfirmarEntrega={pedido => setModalConfirmarEntrega({ abierto: true, pedido })}
      />

      {modalConfirmarEntrega.abierto && modalConfirmarEntrega.pedido && (
        <Modal abierto onCerrar={() => setModalConfirmarEntrega({ abierto: false, pedido: null })}
          bloquearCierre titulo="Confirmar Entrega" ancho="max-w-sm">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Confirma que el cliente{' '}
              <span className="font-semibold text-light-text">
                {modalConfirmarEntrega.pedido.cliente}
              </span>{' '}
              recogió el pedido{' '}
              <span className="font-semibold text-primary">
                {modalConfirmarEntrega.pedido.id}
              </span>.
            </p>
            <p className="text-sm font-bold text-primary">
              Total: {formatPrecio(modalConfirmarEntrega.pedido.total)}
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button onClick={() => setModalConfirmarEntrega({ abierto: false, pedido: null })}
                className="px-4 py-1.5 text-sm border border-gray-200 text-gray-500 rounded-lg">
                Cancelar
              </button>
              <button disabled={confirmando}
                onClick={() => confirmarEntrega.mutate({ pedido: modalConfirmarEntrega.pedido })}
                className="btn-primary disabled:opacity-50">
                {confirmando ? 'Confirmando...' : 'Confirmar entrega'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}