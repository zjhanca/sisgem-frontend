export function useFiadoCalculo({ clientes, form }) {
  const clienteSeleccionado = clientes.find(c => c.id === +form.cliente_id)

  const cupoFiadoDisponible = clienteSeleccionado?.cupo_fiado_disponible != null
    ? +clienteSeleccionado.cupo_fiado_disponible
    : null

  const totalVenta = form.productos.reduce((s, p) => s + p.precio_unitario * (+p.cantidad || 0), 0)

  const excedeCupoFiado = form.tipo_pago === 'fiado'
    && cupoFiadoDisponible != null
    && totalVenta > cupoFiadoDisponible

  const montoFiado     = excedeCupoFiado ? cupoFiadoDisponible : totalVenta
  const montoInmediato = excedeCupoFiado ? totalVenta - cupoFiadoDisponible : 0

  return { clienteSeleccionado, cupoFiadoDisponible, totalVenta, excedeCupoFiado, montoFiado, montoInmediato }
}