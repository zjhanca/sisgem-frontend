import { useState } from 'react'
import { CreditCard, Search, Plus } from 'lucide-react'
import { formatPrecio, formatFecha } from '@shared/utils/validaciones'
import { usePagos } from '@features/admin/pagos/hooks/usePagos'
import PagoForm from '@features/admin/pagos/components/PagoForm'
import CarteraDetalle from '../components/CarteraDetalle'

export default function Cartera() {
  const {
    clientesConDeuda, deudaPorCliente,
    form, setForm, errores,
    clienteSel, clientesFiltradosModal,
    clienteBusqueda, setClienteBusqueda,
    clienteDropdown, setClienteDropdown,
    deudaCliente, totalDeuda, pedidosCliente,
    pagoCompleto, montoPendiente,
    handleSubmit, handleMontoChange, tipoPagoActual,
    modalNuevo, setModalNuevo,
    abrirConCliente,
    creando,
  } = usePagos()

  const [busqueda, setBusqueda]     = useState('')
  const [clienteVer, setClienteVer] = useState(null)

  const clientesFiltrados = clientesConDeuda.filter(c => {
    if (!busqueda) return true
    const t = busqueda.toLowerCase()
    return `${c.nombre} ${c.apellido}`.toLowerCase().includes(t) ||
           (c.numero_documento || '').includes(t)
  })

  const totalCartera = clientesConDeuda.reduce((s, c) =>
    s + (deudaPorCliente[c.id]?.total_deuda || 0), 0
  )

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Cartera</h1>
      </div>

      {/* Resumen total */}
      <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <CreditCard size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-xs text-red-400">Deuda total en cartera</p>
            <p className="text-xl font-bold text-red-600">{formatPrecio(totalCartera)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-red-400">Clientes con deuda</p>
          <p className="text-2xl font-bold text-red-500">{clientesConDeuda.length}</p>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative mb-4 w-64">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar cliente..."
          className="pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gray-200
            bg-white text-light-text placeholder:text-gray-400/60
            focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10
            transition-all w-full" />
      </div>

      {/* Lista clientes con deuda */}
      {clientesFiltrados.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CreditCard size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No hay clientes con deuda pendiente</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clientesFiltrados.map(c => {
            const deuda = deudaPorCliente[c.id]
            if (!deuda) return null
            const pedidosPendientes = deuda.pedidos.filter(p => p.pendiente > 0)
            const masAntiguo = pedidosPendientes.sort((a, b) =>
              new Date(a.fecha_pedido) - new Date(b.fecha_pedido)
            )[0]

            return (
              <div key={c.id}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200
                  bg-white hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => setClienteVer(c)}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center
                    text-sm font-bold text-red-500 shrink-0">
                    {c.nombre?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{c.nombre} {c.apellido}</p>
                    <p className="text-xs text-gray-400">
                      {pedidosPendientes.length} pedido{pedidosPendientes.length !== 1 ? 's' : ''} pendiente{pedidosPendientes.length !== 1 ? 's' : ''}
                      {masAntiguo && ` · desde ${formatFecha(masAntiguo.fecha_pedido)}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Deuda</p>
                    <p className="text-base font-bold text-red-500">{formatPrecio(deuda.total_deuda)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); abrirConCliente(c.id) }}
                    className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                    <Plus size={12} /> Abono
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Detalle cliente */}
      <CarteraDetalle
        cliente={clienteVer}
        deuda={clienteVer ? deudaPorCliente[clienteVer.id] : null}
        onCerrar={() => setClienteVer(null)}
        onAbono={c => { abrirConCliente(c.id); setClienteVer(null) }}
      />

      {/* Form abono */}
      <PagoForm
        modalNuevo={modalNuevo} setModalNuevo={setModalNuevo}
        form={form} setForm={setForm} errores={errores}
        clienteSel={clienteSel}
        clientesFiltradosModal={clientesFiltradosModal}
        clienteBusqueda={clienteBusqueda} setClienteBusqueda={setClienteBusqueda}
        clienteDropdown={clienteDropdown} setClienteDropdown={setClienteDropdown}
        deudaCliente={deudaCliente} deudaPorCliente={deudaPorCliente}
        totalDeuda={totalDeuda} pedidosCliente={pedidosCliente}
        pagoCompleto={pagoCompleto} montoPendiente={montoPendiente}
        handleSubmit={handleSubmit} handleMontoChange={handleMontoChange}
        creando={creando} tipoPagoActual={tipoPagoActual}
      />
    </div>
  )
}