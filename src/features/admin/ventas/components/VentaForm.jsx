import { useState } from 'react'
import Modal from '@shared/components/Modal'
import { CreditCard, Clock, PackagePlus, Trash2 } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'
import ClienteForm           from '@features/admin/clientes/components/ClienteForm'
import { useClientes }       from '@features/admin/clientes/hooks/useClientes'
import SelectorCliente       from './SelectorCliente'
import PanelFiado            from './PanelFiado'
import ModalBuscadorProducto from './ModalBuscadorProducto'

const r50 = n => Math.round(n / 50) * 50

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
      pago_mixto: false, monto_efectivo: '', monto_transferencia: '',
    })
  }

  const abrirNuevoCliente  = () => { abrirModalCliente(); setModalNuevoCliente(true) }
  const cerrarNuevoCliente = () => { cerrarModalCliente(); setModalNuevoCliente(false) }

  const permitefiado       = clienteSeleccionado?.permite_fiado
  const sinCupo            = form.tipo_pago === 'fiado' && permitefiado &&
    cupoFiadoDisponible != null && cupoFiadoDisponible <= 0
  const minimoInsuficiente = totalVenta < (MINIMO_FIADO || 10000)

  const esPagoTotal  = form.tipo_pago === 'total'
  const esPagoMixto  = esPagoTotal && form.pago_mixto
  const montoEf      = parseFloat(form.monto_efectivo || 0)
  const montoTr      = parseFloat(form.monto_transferencia || 0)
  const sumaMixta    = montoEf + montoTr
  const mixtoValido  = !esPagoMixto || Math.abs(sumaMixta - totalVenta) < 1

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
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {form.productos.map((p, idx) => (
                    <div key={`${p.producto_id}-${idx}`}
                      className="flex items-center justify-between text-xs
                        px-2 py-1.5 rounded-lg bg-gray-50">
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
                  <button type="button" onClick={() => setModalBuscador(true)}
                    className="w-full text-xs text-primary/60 hover:text-primary
                      py-1 transition-colors">
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

            {/* Método de pago — solo si es pago total */}
            {form.tipo_pago === 'total' && (
              <div className="space-y-2">
                <label className="campo-label">Método de Pago</label>

                {/* Toggle pago mixto */}
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-400">¿Pago dividido?</span>
                  <button type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      pago_mixto:          !f.pago_mixto,
                      monto_efectivo:      '',
                      monto_transferencia: '',
                    }))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full
                      transition-colors ${form.pago_mixto ? 'bg-primary' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full
                      bg-white transition-transform ${
                        form.pago_mixto ? 'translate-x-4' : 'translate-x-0.5'
                      }`} />
                  </button>
                </div>

                {!form.pago_mixto ? (
                  <div className="flex gap-2">
                    {['efectivo', 'transferencia'].map(m => (
                      <button key={m} type="button"
                        onClick={() => setForm(f => ({ ...f, metodo_pago: m }))}
                        className={`flex-1 py-2 text-xs rounded-lg border transition-all
                          capitalize ${
                          form.metodo_pago === m
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-200 text-gray-500 hover:border-primary/40'
                        }`}>
                        {m}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2 p-3 rounded-lg border border-primary/20 bg-primary/5">
                    <p className="text-xs text-gray-500">
                      Total: <strong className="text-primary">{formatPrecio(totalVenta)}</strong>
                    </p>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="campo-label">Efectivo</label>
                        <input
                          type="text" inputMode="numeric"
                          value={form.monto_efectivo}
                          onChange={e => {
                            const val   = e.target.value.replace(/\D/g, '')
                            const num   = r50(Math.min(parseFloat(val) || 0, totalVenta))
                            const resto = r50(Math.max(0, totalVenta - num))
                            setForm(f => ({
                              ...f,
                              monto_efectivo:      num > 0 ? String(num) : val,
                              monto_transferencia: resto > 0 ? String(resto) : '',
                            }))
                          }}
                          placeholder="0"
                          className="campo-input text-xs"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="campo-label">Transferencia</label>
                        <input
                          type="text" inputMode="numeric"
                          value={form.monto_transferencia}
                          onChange={e => {
                            const val   = e.target.value.replace(/\D/g, '')
                            const num   = r50(Math.min(parseFloat(val) || 0, totalVenta))
                            const resto = r50(Math.max(0, totalVenta - num))
                            setForm(f => ({
                              ...f,
                              monto_transferencia: num > 0 ? String(num) : val,
                              monto_efectivo:      resto > 0 ? String(resto) : '',
                            }))
                          }}
                          placeholder="0"
                          className="campo-input text-xs"
                        />
                      </div>
                    </div>
                    {!mixtoValido && sumaMixta > 0 && (
                      <p className="text-xs text-red-400">
                        La suma ({formatPrecio(sumaMixta)}) no coincide con el total (
                        {formatPrecio(totalVenta)})
                      </p>
                    )}
                    {mixtoValido && sumaMixta > 0 && (
                      <p className="text-xs text-primary">✓ Montos correctos</p>
                    )}
                  </div>
                )}
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
                sinCupo ||
                (esPagoMixto && !mixtoValido)
              }
              className={`w-full btn-primary justify-center disabled:opacity-50 ${
                form.tipo_pago === 'fiado' ? '!bg-amber-500 hover:!bg-amber-500/90' : ''
              }`}>
              {creando
                ? 'Registrando...'
                : form.tipo_pago === 'fiado'
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