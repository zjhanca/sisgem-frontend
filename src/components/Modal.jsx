import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ abierto, onCerrar, titulo, children, ancho = 'max-w-lg' }) {
  useEffect(() => {
    if (abierto) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [abierto])

  if (!abierto) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'
      onClick={onCerrar}>
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' />
      <div className={`relative z-10 w-full ${ancho} bg-dark-card dark:bg-dark-card
        bg-light-card rounded-xl border border-dark-border shadow-2xl
        max-h-[90vh] overflow-y-auto`}
        onClick={e => e.stopPropagation()}>
        <div className='flex items-center justify-between p-4
          border-b border-dark-border'>
          <h3 className='font-medium text-dark-text dark:text-dark-text
            text-light-text'>{titulo}</h3>
          <button onClick={onCerrar}
            className='text-dark-text/50 hover:text-primary transition-colors'>
            <X size={18} />
          </button>
        </div>
        <div className='p-4'>{children}</div>
      </div>
    </div>
  )
}
