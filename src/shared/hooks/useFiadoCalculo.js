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

  // Monto personalizado a crédito — aplica tanto si excede como si no
  const montoFiadoPersonalizado = form.monto_fiado_personalizado != null
    ? parseFloat(form.monto_fiado_personalizado) || 0
    : null

  let montoFiado, montoInmediato

  if (form.tipo_pago !== 'fiado') {
    montoFiado     = 0
    montoInmediato = 0
  } else if (montoFiadoPersonalizado !== null) {
    // Cliente eligió cuánto va a crédito — aplica siempre
    montoFiado     = Math.min(montoFiadoPersonalizado, cupoFiadoDisponible ?? totalVenta, totalVenta)
    montoInmediato = Math.max(0, totalVenta - montoFiado)
  } else if (excedeCupoFiado) {
    // Excede cupo y no ha personalizado — default: todo el cupo a crédito
    montoFiado     = cupoFiadoDisponible
    montoInmediato = totalVenta - cupoFiadoDisponible
  } else {
    // Todo a crédito
    montoFiado     = totalVenta
    montoInmediato = 0
  }

  return {
    clienteSeleccionado, cupoFiadoDisponible, totalVenta,
    excedeCupoFiado, montoFiado, montoInmediato,
  }
}