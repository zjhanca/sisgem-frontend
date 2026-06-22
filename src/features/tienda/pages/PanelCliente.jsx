import { Link } from 'react-router-dom'
import { ShoppingBag, MapPin, User, LogOut, Plus, CreditCard, Clock, KeyRound, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { usePanelCliente } from '../hooks/usePanelCliente'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'

const TABS = [
  { id: 'pedidos',     label: 'Mis Pedidos',  icon: ShoppingBag },
  { id: 'abonos',      label: 'Abonos',        icon: CreditCard  },
  { id: 'direcciones', label: 'Direcciones',    icon: MapPin      },
  { id: 'perfil',      label: 'Mi Perfil',      icon: User        },
]

export default function PanelCliente() {
  const {
    usuario, clienteData, pedidos, misAbonos, direcciones, loadPedidos,
    tab, setTab,
    modalAbono, setModalAbono, formAbono, setFormAbono,
    modalDir, setModalDir, formDir, setFormDir,
    modalPass, setModalPass, formPass, setFormPass, cambiandoPass, handleCambiarPass,
    crearAbono, crearDir,
    handleLogout, getBadge,
  } = usePanelCliente()

  const [showActual, setShowActual]   = useState(false)
  const [showNueva, setShowNueva]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">

      {/* header */}
      <div className="bg-light-card dark:bg-dark-card border-b border-gray-100 dark:border-dark-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-primary">SISGEM</Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center
                text-primary text-xs font-bold">
                {usuario?.nombre?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-600 dark:text-dark-text/70 hidden sm:inline">
                Hola, <span className="font-semibold text-light-text dark:text-dark-text">{usuario?.nombre}</span>
              </span>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors">
              <LogOut size={13} /> Salir
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* tabs */}
        <div className="flex gap-1 mb-6 bg-light-card dark:bg-dark-card p-1 rounded-xl border border-gray-100 dark:border-dark-border overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                tab === t.id ? 'bg-primary text-dark-bg shadow-sm' : 'text-gray-500 dark:text-dark-text/60 hover:text-primary'
              }`}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {/* PEDIDOS */}
        {tab === 'pedidos' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-light-text dark:text-dark-text">Mis Pedidos</h2>
              <Link to="/productos" className="btn-primary text-xs"><Plus size={12} /> Nuevo Pedido</Link>
            </div>
            {loadPedidos && <p className="text-sm text-gray-400 text-center py-8">Cargando...</p>}
            {!loadPedidos && pedidos.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm">Aún no tienes pedidos</p>
                <Link to="/productos" className="btn-primary text-xs mt-3 inline-flex"><Plus size={12} /> Hacer un Pedido</Link>
              </div>
            )}
            {pedidos.map(p => (
              <div key={p.id} className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-light-text dark:text-dark-text">Pedido #{p.id}</span>
                      <span className={getBadge(p.estado)}>{p.estado || 'Pendiente'}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> {formatFechaHora(p.fecha_pedido)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Tipo: {p.tipo_venta === 'domicilio' ? '🛵 Domicilio' : '🏪 Mostrador'}
                    </p>
                    {p.notas && <p className="text-xs italic text-gray-400 mt-1">{p.notas}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold">{formatPrecio(p.total)}</p>
                    <button onClick={() => setModalAbono({ abierto: true, pedido: p })}
                      className="text-xs text-primary hover:underline mt-1 block">
                      Registrar Abono
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ABONOS */}
        {tab === 'abonos' && (
          <div className="space-y-3">
            <h2 className="font-semibold text-light-text dark:text-dark-text">Mis Abonos</h2>
            {misAbonos.length === 0 && (
              <div className="text-center py-12">
                <CreditCard size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm">Sin abonos registrados</p>
              </div>
            )}
            {misAbonos.map(a => (
              <div key={a.id} className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-light-text dark:text-dark-text">
                      Comprobante {a.numero_comprobante || `#${a.id}`}
                    </span>
                    <p className="text-xs text-gray-400">Pedido #{a.pedido_id} · {a.metodo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold">{formatPrecio(a.monto)}</p>
                    <span className={a.estado?.toLowerCase().includes('anula') ? 'badge-anulado' : 'badge-activo'}>
                      {a.estado || 'Activo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* DIRECCIONES */}
        {tab === 'direcciones' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-light-text dark:text-dark-text">Mis Direcciones</h2>
              <button onClick={() => setModalDir(true)} className="btn-primary text-xs"><Plus size={12} /> Agregar</button>
            </div>
            {direcciones.length === 0 && (
              <div className="text-center py-12">
                <MapPin size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm">Sin direcciones guardadas</p>
              </div>
            )}
            {direcciones.map(d => (
              <div key={d.id} className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4">
                <p className="text-sm font-medium text-light-text dark:text-dark-text">{d.direccion}</p>
                {d.barrio       && <p className="text-xs text-gray-400 mt-0.5">Barrio: {d.barrio}</p>}
                {d.indicaciones && <p className="text-xs text-gray-400 italic mt-0.5">{d.indicaciones}</p>}
              </div>
            ))}
          </div>
        )}

        {/* PERFIL */}
        {tab === 'perfil' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-light-text dark:text-dark-text">Mi Perfil</h2>
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

                  <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-gray-100 dark:border-dark-border">
                    <div><p className="campo-label">Teléfono</p><p className="font-medium">{clienteData.telefono || '—'}</p></div>
                    <div><p className="campo-label">Documento</p><p className="font-medium">{clienteData.tipo_documento}: {clienteData.numero_documento || '—'}</p></div>
                  </div>
                </div>

                {/* cambiar contraseña */}
                <div className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4
                  flex items-center justify-between">
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
                    className="text-xs font-medium text-primary hover:underline">
                    Cambiar
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">Cargando perfil...</p>
            )}
          </div>
        )}
      </div>

      {/* MODAL ABONO */}
      {modalAbono.abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4">
            <h3 className="font-semibold text-light-text dark:text-dark-text">
              Registrar Abono — Pedido #{modalAbono.pedido?.id}
            </h3>
            <div className="text-sm p-3 rounded-lg bg-light-bg dark:bg-dark-bg">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Pedido</span>
                <span>{formatPrecio(modalAbono.pedido?.total)}</span>
              </div>
            </div>
            <div>
              <label className="campo-label">Monto *</label>
              <input type="number" step="0.01" value={formAbono.monto}
                onChange={e => setFormAbono(p => ({ ...p, monto: e.target.value }))}
                className="campo-input" placeholder="0.00" />
            </div>
            <div>
              <label className="campo-label">Método</label>
              <select value={formAbono.metodo} onChange={e => setFormAbono(p => ({ ...p, metodo: e.target.value }))} className="campo-input">
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="nequi">Nequi</option>
                <option value="daviplata">Daviplata</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setModalAbono({ abierto: false, pedido: null })}
                className="flex-1 py-2 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-xl">
                Cancelar
              </button>
              <button
                disabled={crearAbono.isPending || !formAbono.monto}
                onClick={() => crearAbono.mutate({ pedido_id: modalAbono.pedido.id, ...formAbono })}
                className="flex-1 py-2 text-sm btn-primary justify-center disabled:opacity-50">
                {crearAbono.isPending ? 'Registrando...' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NUEVA DIRECCIÓN */}
      {modalDir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-3">
            <h3 className="font-semibold text-light-text dark:text-dark-text">Nueva Dirección</h3>
            <div>
              <label className="campo-label">Dirección *</label>
              <input value={formDir.direccion} onChange={e => setFormDir(p => ({ ...p, direccion: e.target.value }))}
                className="campo-input" placeholder="Ej: Calle 50 # 40-10" />
            </div>
            <div>
              <label className="campo-label">Barrio</label>
              <input value={formDir.barrio} onChange={e => setFormDir(p => ({ ...p, barrio: e.target.value }))}
                className="campo-input" placeholder="Ej: Laureles" />
            </div>
            <div>
              <label className="campo-label">Indicaciones</label>
              <input value={formDir.indicaciones} onChange={e => setFormDir(p => ({ ...p, indicaciones: e.target.value }))}
                className="campo-input" placeholder="Ej: Piso 3, Apto 301" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setModalDir(false)}
                className="flex-1 py-2 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-xl">
                Cancelar
              </button>
              <button
                disabled={crearDir.isPending || !formDir.direccion}
                onClick={() => crearDir.mutate(formDir)}
                className="flex-1 py-2 text-sm btn-primary justify-center disabled:opacity-50">
                {crearDir.isPending ? 'Guardando...' : 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CAMBIAR CONTRASEÑA */}
      {modalPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-primary" />
              <h3 className="font-semibold text-light-text dark:text-dark-text">Cambiar Contraseña</h3>
            </div>

            {/* contraseña actual */}
            <div>
              <label className="campo-label">Contraseña actual *</label>
              <div className="relative">
                <input
                  type={showActual ? 'text' : 'password'}
                  value={formPass.actual}
                  onChange={e => setFormPass(p => ({ ...p, actual: e.target.value }))}
                  className="campo-input pr-9"
                  placeholder="Tu contraseña actual"
                />
                <button type="button" onClick={() => setShowActual(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showActual ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* nueva contraseña */}
            <div>
              <label className="campo-label">Nueva contraseña *</label>
              <div className="relative">
                <input
                  type={showNueva ? 'text' : 'password'}
                  value={formPass.nueva}
                  onChange={e => setFormPass(p => ({ ...p, nueva: e.target.value }))}
                  className="campo-input pr-9"
                  placeholder="Mínimo 6 caracteres"
                />
                <button type="button" onClick={() => setShowNueva(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNueva ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* confirmar */}
            <div>
              <label className="campo-label">Confirmar nueva contraseña *</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={formPass.confirmar}
                  onChange={e => setFormPass(p => ({ ...p, confirmar: e.target.value }))}
                  className="campo-input pr-9"
                  placeholder="Repite la nueva contraseña"
                />
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
              <button
                onClick={() => { setModalPass(false); setFormPass(passVacio) }}
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
    </div>
  )
}