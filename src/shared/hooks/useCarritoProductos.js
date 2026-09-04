import { useState } from 'react'
import toast from 'react-hot-toast'

export function useCarritoProductos({ productos = [], getBarcode, getStock: getStockExterno }) {
  const [prodBusqueda, setProdBusqueda]     = useState('')
  const [prodsFiltrados, setProdsFiltrados] = useState([])

  const getStock = producto_id => {
    if (getStockExterno) return getStockExterno(producto_id)
    return productos.find(p => p.id === producto_id)?.stock ?? Infinity
  }

  const construirLinea = (prod, cantidad) => ({
    producto_id:     prod.id || prod.producto_id,
    cantidad,
    precio_unitario: parseFloat(prod.precio),
    nombre:          prod.nombre,
    stock:           prod.stock,
    codigo_barras:   prod.codigo_barras || '',
  })

  const buscarProducto = (texto, setCarrito) => {
    setProdBusqueda(texto)
    if (!texto) { setProdsFiltrados([]); return }
    const t = texto.toLowerCase()
    setProdsFiltrados(
      productos
        .filter(p => p.estado && p.stock > 0 && (
          p.nombre.toLowerCase().includes(t) ||
          (p.codigo_barras && p.codigo_barras.includes(t))
        ))
        .slice(0, 10)
    )
  }

  // Busca primero en lista local — solo va a API si no encuentra
  const buscarPorCodigo = async (cod, agregarFn, form, setForm) => {
    const local = productos.find(p =>
      p.codigo_barras === cod && p.estado && p.stock > 0
    )
    if (local) {
      agregarProducto(local, form, setForm)
      return
    }
    // Fallback API
    try {
      const { data } = await getBarcode(cod)
      if (data.ok) {
        agregarProducto(data.datos, form, setForm)
      } else {
        toast.error('Producto no encontrado')
      }
    } catch {
      toast.error('Producto no encontrado')
    }
  }

  const agregarProducto = (prod, form, setForm) => {
    const id             = prod.id || prod.producto_id
    const stock          = prod.stock ?? getStock(id)
    const existente      = form.productos.find(p => p.producto_id === id)
    const cantidadActual = existente ? (+existente.cantidad || 0) : 0
    const nuevaCantidad  = cantidadActual + 1

    if (nuevaCantidad > stock) {
      toast.error(`Stock insuficiente — solo hay ${stock} unidades`)
      return
    }

    setForm(f => {
      const idx = f.productos.findIndex(p => p.producto_id === id)
      if (idx === -1) return { ...f, productos: [...f.productos, construirLinea(prod, 1)] }
      const nuevos    = [...f.productos]
      nuevos[idx]     = { ...nuevos[idx], cantidad: nuevaCantidad }
      return { ...f, productos: nuevos }
    })
    setProdBusqueda('')
    setProdsFiltrados([])
  }

  const cambiarCantidad = (idx, nuevaCantidad, form, setForm) => {
    if (nuevaCantidad === '') {
      setForm(f => ({
        ...f,
        productos: f.productos.map((p, i) => i === idx ? { ...p, cantidad: '' } : p)
      }))
      return
    }
    const linea = form.productos[idx]
    if (!linea) return
    const stock = linea.stock ?? getStock(linea.producto_id)
    const num   = Math.max(1, +nuevaCantidad || 1)
    const cant  = Math.min(num, stock)
    if (+nuevaCantidad > stock) toast.error(`Stock insuficiente — máximo ${stock} unidades`)
    setForm(f => ({
      ...f,
      productos: f.productos.map((p, i) => i === idx ? { ...p, cantidad: cant } : p)
    }))
  }

  const quitarProducto = (idx, setForm) => {
    setForm(f => ({ ...f, productos: f.productos.filter((_, i) => i !== idx) }))
  }

  return {
    prodBusqueda, setProdBusqueda,
    prodsFiltrados, setProdsFiltrados,
    buscarProducto, buscarPorCodigo,
    agregarProducto, cambiarCantidad, quitarProducto,
    getStock,
  }
}