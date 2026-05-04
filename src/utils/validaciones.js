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
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

export function formatFechaHora(fecha) {
  if (!fecha) return '-'
  return new Date(fecha).toLocaleString('es-CO', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}