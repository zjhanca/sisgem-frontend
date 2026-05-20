import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@shared/contexts/AuthContext'
import { tiendaService } from '../services/tiendaService'
import toast from 'react-hot-toast'
 
export function useCarrito({ carrito, setCarrito }) {
  const { usuario }               = useAuth()
  const navigate                  = useNavigate()
  const [tipoVenta, setTipoVenta] = useState('mostrador')
  const [notas, setNotas]         = useState('')
  const [enviando, setEnviando]   = useState(false)
 
  const cambiarCantidad = (id, delta) => {
    setCarrito(prev => prev.map(p =>
      p.id === id ? { ...p, cantidad: Math.max(1, p.cantidad + delta) } : p
    ))
  }
  const quitar = id => setCarrito(prev => prev.filter(p => p.id !== id))
 
  const total = carrito.reduce((s, p) => s + p.precio * p.cantidad, 0)
 
  const handlePedido = async () => {
    if (!usuario) {
      toast.error('Debes iniciar sesión para hacer un pedido')
      navigate('/login')
      return
    }
    if (!carrito.length) { toast.error('El carrito está vacío'); return }
    setEnviando(true)
    try {
      const { data } = await tiendaService.crearPedido({
        tipo_venta: tipoVenta,
        notas:      notas || null,
        productos:  carrito.map(p => ({
          producto_id:     p.id,
          cantidad:        p.cantidad,
          precio_unitario: p.precio,
        })),
      })
      if (data.ok) {
        setCarrito([])
        toast.success(`Pedido #${data.pedido_id} creado correctamente`)
        navigate('/perfil')
      }
    } catch (err) {
      toast.error(err.response?.data?.mensaje || 'Error al crear el pedido')
    } finally { setEnviando(false) }
  }
 
  return { usuario, tipoVenta, setTipoVenta, notas, setNotas, enviando, total, cambiarCantidad, quitar, handlePedido }
}
