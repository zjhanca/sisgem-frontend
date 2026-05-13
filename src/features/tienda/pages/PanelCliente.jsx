import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import api from '@shared/services/api'
import { useAuth } from '@shared/contexts/AuthContext'
import toast from 'react-hot-toast'
import { ShoppingBag, MapPin, User, LogOut, Plus, Eye, CreditCard, Clock } from 'lucide-react'
import { formatPrecio, formatFechaHora } from '@shared/utils/validaciones'
 
const TABS = [
  { id: 'pedidos',   label: 'Mis pedidos',   icon: ShoppingBag },
  { id: 'abonos',    label: 'Abonos',        icon: CreditCard },
  { id: 'direcciones', label: 'Direcciones', icon: MapPin },
  { id: 'perfil',    label: 'Mi perfil',     icon: User },
]
 
export default function PanelCliente() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [tab, setTab] = useState('pedidos')
  const [modalAbono, setModalAbono] = useState({ abierto: false, pedido: null })
  const [modalDir, setModalDir]     = useState(false)
  const [formAbono, setFormAbono]   = useState({ monto: '', metodo: 'efectivo' })
  const [formDir, setFormDir]       = useState({ direccion: '', barrio: '', indicaciones: '' })
 
  // buscar cliente vinculado al usuario
  const { data: clienteData } = useQuery({
    queryKey: ['mi-perfil'],
    queryFn: () => api.get('/clientes').then(r => {
      const todos = r.data.datos
      return todos.find(c => c.email === usuario?.email) || null
    }),
    enabled: !!usuario
  })
  const cliente_id = clienteData?.id
 
  const { data: pedidos = [], isLoading: loadPedidos } = useQuery({
    queryKey: ['mis-pedidos', cliente_id],
    queryFn: () => api.get(`/pedidos?cliente_id=${cliente_id}`).then(r => r.data.datos),
    enabled: !!cliente_id
  })
 
  const { data: abonos = [] } = useQuery({
    queryKey: ['mis-abonos'],
    queryFn: () => api.get('/abonos').then(r => r.data.datos),
    enabled: !!cliente_id
  })
 
  const { data: direcciones = [], refetch: refetchDirs } = useQuery({
    queryKey: ['mis-dirs', cliente_id],
    queryFn: () => api.get(`/clientes/${cliente_id}/direcciones`).then(r => r.data.datos),
    enabled: !!cliente_id
  })
 
  const crearAbono = useMutation({
    mutationFn: data => api.post('/abonos', data),
    onSuccess: () => {
      qc.invalidateQueries(['mis-abonos'])
      setModalAbono({ abierto: false, pedido: null })
      setFormAbono({ monto: '', metodo: 'efectivo' })
      toast.success('abono registrado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const crearDir = useMutation({
    mutationFn: data => api.post(`/clientes/${cliente_id}/direcciones`, data),
    onSuccess: () => {
      refetchDirs()
      setModalDir(false)
      setFormDir({ direccion: '', barrio: '', indicaciones: '' })
      toast.success('direccion guardada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const handleLogout = () => { logout(); navigate('/login') }
 
  const getBadge = nombre => {
    if (!nombre) return 'badge-pendiente'
    const n = nombre.toLowerCase()
    if (n.includes('anula')) return 'badge-anulado'
    if (n.includes('entrega') || n.includes('paga')) return 'badge-activo'
    if (n.includes('proceso')) return 'badge-proceso'
    return 'badge-pendiente'
  }
 
  // abonos del cliente (filtrar por sus pedidos)
  const pedidoIds = pedidos.map(p => p.id)
  const misAbonos = abonos.filter(a => pedidoIds.includes(a.pedido_id))
 
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      {/* header */}
      <div className="bg-light-card dark:bg-dark-card border-b border-gray-100 dark:border-dark-border px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-primary">SISGEM</Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-dark-text/70">
              hola, <span className="font-medium text-light-text dark:text-dark-text">{usuario?.nombre}</span>
            </span>
            <button onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 transition-colors">
              <LogOut size={13} /> salir
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
                tab === t.id
                  ? 'bg-primary text-dark-bg shadow-sm'
                  : 'text-gray-500 dark:text-dark-text/60 hover:text-primary'
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
              <Link to="/productos" className="btn-primary text-xs"><Plus size={12} /> nuevo pedido</Link>
            </div>
            {loadPedidos && <p className="text-sm text-gray-400 text-center py-8">Cargando...</p>}
            {!loadPedidos && pedidos.length === 0 && (
              <div className="text-center py-12">
                <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm">aun no tienes pedidos</p>
                <Link to="/productos" className="btn-primary text-xs mt-3 inline-flex"><Plus size={12} /> hacer un pedido</Link>
              </div>
            )}
            {pedidos.map(p => (
              <div key={p.id} className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-light-text dark:text-dark-text">pedido #{p.id}</span>
                      <span className={getBadge(p.estado)}>{p.estado || 'pendiente'}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={10} /> {formatFechaHora(p.fecha_pedido)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      tipo: {p.tipo_venta === 'domicilio' ? '🛵 domicilio' : '🏪 mostrador'}
                    </p>
                    {p.notas && <p className="text-xs italic text-gray-400 mt-1">{p.notas}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold">{formatPrecio(p.total)}</p>
                    <button onClick={() => setModalAbono({ abierto: true, pedido: p })}
                      className="text-xs text-primary hover:underline mt-1 block">registrar abono</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
 
        {/* ABONOS */}
        {tab === 'abonos' && (
          <div className="space-y-3">
            <h2 className="font-semibold text-light-text dark:text-dark-text">mis abonos</h2>
            {misAbonos.length === 0 && (
              <div className="text-center py-12">
                <CreditCard size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm">sin abonos registrados</p>
              </div>
            )}
            {misAbonos.map(a => (
              <div key={a.id} className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-light-text dark:text-dark-text">
                      comprobante {a.numero_comprobante || `#${a.id}`}
                    </span>
                    <p className="text-xs text-gray-400">pedido #{a.pedido_id} · {a.metodo}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-primary font-bold">{formatPrecio(a.monto)}</p>
                    <span className={a.estado?.toLowerCase().includes('anula') ? 'badge-anulado' : 'badge-activo'}>
                      {a.estado || 'activo'}
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
                <p className="text-gray-400 text-sm">sin direcciones guardadas</p>
              </div>
            )}
            {direcciones.map(d => (
              <div key={d.id} className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4">
                <p className="text-sm font-medium text-light-text dark:text-dark-text">{d.direccion}</p>
                {d.barrio && <p className="text-xs text-gray-400 mt-0.5">Barrio: {d.barrio}</p>}
                {d.indicaciones && <p className="text-xs text-gray-400 italic mt-0.5">{d.indicaciones}</p>}
              </div>
            ))}
          </div>
        )}
 
        {/* PERFIL */}
        {tab === 'perfil' && (
          <div className="space-y-4">
            <h2 className="font-semibold text-light-text dark:text-dark-text">mi perfil</h2>
            {clienteData ? (
              <div className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold mx-auto">
                  {clienteData.nombre?.charAt(0).toUpperCase()}
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="campo-label">nombre</p>
                    <p className="font-medium">{clienteData.nombre} {clienteData.apellido}</p></div>
                  <div><p className="campo-label">correo</p><p>{clienteData.email || '-'}</p></div>
                  <div><p className="campo-label">telefono</p><p>{clienteData.telefono || '-'}</p></div>
                  <div><p className="campo-label">documento</p>
                    <p>{clienteData.tipo_documento}: {clienteData.numero_documento || '-'}</p></div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-8">cargando perfil...</p>
            )}
          </div>
        )}
      </div>
 
      {/* MODAL ABONO */}
      {modalAbono.abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-4">
            <h3 className="font-semibold text-light-text dark:text-dark-text">
              registrar abono — pedido #{modalAbono.pedido?.id}
            </h3>
            <div className="text-sm p-3 rounded-lg bg-light-bg dark:bg-dark-bg">
              <div className="flex justify-between">
                <span className="text-gray-400">total pedido</span>
                <span>{formatPrecio(modalAbono.pedido?.total)}</span>
              </div>
            </div>
            <div>
              <label className="campo-label">monto *</label>
              <input type="number" step="0.01" value={formAbono.monto}
                onChange={e => setFormAbono(p => ({ ...p, monto: e.target.value }))}
                className="campo-input" placeholder="0.00" />
            </div>
            <div>
              <label className="campo-label">metodo</label>
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
                cancelar
              </button>
              <button disabled={crearAbono.isPending || !formAbono.monto}
                onClick={() => crearAbono.mutate({ pedido_id: modalAbono.pedido.id, ...formAbono })}
                className="flex-1 py-2 text-sm btn-primary justify-center disabled:opacity-50">
                {crearAbono.isPending ? 'registrando...' : 'registrar abono'}
              </button>
            </div>
          </div>
        </div>
      )}
 
      {/* MODAL NUEVA DIRECCION */}
      {modalDir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-light-card dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-sm p-5 space-y-3">
            <h3 className="font-semibold text-light-text dark:text-dark-text">nueva direccion</h3>
            <div>
              <label className="campo-label">direccion *</label>
              <input value={formDir.direccion} onChange={e => setFormDir(p => ({ ...p, direccion: e.target.value }))}
                className="campo-input" placeholder="Ej: Calle 50 # 40-10" />
            </div>
            <div>
              <label className="campo-label">barrio</label>
              <input value={formDir.barrio} onChange={e => setFormDir(p => ({ ...p, barrio: e.target.value }))}
                className="campo-input" placeholder="Ej: Laureles" />
            </div>
            <div>
              <label className="campo-label">indicaciones</label>
              <input value={formDir.indicaciones} onChange={e => setFormDir(p => ({ ...p, indicaciones: e.target.value }))}
                className="campo-input" placeholder="Ej: piso 3, apto 301" />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setModalDir(false)}
                className="flex-1 py-2 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-xl">
                cancelar
              </button>
              <button disabled={crearDir.isPending || !formDir.direccion}
                onClick={() => crearDir.mutate(formDir)}
                className="flex-1 py-2 text-sm btn-primary justify-center disabled:opacity-50">
                {crearDir.isPending ? 'guardando...' : 'guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
