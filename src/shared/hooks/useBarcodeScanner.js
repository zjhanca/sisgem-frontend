import { useEffect, useRef } from 'react'

// Detecta escaneos de pistola por velocidad de escritura
// La pistola escribe muy rápido (< 50ms entre caracteres) y termina con Enter
export function useBarcodeScanner({ onScan, activo = true, soloNumeros = true }) {
  const buffer    = useRef('')
  const lastTime  = useRef(0)
  const timer     = useRef(null)

  useEffect(() => {
    if (!activo) return

    const handler = e => {
      // Ignorar si el foco está en un input o textarea normal
      const tag = document.activeElement?.tagName?.toLowerCase()
      if (tag === 'input' || tag === 'textarea') return

      const now  = Date.now()
      const diff = now - lastTime.current
      lastTime.current = now

      // Si pasaron más de 100ms entre teclas, reinicia el buffer
      if (diff > 100) buffer.current = ''

      if (e.key === 'Enter') {
        const codigo = buffer.current.trim()
        buffer.current = ''
        clearTimeout(timer.current)
        if (codigo.length >= 4) {
          onScan(codigo)
        }
        return
      }

      // Solo acepta números si soloNumeros=true
      if (soloNumeros && !/^\d$/.test(e.key)) return
      if (!soloNumeros && e.key.length !== 1) return

      buffer.current += e.key

      // Limpiar buffer si no llega Enter en 500ms
      clearTimeout(timer.current)
      timer.current = setTimeout(() => { buffer.current = '' }, 500)
    }

    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      clearTimeout(timer.current)
    }
  }, [activo, onScan, soloNumeros])
}