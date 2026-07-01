import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productosService } from '../services/productosService'
import toast from 'react-hot-toast'

const formVacio = {
  nombre: '', descripcion: '', precio: 0, stock: 0,
  categoria_id: '', proveedor_id: '', marca_id: '',
  codigo_barras: '', imagen_url: '',
  imagenes: [],
}

const validar = form => {
  const e = {}
  if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio'
  return e
}

export function useProductos() {
  const qc = useQueryClient()
  const [modal, setModal]                 = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle]   = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]       = useState(formVacio)
  const [errores, setErrores]             = useState({})
  const [verificandoCodigo, setVerificandoCodigo] = useState(false)
  const timerCodigo = useRef(null)

  const { data: productos = [] }   = useQuery({ queryKey: ['productos'],   queryFn: productosService.getAll })
  const { data: categorias = [] }  = useQuery({ queryKey: ['categorias'],  queryFn: productosService.getCategorias })
  const { data: proveedores = [] } = useQuery({ queryKey: ['proveedores'], queryFn: productosService.getProveedores })
  const { data: marcas = [] }      = useQuery({ queryKey: ['marcas'],      queryFn: productosService.getMarcas })

  // verificar código de barras duplicado (contra lista local)
  const verificarCodigo = useCallback((codigo, itemId) => {
    if (!codigo || codigo.length < 3) {
      setErrores(prev => ({ ...prev, codigo_barras: '' }))
      setVerificandoCodigo(false)
      return
    }
    clearTimeout(timerCodigo.current)
    setVerificandoCodigo(true)
    timerCodigo.current = setTimeout(() => {
      const duplicado = productos.find(p =>
        p.codigo_barras === codigo && p.id !== itemId
      )
      setVerificandoCodigo(false)
      setErrores(prev => ({
        ...prev,
        codigo_barras: duplicado ? `Este código ya está asignado a "${duplicado.nombre}"` : ''
      }))
    }, 400)
  }, [productos])

  const guardar = useMutation({
    mutationFn: data => {
      // enviar imagen_url como la primera del array (compatibilidad backend)
      const payload = {
        ...data,
        imagen_url: data.imagenes?.[0] || data.imagen_url || '',
        // si el backend acepta array de imágenes, se envía también
        imagenes: data.imagenes || [],
      }
      return modal.item
        ? productosService.update(modal.item.id, payload)
        : productosService.create(payload)
    },
    onSuccess: () => { qc.invalidateQueries(['productos']); cerrarModal(); toast.success('Producto guardado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error al guardar'),
  })
  const toggleEstado = useMutation({
    mutationFn: productosService.toggleEstado,
    onSuccess: () => { qc.invalidateQueries(['productos']); toast.success('Estado actualizado') },
  })
  const eliminar = useMutation({
    mutationFn: productosService.delete,
    onSuccess: () => { qc.invalidateQueries(['productos']); setModalEliminar({ abierto: false, item: null }); toast.success('Producto eliminado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'No se puede eliminar'),
  })

  const abrirModal = (item = null) => {
    if (item) {
      // reconstruir array de imágenes desde el item
      // soporta: item.imagenes (array), item.imagenes (string JSON desde la BD), item.imagen_url (string)
      let imgsRaw = item.imagenes
      if (typeof imgsRaw === 'string') {
        try { imgsRaw = JSON.parse(imgsRaw) } catch { imgsRaw = [] }
      }
      let imagenes = []
      if (Array.isArray(imgsRaw) && imgsRaw.length > 0) {
        imagenes = imgsRaw.filter(Boolean)
      } else if (item.imagen_url) {
        imagenes = [item.imagen_url]
      }
      setForm({
        nombre:       item.nombre,
        descripcion:  item.descripcion || '',
        precio:       item.precio,
        stock:        item.stock,
        categoria_id: item.categoria_id || '',
        proveedor_id: item.proveedor_id || '',
        marca_id:     item.marca_id || '',
        codigo_barras:item.codigo_barras || '',
        imagen_url:   item.imagen_url || '',
        imagenes,
      })
    } else {
      setForm(formVacio)
    }
    setErrores({})
    setModal({ abierto: true, item })
  }
  const cerrarModal = () => { setModal({ abierto: false, item: null }); setErrores({}) }

  const handleChange = (campo, valor) => {
    const nuevo = { ...form, [campo]: valor }
    setForm(nuevo)
    const e = validar(nuevo)
    setErrores(prev => ({ ...prev, [campo]: e[campo] || '' }))
    if (campo === 'codigo_barras') verificarCodigo(valor, modal.item?.id)
  }
  const handleSubmit = e => {
    e.preventDefault()
    const e2 = validar(form)
    if (Object.keys(e2).length) { setErrores(e2); return }
    if (errores.codigo_barras) return
    if (verificandoCodigo) { return }
    guardar.mutate(form)
  }

  const exportarCSV = () => {
    const encabezados = ['ID', 'Nombre', 'Código Barras', 'Categoría', 'Marca', 'Precio', 'Stock', 'Estado']
    const filas = productos.map(p => [
      p.id,
      `"${(p.nombre || '').replace(/"/g, '""')}"`,
      p.codigo_barras || '',
      `"${(p.categoria || '').replace(/"/g, '""')}"`,
      `"${(p.marca || '').replace(/"/g, '""')}"`,
      p.precio || 0,
      p.stock || 0,
      p.estado ? 'Activo' : 'Inactivo',
    ])
    const csv = [encabezados.join(','), ...filas.map(f => f.join(','))].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `productos-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    productos, categorias, proveedores, marcas,
    form, errores, modal, modalDetalle, modalEliminar,
    setForm, setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal, handleChange, handleSubmit,
    toggleEstado, eliminar,
    guardando: guardar.isPending, eliminando: eliminar.isPending,
    verificandoCodigo, exportarCSV,
  }
}