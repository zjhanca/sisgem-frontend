export default function PantallaCarga({ mensaje = 'Cargando...' }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-white/90 backdrop-blur-sm">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-2xl bg-primary/15 animate-ping" />
        <div className="relative w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center overflow-hidden">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain"
            onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex' }} />
          <span style={{display:'none'}} className="text-lg font-bold text-primary">S</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
      </div>
      <p className="text-sm text-gray-500 font-medium">{mensaje}</p>
    </div>
  )
}