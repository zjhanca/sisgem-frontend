import { useState } from 'react'
import Modal from '@shared/components/Modal'
import { CreditCard, Clock } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'
import ClienteForm      from '@features/admin/clientes/components/ClienteForm'
import { useClientes }  from '@features/admin/clientes/hooks/useClientes'
import BuscadorProducto    from './BuscadorProducto'
import ListaProductosVenta from './ListaProductosVenta'
import SelectorCliente     from './SelectorCliente'
import PanelFiado          from './PanelFiado'

export default function VentaForm({
  modalNuevo, setModalNuevo, form, setForm,
  clientes, clientesFiltrados, clienteBusqueda, setClienteBusqueda,
  prodBusqueda, prodsFiltrados, buscarProducto, buscarPorCodigo,
  agregarProducto, quitarProducto, cambiarCantidad, totalVenta, handleCrear, creando,
  clienteSeleccionado, cupoFiadoDisponible, excedeCupoFiado, montoFiado, montoInmediato,
  MINIMO_FIADO,
}) {
  const [modalNuevoCliente, setModalNuevoCliente] = useState(false)

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
  const sinCupo            = permitefiado && cupoFiadoDisponible != null && cupoFiadoDisponible <= 0
  const minimoInsuficiente = totalVenta < (MINIMO_FIADO || 10000)

  const totalPorProducto = {}
  for (const p of form.productos)
    totalPorProducto[p.producto_id] = (totalPorProducto[p.producto_id] || 0) + (+p.cantidad || 0)

  return (
    <>
      <Modal abierto={modalNuevo} onCerrar={cerrar} bloquearCierre titulo="Nueva Venta — Mostrador" ancho="max-w-xl">
        <form
          onSubmit={e => {
            console.log('submit capturado')
            handleCrear(e)
          }}
          className="flex flex-col"
          style={{ maxHeight: '80vh' }}
        >
          <div className="overflow-y-auto flex-1 space-y-4 pr-1">

            {/* Banner tipo pago */}
            <div className={`flex items-center gap-2 p-3 rounded-xl border ${
              form.tipo_pago === 'fiado' ? 'bg-amber-500/10 border-amber-500/30' : 'bg-primary/10 border-primary/30'
            }`}>
              {form.tipo_pago === 'fiado'
                ? <Clock size={15} className="text-amber-500 shrink-0" />
                : <CreditCard size={15} className="text-primary shrink-0" />}
              <div>
                <p className={`text-xs font-semibold ${form.tipo_pago === 'fiado' ? 'text-amber-500' : 'text-primary'}`}>
                  {form.tipo_pago === 'fiado' ? 'Venta a Crédito (Fiado)' : 'Venta en Mostrador'}
                </p>
                <p className="text-xs text-gray-500">
                  {form.tipo_pago === 'fiado'
                    ? 'El cliente pagará después — quedará como pendiente'
                    : 'Se registrará automáticamente como pagada'}
                </p>
              </div>
            </div>

            {/* Productos */}
            <div className="p-3 rounded-xl border border-gray-200 space-y-2">
              <p className="text-xs font-semibold">Productos</p>
              <BuscadorProducto
                prodBusqueda={prodBusqueda}
                prodsFiltrados={prodsFiltrados}
                buscarProducto={buscarProducto}
                buscarPorCodigo={buscarPorCodigo}
                agregarProducto={agregarProducto}
              />
              {form.productos.length > 0 && (
                <ListaProductosVenta
                  productos={form.productos}
                  totalPorProducto={totalPorProducto}
                  cambiarCantidad={cambiarCantidad}
                  quitarProducto={quitarProducto}
                />
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
            {form.tipo_pago !== 'fiado' && (
              <div>
                <label className="campo-label">Método de Pago</label>
                <div className="flex gap-2">
                  {[{ val: 'efectivo', label: 'Efectivo' }, { val: 'transferencia', label: 'Transferencia' }].map(m => (
                    <button key={m.val} type="button"
                      onClick={() => setForm(f => ({ ...f, metodo_pago: m.val }))}
                      className={`flex-1 py-2 text-xs rounded-lg border transition-all ${
                        form.metodo_pago === m.val
                          ? 'bg-primary text-white border-primary'
                          : 'border-gray-200 text-gray-500 hover:border-primary/40'
                      }`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Total + Submit */}
          <div className="pt-3 mt-3 border-t border-gray-100 space-y-3 shrink-0">
            <div className="flex justify-between items-center px-1">
              <span className="text-sm font-semibold text-light-text">Total</span>
              <span className="text-lg font-bold text-primary">{formatPrecio(totalVenta)}</span>
            </div>
            <button type="submit"
              disabled={
                creando ||
                Object.values(totalPorProducto).length === 0 ||
                form.productos.some(p => !p.cantidad || +p.cantidad < 1) ||
                sinCupo
              }
              className={`w-full btn-primary justify-center disabled:opacity-50 ${
                form.tipo_pago === 'fiado' ? '!bg-amber-500 hover:!bg-amber-500/90' : ''
              }`}>
              {creando ? 'Registrando...' : form.tipo_pago === 'fiado'
                ? (excedeCupoFiado ? 'Registrar Fiado Parcial' : 'Registrar Fiado')
                : 'Aceptar'}
            </button>
          </div>
        </form>
      </Modal>

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