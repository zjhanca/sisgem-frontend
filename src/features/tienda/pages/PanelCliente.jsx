import { ShoppingBag, User, CreditCard, Clock, KeyRound,
         Eye, EyeOff, CheckCircle, XCircle, ChevronDown, ChevronUp, Download } from 'lucide-react'
import { useState, useEffect } from 'react'
import { usePanelCliente } from '../hooks/usePanelCliente'
import { tiendaService } from '../services/tiendaService'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'
import NavbarPublico from '@shared/components/NavbarPublico'
import Footer from '../components/Footer'

const TABS = [
  { id: 'actividad', label: 'Actividad', icon: ShoppingBag },
  { id: 'perfil',    label: 'Mi Perfil', icon: User        },
]

// Carga los productos de un pedido al expandirlo
function ProductosPedido({ pedidoId }) {
  const [prods, setProds] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tiendaService.getProductosPedido(pedidoId)
      .then(datos => setProds(datos || []))
      .catch(() => setProds([]))
      .finally(() => setLoading(false))
  }, [pedidoId])

  if (loading) return <p className="text-xs text-gray-400 py-2">Cargando productos...</p>
  if (!prods.length) return <p className="text-xs text-gray-400 py-2">Sin productos</p>

  return (
    <div className="space-y-1">
      {prods.map((pr, i) => (
        <div key={i} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-dark-bg rounded px-2 py-1.5 gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {pr.imagen_url && (
              <img src={pr.imagen_url} alt="" className="w-7 h-7 object-cover rounded shrink-0"
                onError={e => e.target.style.display='none'} />
            )}
            <span className="truncate">{pr.nombre}</span>
          </div>
          <span className="text-gray-400 shrink-0">× {pr.cantidad}</span>
          <span className="text-primary font-semibold shrink-0">{formatPrecio(pr.subtotal)}</span>
        </div>
      ))}
    </div>
  )
}

