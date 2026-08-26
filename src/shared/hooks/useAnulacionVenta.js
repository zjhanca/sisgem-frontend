export function useAnulacionVenta() {
  const getFechaLimiteAnulacion = venta => {
    if (!venta) return null
    if (venta.fecha_limite_anulacion) return new Date(venta.fecha_limite_anulacion)
    if (!venta.fecha_pedido) return null
    const f = new Date(venta.fecha_pedido)
    f.setHours(f.getHours() + 72)
    return f
  }

  const puedeAnular = venta => {
    const limite = getFechaLimiteAnulacion(venta)
    if (!limite) return true
    return new Date() <= limite
  }

  const horasRestantesAnulacion = venta => {
    const limite = getFechaLimiteAnulacion(venta)
    if (!limite) return null
    return Math.max(0, Math.ceil((limite - new Date()) / (1000 * 60 * 60)))
  }

  return { getFechaLimiteAnulacion, puedeAnular, horasRestantesAnulacion }
}