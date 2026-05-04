import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  Trash2, Plus, Minus, ArrowLeft,
  ShoppingCart, MapPin, CreditCard, CheckCircle
} from 'lucide-react'
import { formatPrecio } from '../utils/validaciones'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

function useCarrito() {
  const [carrito, setCarrito] = useState(() =>
    JSON.parse(localStorage.getItem('sisgem_carrito') || '[]')
  )
  const guardar = items => {
    setCarrito(items)
    localStorage.setItem('sisgem_carrito', JSON.stringify(items))
  }
  const cambiarCantidad = (id, delta) => {
    guardar(carrito.map(p =>
      p.id === id ? { ...p, cantidad: Math.max(1, p.cantidad + delta) } : p
    ))
  }
  const quitar    = id  => guardar(carrito.filter(p => p.id !== id))
  const vaciar    = ()  => guardar([])
  const subtotal  = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0)
  return { carrito, cambiarCantidad, quitar, vaciar, subtotal }
}

export default function Carrito() {
  const { carrito, cambiarCantidad, quitar, vaciar, subtotal } = useCarrito()
  const { usuario } = useAuth()
  const navigate    = useNavigate()

  const [paso, setPaso]             = useState(1) // 1=carrito 2=envio 3=pago 4=confirmado
  const [tipoEntrega, setTipoEntrega] = useState('mostrador')
  const [clienteId, setClienteId]   = useState('')
  const [direccionId, setDireccionId] = useState('')
  const [tarifaId, setTarifaId]     = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [pedidoCreado, setPedidoCreado] = useState(null)

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes-checkout'],
    queryFn: () => api.get('/clientes').then(r => r.data.datos.filter(c => c.estado)),
    enabled: paso === 2
  })
  const { data: direcciones = [] } = useQuery({
    queryKey: ['dirs-checkout', clienteId],
    queryFn: () => api.get(`/clientes/${clienteId}/direcciones`).then(r => r.data.datos),
    enabled: !!clienteId && tipoEntrega === 'domicilio'
  })
  const { data: tarifas = [] } = useQuery({
    queryKey: ['tarifas-checkout'],
    queryFn: () => api.get('/domicilios/tarifas').then(r => r.data.datos),
    enabled: tipoEntrega === 'domicilio' && paso === 2
  })

  const crearPedido = useMutation({
    mutationFn: data => api.post('/pedidos', data),
    onSuccess: res => {
      setPedidoCreado(res.data.pedido_id)
      vaciar()
      setPaso(4)
      toast.success('pedido confirmado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error al crear pedido')
  })

  const tarifa     = tarifas.find(t => t.id === +tarifaId)
  const costoEnvio = tipoEntrega === 'domicilio' && tarifa ? parseFloat(tarifa.tarifa) : 0
  const total      = subtotal + costoEnvio

  const handleCheckout = () => {
    if (!clienteId) { toast.error('selecciona un cliente'); return }
    if (tipoEntrega === 'domicilio' && !direccionId) {
      toast.error('selecciona una direccion de envio'); return
    }
    const data = {
      cliente_id: +clienteId,
      tipo_venta: tipoEntrega,
      productos: carrito.map(p => ({
        producto_id:    p.producto_id || p.id,
        cantidad:       p.cantidad,
        precio_unitario: parseFloat(p.precio)
      })),
    }
    if (tipoEntrega === 'domicilio' && direccionId) {
      data.domicilio = {
        direccion_id:   +direccionId,
        tarifa_id:      tarifaId ? +tarifaId : null,
        tarifa_aplicada: costoEnvio
      }
    }
    crearPedido.mutate(data)
  }

  // paso 4: confirmado
  if (paso === 4) return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg px-4">
      <div className="w-full max-w-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
          <CheckCircle size={32} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold text-light-text dark:text-dark-text">
          pedido confirmado
        </h1>
        <p className="text-sm text-gray-400 dark:text-dark-text/50">
          tu pedido <span className="text-primary font-medium">#{pedidoCreado}</span> fue
          registrado exitosamente.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-outline">
            seguir comprando
          </Link>
          {usuario && (
            <Link to="/admin/pedidos" className="btn-primary">
              ver pedidos
            </Link>
          )}
        </div>
      </div>
    </div>
  )

  // carrito vacio
  if (!carrito.length && paso === 1) return (
    <div className="min-h-screen flex flex-col items-center justify-center
      bg-light-bg dark:bg-dark-bg px-4">
      <ShoppingCart size={48} className="text-gray-300 dark:text-dark-text/20 mb-4" />
      <p className="text-gray-400 dark:text-dark-text/50 text-sm mb-4">
        tu carrito esta vacio
      </p>
      <Link to="/" className="btn-primary">ver catalogo</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => paso > 1 ? setPaso(paso - 1) : navigate('/')}
            className="btn-ghost">
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-lg font-medium text-light-text dark:text-dark-text">
            {paso === 1 ? 'carrito' : paso === 2 ? 'datos de envio' : 'confirmar pedido'}
          </h1>
        </div>

        {/* indicador de pasos */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { n: 1, label: 'carrito' },
            { n: 2, label: 'envio' },
            { n: 3, label: 'confirmar' }
          ].map((s, i) => (<>
            <div key={s.n} className="flex items-center gap-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                transition-colors ${paso >= s.n
                  ? 'bg-primary text-dark-bg'
                  : 'bg-gray-200 dark:bg-dark-border text-gray-400 dark:text-dark-text/40'
                }`}>
                {s.n}
              </div>
              <span className={`text-xs hidden sm:block ${paso >= s.n
                ? 'text-light-text dark:text-dark-text'
                : 'text-gray-400 dark:text-dark-text/40'}`}>
                {s.label}
              </span>
            </div>
            {i < 2 && (
              <div className={`flex-1 h-px ${paso > s.n
                ? 'bg-primary' : 'bg-gray-200 dark:bg-dark-border'}`} />
            )}
          </>))}
        </div>

        {/* paso 1: carrito */}
        {paso === 1 && (
          <>
            <div className="space-y-2 mb-4">
              {carrito.map(item => (
                <div key={item.id} className="card flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-light-text dark:text-dark-text truncate">
                      {item.nombre}
                    </p>
                    <p className="text-xs text-primary">{formatPrecio(item.precio)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => cambiarCantidad(item.id, -1)} className="btn-ghost p-1">
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium
                      text-light-text dark:text-dark-text">
                      {item.cantidad}
                    </span>
                    <button onClick={() => cambiarCantidad(item.id, 1)} className="btn-ghost p-1">
                      <Plus size={12} />
                    </button>
                  </div>
                  <span className="text-sm font-medium text-light-text dark:text-dark-text
                    w-20 text-right shrink-0">
                    {formatPrecio(item.precio * item.cantidad)}
                  </span>
                  <button onClick={() => quitar(item.id)}
                    className="btn-ghost text-red-400 hover:text-red-300 shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <div className="card space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400 dark:text-dark-text/50">
                  {carrito.reduce((s, p) => s + p.cantidad, 0)} productos
                </span>
                <span className="text-light-text dark:text-dark-text font-medium">
                  {formatPrecio(subtotal)}
                </span>
              </div>
              <button onClick={() => setPaso(2)}
                className="btn-primary w-full justify-center py-2">
                continuar
              </button>
              <button onClick={() => { vaciar(); toast.success('carrito vaciado') }}
                className="w-full text-xs text-red-400 hover:text-red-300 transition-colors py-1">
                vaciar carrito
              </button>
            </div>
          </>
        )}

        {/* paso 2: datos de envio */}
        {paso === 2 && (
          <div className="space-y-4">
            <div className="card space-y-3">
              <p className="text-sm font-medium text-light-text dark:text-dark-text">
                tipo de entrega
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: 'mostrador', label: 'recoger en tienda', icon: ShoppingCart },
                  { val: 'domicilio', label: 'domicilio',         icon: MapPin }
                ].map(op => (
                  <button key={op.val} type="button"
                    onClick={() => setTipoEntrega(op.val)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm
                      transition-colors ${tipoEntrega === op.val
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-text/60'
                      }`}>
                    <op.icon size={14} />
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="card space-y-3">
              <p className="text-sm font-medium text-light-text dark:text-dark-text">
                datos del cliente
              </p>
              <div>
                <label className="campo-label">cliente *</label>
                <select value={clienteId}
                  onChange={e => { setClienteId(e.target.value); setDireccionId('') }}
                  className="campo-input">
                  <option value="">seleccionar cliente...</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre} {c.apellido}</option>
                  ))}
                </select>
              </div>

              {tipoEntrega === 'domicilio' && clienteId && (
                <>
                  <div>
                    <label className="campo-label">direccion de envio *</label>
                    <select value={direccionId}
                      onChange={e => setDireccionId(e.target.value)}
                      className="campo-input">
                      <option value="">seleccionar direccion...</option>
                      {direcciones.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.direccion} {d.ciudad ? `- ${d.ciudad}` : ''}
                        </option>
                      ))}
                    </select>
                    {direcciones.length === 0 && (
                      <p className="campo-error">este cliente no tiene direcciones registradas</p>
                    )}
                  </div>
                  <div>
                    <label className="campo-label">tarifa de domicilio</label>
                    <select value={tarifaId}
                      onChange={e => setTarifaId(e.target.value)}
                      className="campo-input">
                      <option value="">seleccionar tarifa...</option>
                      {tarifas.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.ciudad} - {formatPrecio(t.tarifa)}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <button onClick={() => {
              if (!clienteId) { toast.error('selecciona un cliente'); return }
              if (tipoEntrega === 'domicilio' && !direccionId) {
                toast.error('selecciona una direccion'); return
              }
              setPaso(3)
            }} className="btn-primary w-full justify-center py-2">
              continuar
            </button>
          </div>
        )}

        {/* paso 3: confirmar */}
        {paso === 3 && (
          <div className="space-y-4">
            <div className="card space-y-2">
              <p className="text-sm font-medium text-light-text dark:text-dark-text mb-3">
                resumen del pedido
              </p>
              {carrito.map(item => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-gray-500 dark:text-dark-text/60">
                    {item.nombre} x{item.cantidad}
                  </span>
                  <span className="text-light-text dark:text-dark-text">
                    {formatPrecio(item.precio * item.cantidad)}
                  </span>
                </div>
              ))}
              {costoEnvio > 0 && (
                <div className="flex justify-between text-xs pt-1
                  border-t border-gray-200 dark:border-dark-border">
                  <span className="text-gray-500 dark:text-dark-text/60">domicilio</span>
                  <span className="text-light-text dark:text-dark-text">
                    {formatPrecio(costoEnvio)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-medium pt-2
                border-t border-gray-200 dark:border-dark-border">
                <span className="text-light-text dark:text-dark-text">total</span>
                <span className="text-primary text-lg">{formatPrecio(total)}</span>
              </div>
            </div>

            <div className="card space-y-3">
              <p className="text-sm font-medium text-light-text dark:text-dark-text">
                metodo de pago
              </p>
              <div className="grid grid-cols-2 gap-2">
                {['efectivo', 'transferencia', 'tarjeta', 'nequi', 'daviplata'].map(m => (
                  <button key={m} type="button"
                    onClick={() => setMetodoPago(m)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs
                      transition-colors ${metodoPago === m
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-text/60'
                      }`}>
                    <CreditCard size={12} />
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleCheckout}
              disabled={crearPedido.isPending}
              className="btn-primary w-full justify-center py-2.5 text-base">
              {crearPedido.isPending ? 'procesando...' : `confirmar pedido - ${formatPrecio(total)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}