export default function PanelCliente() {
  const [showActual, setShowActual]   = useState(false)
  const [showNueva, setShowNueva]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [focusNueva, setFocusNueva]   = useState(false)
  const [errorActual, setErrorActual] = useState('')

  const {
    clienteData, pedidos, misAbonos, loadPedidos,
    tab, setTab,
    pedidoAbierto, setPedidoAbierto,
    modalPass, setModalPass, formPass, setFormPass, cambiandoPass, handleCambiarPass,
    getBadge, descargarComprobante,
  } = usePanelCliente(setErrorActual)

  const passReqs = {
    largo:     (formPass.nueva || '').length >= 6,
    mayuscula: /[A-Z]/.test(formPass.nueva || ''),
    numero:    /[0-9]/.test(formPass.nueva || ''),
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <NavbarPublico />
      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-light-card dark:bg-dark-card p-1 rounded-xl border border-gray-100 dark:border-dark-border w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                tab === t.id ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-primary'
              }`}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {/* ACTIVIDAD */}
        {tab === 'actividad' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Pedidos */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-light-text dark:text-dark-text">Mis Pedidos</h2>
              {loadPedidos && [1,2,3].map(i => (
                <div key={i} className="h-20 rounded-xl bg-light-card dark:bg-dark-card border border-gray-100 dark:border-dark-border animate-pulse" />
              ))}
              {!loadPedidos && pedidos.length === 0 && (
                <div className="text-center py-10 bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border">
                  <ShoppingBag size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 text-xs">Sin pedidos aún</p>
                </div>
              )}
              {pedidos.map(p => {
                const abierto = pedidoAbierto === p.id
                const abonosPedido = misAbonos.filter(a => a.pedido_id === p.id)
                return (
                  <div key={p.id} className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border overflow-hidden">
                    {/* Cabecera clickeable */}
                    <button type="button"
                      onClick={() => setPedidoAbierto(abierto ? null : p.id)}
                      className="w-full p-4 text-left flex items-start justify-between gap-2">
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-light-text dark:text-dark-text">Pedido #{p.id}</span>
                          <span className={getBadge(p.estado)}>{p.estado || 'Pendiente'}</span>
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock size={10} /> {formatFechaHora(p.fecha_pedido)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="text-primary font-bold text-sm">{formatPrecio(p.total)}</p>
                        {abierto
                          ? <ChevronUp size={14} className="text-gray-400" />
                          : <ChevronDown size={14} className="text-gray-400" />}
                      </div>
                    </button>

                    {/* Detalle expandible */}
                    {abierto && (
                      <div className="px-4 pb-4 border-t border-gray-100 dark:border-dark-border pt-3 space-y-3">

                        {/* Productos */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">Productos</p>
                          <ProductosPedido pedidoId={p.id} />
                        </div>

                        {/* Total */}
                        <div className="flex justify-between text-xs font-semibold border-t border-gray-100 pt-2">
                          <span>Total</span>
                          <span className="text-primary">{formatPrecio(p.total)}</span>
                        </div>

                        {/* Pagos del pedido con comprobante */}
                        {abonosPedido.length > 0 && (
                          <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">Pagos</p>
                            <div className="space-y-1">
                              {abonosPedido.map(a => (
                                <div key={a.id} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-dark-bg rounded px-2 py-1.5">
                                  <span className="text-gray-500 capitalize">{a.metodo}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-primary font-semibold">{formatPrecio(a.monto)}</span>
                                    <button type="button" onClick={() => descargarComprobante(a.id)}
                                      title="Descargar comprobante"
                                      className="text-gray-400 hover:text-primary transition-colors">
                                      <Download size={12} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Abonos */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-light-text dark:text-dark-text">Mis Abonos</h2>
              {misAbonos.length === 0 && (
                <div className="text-center py-10 bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border">
                  <CreditCard size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-400 text-xs">Sin abonos registrados</p>
                </div>
              )}
              {misAbonos.map(a => (
                <div key={a.id} className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-light-text dark:text-dark-text">Pago #{a.id}</p>
                      <p className="text-xs text-gray-400">
                        Pedido #{a.pedido_id} · <span className="capitalize">{a.metodo}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-primary font-bold text-sm">{formatPrecio(a.monto)}</p>
                        <span className={a.estado?.toLowerCase().includes('anula') ? 'badge-anulado' : 'badge-activo'}>
                          {a.estado || 'Pagado'}
                        </span>
                      </div>
                      <button type="button" onClick={() => descargarComprobante(a.id)}
                        title="Descargar comprobante"
                        className="text-gray-400 hover:text-primary transition-colors p-1">
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* PERFIL */}
        {tab === 'perfil' && (
          <div className="space-y-4">
            {clienteData ? (
              <>
                <div className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold shrink-0">
                      {clienteData.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-light-text dark:text-dark-text">
                        {clienteData.nombre} {clienteData.apellido}
                      </p>
                      <p className="text-xs text-gray-400">{clienteData.email || '—'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 text-sm pt-3 border-t border-gray-100 dark:border-dark-border">
                    <div><p className="campo-label">Teléfono</p><p className="font-medium">{clienteData.telefono || '—'}</p></div>
                    <div>
                      <p className="campo-label">Documento</p>
                      <p className="font-medium">{clienteData.tipo_documento}: {clienteData.numero_documento || '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                      <KeyRound size={15} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-light-text dark:text-dark-text">Contraseña</p>
                      <p className="text-xs text-gray-400">Cambia tu contraseña de acceso</p>
                    </div>
                  </div>
                  <button onClick={() => setModalPass(true)}
                    className="text-xs font-medium text-primary hover:underline">Cambiar</button>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">Cargando perfil...</p>
            )}
          </div>
        )}
      </main>

      {/* Modal cambiar contraseña */}
      {modalPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-primary" />
              <h3 className="font-semibold text-light-text dark:text-dark-text">Cambiar Contraseña</h3>
            </div>
            <div>
              <label className="campo-label">Contraseña actual *</label>
              <div className="relative">
                <input type={showActual ? 'text' : 'password'} value={formPass.actual}
                  onChange={e => { setFormPass(p => ({ ...p, actual: e.target.value })); setErrorActual('') }}
                  className={`campo-input pr-9 ${errorActual ? 'border-red-400' : ''}`}
                  placeholder="Tu contraseña actual" />
                <button type="button" onClick={() => setShowActual(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showActual ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errorActual && <p className="text-xs text-red-400 mt-1">{errorActual}</p>}
            </div>
            <div>
              <label className="campo-label">Nueva contraseña *</label>
              <div className="relative">
                <input type={showNueva ? 'text' : 'password'} value={formPass.nueva}
                  onChange={e => setFormPass(p => ({ ...p, nueva: e.target.value }))}
                  onFocus={() => setFocusNueva(true)} onBlur={() => setFocusNueva(false)}
                  className="campo-input pr-9" placeholder="Mínimo 6 caracteres" />
                <button type="button" onClick={() => setShowNueva(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNueva ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {(focusNueva || formPass.nueva) && (
                <div className="mt-1.5 space-y-1 p-2 bg-gray-50 rounded-lg">
                  {[
                    { ok: passReqs.largo,     texto: 'Mínimo 6 caracteres' },
                    { ok: passReqs.mayuscula, texto: 'Una mayúscula' },
                    { ok: passReqs.numero,    texto: 'Un número' },
                  ].map(({ ok, texto }) => (
                    <div key={texto} className={`flex items-center gap-1 text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
                      {ok ? <CheckCircle size={10} /> : <XCircle size={10} />} {texto}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="campo-label">Confirmar nueva contraseña *</label>
              <div className="relative">
                <input type={showConfirm ? 'text' : 'password'} value={formPass.confirmar}
                  onChange={e => setFormPass(p => ({ ...p, confirmar: e.target.value }))}
                  className="campo-input pr-9" placeholder="Repite la nueva contraseña" />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {formPass.nueva && formPass.confirmar && formPass.nueva !== formPass.confirmar && (
                <p className="text-xs text-red-400 mt-1">Las contraseñas no coinciden</p>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => { setModalPass(false); setFormPass({ actual: '', nueva: '', confirmar: '' }); setErrorActual('') }}
                className="flex-1 py-2 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-xl">
                Cancelar
              </button>
              <button
                disabled={cambiandoPass || !formPass.actual || !formPass.nueva || !formPass.confirmar}
                onClick={handleCambiarPass}
                className="flex-1 py-2 text-sm btn-primary justify-center disabled:opacity-50">
                {cambiandoPass ? 'Guardando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}