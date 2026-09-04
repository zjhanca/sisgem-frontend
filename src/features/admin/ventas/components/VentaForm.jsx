import { useState } from 'react'
import Modal from '@shared/components/Modal'
import { CreditCard, Clock, PackagePlus, Trash2 } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'
import ClienteForm           from '@features/admin/clientes/components/ClienteForm'
import { useClientes }       from '@features/admin/clientes/hooks/useClientes'
import SelectorCliente       from './SelectorCliente'
import PanelFiado            from './PanelFiado'
import ModalBuscadorProducto from './ModalBuscadorProducto'

export default function VentaForm({
  modalNuevo, setModalNuevo, form, setForm,
  clientes, clientesFiltrados, clienteBusqueda, setClienteBusqueda,
  prodBusqueda, prodsFiltrados, buscarProducto, buscarPorCodigo,
  agregarProducto, quitarProducto, cambiarCantidad, totalVenta, handleCrear, creando,
  clienteSeleccionado, cupoFiadoDisponible, excedeCupoFiado, montoFiado, montoInmediato,
  MINIMO_FIADO,
}) {
  const [modalNuevoCliente, setModalNuevoCliente] = useState(false)
  const [modalBuscador, setModalBuscador]         = useState(false)

  const {
    form: formCliente, errores: erroresCliente, modal: modalCliente,
    handleChange: handleChangeCliente, handleSubmit: handleSubmitCliente,
    cerrarModal: cerrarModalCliente, guardando: guardandoCliente,
    verificando: verificandoCliente, abrirModal: abrirModalCliente,
  } = useClientes()

  const cerrar = () => {
    setModalNuevo(false)
    setForm({
      tipo_cliente: 'registrado', cliente_id: '', cliente_nombre: '',
      productos: [], tipo_pago: 'total', metodo_pago: 'efectivo',
      metodo_pago_inmediato: 'efectivo',
    })
  }

  const abrirNuevoCliente  = () => { abrirModalCliente(); setModalNuevoCliente(true) }
  const cerrarNuevoCliente = () => { cerrarModalCliente(); setModalNuevoCliente(false) }

  const permitefiado       = clienteSeleccionado?.permite_fiado
  const sinCupo            = form.tipo_pago === 'fiado' && permitefiado && cupoFiadoDisponible != null && cupoFiadoDisponible <= 0
  const minimoInsuficiente = totalVenta < (MINIMO_FIADO || 10000)

  const totalPorProducto = {}
  for (const p of form.productos)
    totalPorProducto[p.producto_id] = (totalPorProducto[p.producto_id] || 0) + (+p.cantidad || 0)

  return (
    <>
      <Modal abierto={modalNuevo} onCerrar={cerrar} bloquearCierre
        titulo="Nueva Venta — Mostrador" ancho="max-w-md">
        <form className="flex flex-col" style={{ maxHeight: '80vh' }}>
          <div className="overflow-y-auto flex-1 space-y-4 pr-1">

            {/* Banner tipo pago */}
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${
              form.tipo_pago === 'fiado'
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-primary/10 border-primary/30'
            }`}>
              {form.tipo_pago === 'fiado'
                ? <Clock size={15} className="text-amber-500 shrink-0" />
                : <CreditCard size={15} className="text-primary shrink-0" />}
              <div>
                <p className={`text-xs font-semibold ${
                  form.tipo_pago === 'fiado' ? 'text-amber-500' : 'text-primary'
                }`}>
                  {form.tipo_pago === 'fiado' ? 'Venta a Crédito' : 'Venta en Mostrador'}
                </p>
                <p className="text-xs text-gray-500">
                  {form.tipo_pago === 'fiado'
                    ? 'El cliente pagará después'
                    : 'Se registra como pagada automáticamente'}
                </p>
              </div>
            </div>

            {/* Productos */}
            <div className="p-3 rounded-xl border border-gray-200 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-gray-600">
                  Productos {form.productos.length > 0 && (
                    <span className="ml-1 text-primary font-bold">({form.productos.length})</span>
                  )}
                </p>
                <button type="button" onClick={() => setModalBuscador(true)}
                  className="flex items-center gap-1.5 text-xs text-primary
                    px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/5
                    hover:bg-primary/10 transition-colors">
                  <PackagePlus size={13} /> Agregar
                </button>
              </div>

              {form.productos.length === 0 ? (
                <button type="button" onClick={() => setModalBuscador(true)}
                  className="w-full py-5 rounded-lg border-2 border-dashed border-gray-200
                    text-xs text-gray-400 hover:border-primary/40 hover:text-primary
                    transition-colors flex flex-col items-center gap-1">
                  <PackagePlus size={18} className="opacity-40" />
                  Toca para agregar productos
                </button>
              ) : (
                // Lista compacta — solo resumen, la edición es en el modal
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {form.productos.map((p, idx) => (
                    <div key={`${p.producto_id}-${idx}`}
                      className="flex items-center justify-between text-xs px-2 py-1.5 rounded-lg bg-gray-50">
                      <span className="flex-1 truncate font-medium">{p.nombre}</span>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-gray-400">×{p.cantidad}</span>
                        <span className="text-primary font-semibold">
                          {formatPrecio(p.precio_unitario * (+p.cantidad || 0))}
                        </span>
                        <button type="button" onClick={() => quitarProducto(idx)}
                          className="text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {/* Editar cantidades */}
                  <button type="button" onClick={() => setModalBuscador(true)}
                    className="w-full text-xs text-primary/60 hover:text-primary py-1 transition-colors">
                    Editar cantidades →
                  </button>
                </div>
              )}
            </div>

            {/* Cliente */}
            <SelectorCliente
              form={form} setForm={setForm}
              clientesFiltrados={clientesFiltrados}
              clienteBusqueda={clienteBusqueda}
              setClienteBusqueda={setClienteBusqueda}
              clienteSeleccionado={clienteSeleccionado}
              abrirNuevoCliente={abrirNuevoCliente}
            />

            {/* Fiado */}
            <PanelFiado
              form={form} setForm={setForm}
              clienteSeleccionado={clienteSeleccionado}
              cupoFiadoDisponible={cupoFiadoDisponible}
              excedeCupoFiado={excedeCupoFiado}
              montoFiado={montoFiado}
              montoInmediato={montoInmediato}
              totalVenta={totalVenta}
              permitefiado={permitefiado}
              sinCupo={sinCupo}
              minimoInsuficiente={minimoInsuficiente}
              MINIMO_FIADO={MINIMO_FIADO}
            />

            {/* Método de pago */}
            {form.tipo_pago !== 'Crédito' && (
              <div>
                <label className="campo-label">Método de Pago</label>
                <div className="flex gap-2">
                  {['efectivo', 'transferencia'].map(m => (
                    <button key={m} type="button"
                      onClick={() => setForm(f => ({ ...f, metodo_pago: m }))}
                      className={`flex-1 py-2 text-xs rounded-lg border transition-all capitalize ${
                        form.metodo_pago === m
                          ? 'bg-primary text-white border-primary'
                          : 'border-gray-200 text-gray-500 hover:border-primary/40'
                      }`}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Total + Submit */}
          <div className="pt-3 mt-3 border-t border-gray-100 space-y-3 shrink-0">
            <div className="flex justify-between items-center px-1">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-lg font-bold text-primary">{formatPrecio(totalVenta)}</span>
            </div>
            <button type="button" onClick={handleCrear}
              disabled={
                creando ||
                form.productos.length === 0 ||
                form.productos.some(p => !p.cantidad || +p.cantidad < 1) ||
                sinCupo
              }
              className={`w-full btn-primary justify-center disabled:opacity-50 ${
                form.tipo_pago === 'Crédito' ? '!bg-amber-500 hover:!bg-amber-500/90' : ''
              }`}>
              {creando
                ? 'Registrando...'
                : form.tipo_pago === 'Crédito'
                  ? (excedeCupoFiado ? 'Registrar Crédito Parcial' : 'Registrar Crédito')
                  : 'Aceptar'}
            </button>
          </div>
        </form>
      </Modal>

      <ModalBuscadorProducto
        abierto={modalBuscador}
        onCerrar={() => setModalBuscador(false)}
        prodBusqueda={prodBusqueda}
        prodsFiltrados={prodsFiltrados}
        buscarProducto={buscarProducto}
        buscarPorCodigo={buscarPorCodigo}
        agregarProducto={agregarProducto}
        form={form}
        cambiarCantidad={cambiarCantidad}
        quitarProducto={quitarProducto}
      />

      <ClienteForm
        verificando={verificandoCliente}
        modal={{ ...modalCliente, abierto: modalNuevoCliente }}
        form={formCliente}
        errores={erroresCliente}
        handleChange={handleChangeCliente}
        handleSubmit={async e => { await handleSubmitCliente(e); setModalNuevoCliente(false) }}
        cerrarModal={cerrarNuevoCliente}
        guardando={guardandoCliente}
      />
    </>
  )
}