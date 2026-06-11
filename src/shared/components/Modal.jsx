import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ abierto, onCerrar, titulo, children, ancho = 'max-w-lg', bloquearCierre = false }) {
  useEffect(() => {
    if (abierto) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [abierto])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={bloquearCierre ? undefined : onCerrar}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      <div
        className={`relative z-10 w-full ${ancho} animate-slideIn
          bg-white rounded-2xl border border-gray-200
          shadow-xl max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-light-text tracking-tight">{titulo}</h3>
          {onCerrar && (
            <button onClick={onCerrar}
              className="p-1 rounded-md text-gray-400 hover:text-primary hover:bg-primary/8 transition-all duration-150">
              <X size={15} />
            </button>
          )}
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}