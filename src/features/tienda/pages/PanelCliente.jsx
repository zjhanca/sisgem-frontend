import { ShoppingBag, User, CreditCard, KeyRound, Package } from 'lucide-react'
import { usePanelCliente } from '../hooks/usePanelCliente'
import NavbarPublico from '@shared/components/NavbarPublico'
import Footer from '../components/Footer'
import BotonFlotante from '../components/BotonFlotante'
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
    <div className="min-h-screen bg-white flex flex-col">
      <NavbarPublico />

      {/* Banner panel */}
      <div className="relative bg-gradient-to-r from-primary to-green-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(3)].map((_, i) => (
            <div key={i}
              className="absolute rounded-full border-4 border-white"
              style={{
                width:  `${80 + i * 50}px`,
                height: `${80 + i * 50}px`,
                top:    `${(i * 40) % 80}%`,
                left:   `${(i * 30) % 90}%`,
              }} />
          ))}
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-8">
          <p className="text-yellow-400 text-xs font-bold tracking-widest uppercase mb-1">
            Bienvenido
          </p>
          <h1 className="text-2xl md:text-3xl font-black text-white">
            {clienteData
              ? `Hola, ${clienteData.nombre} ${clienteData.apellido}`
              : 'Mi Panel'}
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Revisa tus pedidos, abonos y perfil
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,14 C360,28 1080,0 1440,14 L1440,28 L0,28 Z" fill="#ffffff" />
          </svg>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full">

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-gray-50 p-1 rounded-2xl border border-gray-100 w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs
                font-bold whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-400 hover:text-primary'
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
              <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <ShoppingBag size={16} className="text-primary" /> Mis Pedidos
              </h2>
              {loadPedidos && [1, 2, 3].map(i => (
                <div key={i}
                  className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
              ))}
              {!loadPedidos && pedidos.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center
                    justify-center mx-auto mb-3">
                    <Package size={26} className="text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-xs font-medium">Sin pedidos aún</p>
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
              <h2 className="text-sm font-black text-gray-900 flex items-center gap-2">
                <CreditCard size={16} className="text-primary" /> Mis Abonos
              </h2>
              {misAbonos.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center
                    justify-center mx-auto mb-3">
                    <CreditCard size={26} className="text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-xs font-medium">Sin abonos registrados</p>
                </div>
              )}
              {misAbonos.map(a => (
                <AbonoCard key={a.id} abono={a}
                  descargarComprobante={descargarComprobante} />
              ))}
            </div>
          </div>
        )}

        {/* PERFIL */}
        {tab === 'perfil' && (
          <div className="max-w-lg space-y-4">
            {clienteData ? (
              <>
                {/* Card principal */}
                <div className="bg-white rounded-3xl border border-gray-100
                  shadow-sm p-6 space-y-5">

                  {/* Avatar + nombre */}
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center
                      justify-center text-white text-2xl font-black shadow-lg shrink-0">
                      {clienteData.nombre?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-lg">
                        {clienteData.nombre} {clienteData.apellido}
                      </p>
                      <p className="text-xs text-gray-400">{clienteData.email || '—'}</p>
                    </div>
                  </div>

                  {/* Datos */}
                  <div className="grid grid-cols-1 gap-3 pt-4
                    border-t border-gray-100">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-gray-400 font-medium">Teléfono</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {clienteData.telefono || '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2
                      border-t border-gray-50">
                      <span className="text-xs text-gray-400 font-medium">Documento</span>
                      <span className="text-sm font-semibold text-gray-800">
                        {clienteData.tipo_documento}: {clienteData.numero_documento || '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cambiar contraseña */}
                <div className="bg-white rounded-3xl border border-gray-100
                  shadow-sm p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center
                      justify-center">
                      <KeyRound size={16} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">Contraseña</p>
                      <p className="text-xs text-gray-400">Cambia tu contraseña de acceso</p>
                    </div>
                  </div>
                  <button onClick={() => setModalPass(true)}
                    className="text-xs font-bold text-primary hover:underline px-3 py-1.5
                      rounded-full border border-primary/30 hover:bg-primary/5 transition-all">
                    Cambiar
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center
                  justify-center mx-auto mb-3 animate-pulse">
                  <User size={26} className="text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">Cargando perfil...</p>
              </div>
            )}
          </div>
        )}
      </main>

      {modalPass && <ModalCambiarContrasena onCerrar={() => setModalPass(false)} darkMode />}
      <Footer />
      <BotonFlotante />
    </div>
  )
}