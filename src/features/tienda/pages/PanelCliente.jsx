import { ShoppingBag, User, CreditCard, KeyRound } from 'lucide-react'
import { usePanelCliente } from '../hooks/usePanelCliente'
import NavbarPublico from '@shared/components/NavbarPublico'
import Footer from '../components/Footer'
import ModalCambiarContrasena from '@shared/components/ModalCambiarContrasena'
import PedidoCard from '../components/PedidoCard'
import AbonoCard  from '../components/AbonoCard'

const TABS = [
  { id: 'actividad', label: 'Actividad', icon: ShoppingBag },
  { id: 'perfil',    label: 'Mi Perfil', icon: User        },
]

export default function PanelCliente() {
  const {
    clienteData, pedidos, misAbonos, loadPedidos,
    tab, setTab,
    pedidoAbierto, setPedidoAbierto,
    modalPass, setModalPass,
    getBadge, descargarComprobante,
  } = usePanelCliente()

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
              {pedidos.map(p => (
                <PedidoCard
                  key={p.id}
                  pedido={p}
                  abierto={pedidoAbierto === p.id}
                  onToggle={() => setPedidoAbierto(pedidoAbierto === p.id ? null : p.id)}
                  abonos={misAbonos}
                  descargarComprobante={descargarComprobante}
                  getBadge={getBadge}
                />
              ))}
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
                <AbonoCard key={a.id} abono={a} descargarComprobante={descargarComprobante} />
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

      {modalPass && <ModalCambiarContrasena onCerrar={() => setModalPass(false)} darkMode />}
      <Footer />
    </div>
  )
}