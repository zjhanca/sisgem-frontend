export const validar = {
  requerido: val =>
    val && val.toString().trim() !== '' ? null : 'este campo es obligatorio',

  email: val =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? null : 'correo invalido',

  telefono: val =>
    /^\d{7,15}$/.test((val || '').replace(/\s/g, '')) ? null : 'telefono invalido',

  precio: val =>
    !isNaN(val) && parseFloat(val) > 0 ? null : 'precio invalido',

  stock: val =>
    Number.isInteger(+val) && +val >= 0 ? null : 'stock invalido',

  minLength: min => val =>
    val && val.length >= min ? null : `minimo ${min} caracteres`,
}

export function validarForm(form, reglas) {
  const errores = {}
  for (const campo in reglas) {
    for (const regla of reglas[campo]) {
      const error = regla(form[campo])
      if (error) { errores[campo] = error; break }
    }
  }
  return errores
}

export function formatPrecio(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency', currency: 'COP', minimumFractionDigits: 0
  }).format(valor)
}

export function formatFecha(fecha) {
  if (!fecha) return '-'
  const d = new Date(fecha)
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const anio = d.getFullYear()
  return `${dia}/${mes}/${anio}`
}

export function formatFechaHora(fecha) {
  if (!fecha) return '-'
  const d = new Date(fecha)
  const dia = String(d.getDate()).padStart(2, '0')
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const anio = d.getFullYear()
  const hora = d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  return `${dia}/${mes}/${anio}, ${hora}`
}