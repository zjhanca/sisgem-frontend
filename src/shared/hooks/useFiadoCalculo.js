export function useFiadoCalculo({ clientes, form }) {
  const clienteSeleccionado = clientes.find(c => c.id === +form.cliente_id)

  const cupoFiadoDisponible = clienteSeleccionado?.cupo_fiado_disponible != null
    ? +clienteSeleccionado.cupo_fiado_disponible
    : null

  const totalVenta = form.productos.reduce(
    (s, p) => s + p.precio_unitario * (+p.cantidad || 0), 0)

  const excedeCupoFiado = form.tipo_pago === 'fiado'
    && cupoFiadoDisponible != null
    && totalVenta > cupoFiadoDisponible

  // Si el cliente definió un monto personalizado a crédito
  const montoFiadoPersonalizado = form.monto_fiado_personalizado
    ? parseFloat(form.monto_fiado_personalizado) || 0
    : null

  let montoFiado, montoInmediato

  if (excedeCupoFiado) {
    // Excede cupo — automático
    montoFiado     = cupoFiadoDisponible
    montoInmediato = totalVenta - cupoFiadoDisponible
  } else if (
    form.tipo_pago === 'fiado' &&
    montoFiadoPersonalizado !== null &&
    montoFiadoPersonalizado < totalVenta
  ) {
    // Cliente eligió poner solo una parte a crédito
    montoFiado     = Math.min(montoFiadoPersonalizado, cupoFiadoDisponible ?? totalVenta)
    montoInmediato = totalVenta - montoFiado
  } else {
    montoFiado     = form.tipo_pago === 'fiado' ? totalVenta : 0
    montoInmediato = 0
  }

  return {
    clienteSeleccionado, cupoFiadoDisponible, totalVenta,
    excedeCupoFiado, montoFiado, montoInmediato,
  }
}