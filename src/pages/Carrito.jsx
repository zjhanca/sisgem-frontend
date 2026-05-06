import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Trash2, Plus, Minus, ShoppingCart, ArrowLeft, Bike, Store } from 'lucide-react'
import { formatPrecio } from '../utils/validaciones'
 
export default function Carrito({ carrito, setCarrito }) {
  const { usuario } = useAuth()
  const navigate    = useNavigate()
  const [tipoVenta, setTipoVenta] = useState('mostrador')
  const [notas, setNotas]         = useState('')
  const [enviando, setEnviando]   = useState(false)
 
  const cambiarCantidad = (id, delta) => {
    setCarrito(prev => prev.map(p => p.id === id
      ? { ...p, cantidad: Math.max(1, p.cantidad + delta) } : p
    ))
  }
 
  const quitar = id => setCarrito(prev => prev.filter(p => p.id !== id))
 
  const total = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0)
 
  const handlePedido = async () => {
    if (!usuario) {
      toast.error('debes iniciar sesion para hacer un pedido')
      navigate('/login')
      return
    }
    if (!carrito.length) { toast.error('el carrito esta vacio'); return }
    setEnviando(true)
    try {
      const { data } = await api.post('/pedidos', {
        tipo_venta: tipoVenta,
        notas: notas || null,
        productos: carrito.map(p => ({
          producto_id: p.id,
          cantidad: p.cantidad,
          precio_unitario: p.precio
        }))
      })
      if (data.ok) {
        setCarrito([])
        toast.success(`pedido #${data.pedido_id} creado correctamente`)
        navigate('/perfil')
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'error al crear el pedido')
    } finally { setEnviando(false) }
  }
 
  if (carrito.length === 0) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center px-4">
        <ShoppingCart size={60} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-semibold text-light-text dark:text-dark-text mb-2">tu carrito esta vacio</h2>
        <p className="text-gray-400 text-sm mb-6">agrega productos para continuar</p>
        <Link to="/productos" className="btn-primary">ver productos</Link>
      </div>
    )
  }
 
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* header */}
        <div className="flex items-center gap-3 mb-6">
          <Link to="/productos" className="p-2 rounded-xl border border-gray-200 dark:border-dark-border hover:border-primary/40 transition-colors">
            <ArrowLeft size={16} className="text-gray-500" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-light-text dark:text-dark-text">mi carrito</h1>
            <p className="text-xs text-gray-400">{carrito.length} productos</p>
          </div>
        </div>
 
        {/* tipo de venta */}
        <div className="mb-4">
          <label className="campo-label mb-2 block">tipo de entrega</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { val: 'mostrador', label: 'Mostrador', icon: Store, desc: 'recoger en tienda' },
              { val: 'domicilio', label: 'Domicilio', icon: Bike,  desc: 'entrega a casa' }
            ].map(op => (
              <button key={op.val} type="button" onClick={() => setTipoVenta(op.val)}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                  tipoVenta === op.val
                    ? op.val === 'domicilio'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-primary bg-primary/10'
                    : 'border-gray-200 dark:border-dark-border'
                }`}>
                <op.icon size={18} className={tipoVenta === op.val
                  ? op.val === 'domicilio' ? 'text-blue-500' : 'text-primary'
                  : 'text-gray-400'} />
                <div>
                  <p className={`text-sm font-medium ${tipoVenta === op.val
                    ? op.val === 'domicilio' ? 'text-blue-500' : 'text-primary'
                    : 'text-light-text dark:text-dark-text'}`}>{op.label}</p>
                  <p className="text-xs text-gray-400">{op.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
 
        {/* productos */}
        <div className="space-y-2 mb-4">
          {carrito.map(p => (
            <div key={p.id}
              className="flex items-center gap-3 p-3 bg-light-card dark:bg-dark-card rounded-xl
                border border-gray-100 dark:border-dark-border">
              {p.imagen_url ? (
                <img src={p.imagen_url} alt={p.nombre}
                  className="w-14 h-14 object-cover rounded-lg shrink-0"
                  onError={e => e.target.style.display='none'} />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-xl shrink-0">🛒</div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-light-text dark:text-dark-text truncate">{p.nombre}</p>
                <p className="text-primary font-bold">{formatPrecio(p.precio)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1">
                  <button onClick={() => cambiarCantidad(p.id, -1)}
                    className="w-7 h-7 rounded-lg border border-gray-200 dark:border-dark-border flex items-center justify-center
                      hover:border-primary/40 transition-colors">
                    <Minus size={11} className="text-gray-500" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium text-light-text dark:text-dark-text">
                    {p.cantidad}
                  </span>
                  <button onClick={() => cambiarCantidad(p.id, 1)}
                    className="w-7 h-7 rounded-lg border border-gray-200 dark:border-dark-border flex items-center justify-center
                      hover:border-primary/40 transition-colors">
                    <Plus size={11} className="text-gray-500" />
                  </button>
                </div>
                <span className="text-sm font-semibold text-primary w-16 text-right">
                  {formatPrecio(p.precio * p.cantidad)}
                </span>
                <button onClick={() => quitar(p.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors">
                  <Trash2 size={14} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
 
        {/* notas */}
        <div className="mb-4">
          <label className="campo-label">notas / observaciones (opcional)</label>
          <textarea value={notas} onChange={e => setNotas(e.target.value)}
            rows={2} className="campo-input resize-none"
            placeholder="instrucciones especiales para tu pedido..." />
        </div>
 
        {/* resumen */}
        <div className="bg-light-card dark:bg-dark-card rounded-xl border border-gray-100 dark:border-dark-border p-4 mb-4">
          <div className="flex justify-between text-sm text-gray-500 dark:text-dark-text/60 mb-1">
            <span>subtotal ({carrito.reduce((s, p) => s + p.cantidad, 0)} items)</span>
            <span>{formatPrecio(total)}</span>
          </div>
          {tipoVenta === 'domicilio' && (
            <div className="flex justify-between text-sm text-gray-500 dark:text-dark-text/60 mb-1">
              <span>domicilio</span>
              <span className="text-xs text-gray-400">se calcula al confirmar</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base border-t border-gray-200 dark:border-dark-border pt-2 mt-2">
            <span className="text-light-text dark:text-dark-text">total</span>
            <span className="text-primary">{formatPrecio(total)}</span>
          </div>
        </div>
 
        {/* boton pedido */}
        {!usuario ? (
          <div className="space-y-2">
            <p className="text-xs text-center text-gray-400">debes iniciar sesion para confirmar tu pedido</p>
            <Link to="/login" className="btn-primary w-full justify-center py-3">iniciar sesion</Link>
            <Link to="/register" className="w-full py-3 text-sm text-center border border-primary/40 text-primary rounded-xl hover:bg-primary/5 transition-colors block">
              crear cuenta nueva
            </Link>
          </div>
        ) : (
          <button onClick={handlePedido} disabled={enviando}
            className="btn-primary w-full justify-center py-3 text-sm disabled:opacity-50">
            {enviando ? 'enviando pedido...' : `confirmar pedido · ${formatPrecio(total)}`}
          </button>
        )}
      </div>
    </div>
  )
}
 
 
