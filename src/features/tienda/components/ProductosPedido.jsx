import { useState, useEffect } from 'react'
import { tiendaService } from '../services/tiendaService'
import { formatPrecio } from '@shared/utils/validaciones'

export default function ProductosPedido({ pedidoId }) {
  const [prods, setProds]     = useState([])
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