export default function PromotionalBanners() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div
        className="rounded-2xl p-6 text-white flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, #1D6B2B, #2D8F50)' }}
      >
        <div className="text-4xl shrink-0">🏪</div>
        <div>
          <h3 className="font-bold text-base">Compra en Mostrador</h3>
          <p className="text-sm opacity-90 mt-0.5">Visítanos y lleva lo que necesitas</p>
        </div>
      </div>
 
      <div
        className="rounded-2xl p-6 text-white flex items-center gap-4"
        style={{ background: 'linear-gradient(135deg, #1A4A7A, #2E6EBF)' }}
      >
        <div className="text-4xl shrink-0">🛵</div>
        <div>
          <h3 className="font-bold text-base">Domicilios en Medellín</h3>
          <p className="text-sm opacity-90 mt-0.5">Pedidos rápidos y seguros a tu puerta</p>
        </div>
      </div>
    </section>
  )
}
