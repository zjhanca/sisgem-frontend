import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { marcasService } from '../services/marcasService'
import toast from 'react-hot-toast'

const formVacio = { nombre: '', descripcion: '', logo: '', proveedor_id: '', sitio_web: '' }

// normalizar nombre para comparación (sin espacios, minúsculas)
const normalizar = str => str?.trim().toLowerCase().replace(/\s+/g, ' ') || ''

// asegurar que una URL tenga https://
export const normalizarUrl = url => {
  if (!url) return ''
  url = url.trim()
  if (!url) return ''
  if (!/^https?:\/\//i.test(url)) return `https://${url}`
  return url
}

// validar URL básica
const esUrlValida = url => {
  if (!url) return true // no es obligatoria
  try { new URL(normalizarUrl(url)); return true } catch { return false }
}

export function useMarcas() {
  const qc = useQueryClient()
  const [modal, setModal]                 = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle]   = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]       = useState(formVacio)
  const [errores, setErrores] = useState({})
  const [verificandoNombre, setVerificandoNombre] = useState(false)
  const timerNombre = useRef(null)

  const { data: marcas = [] }      = useQuery({ queryKey: ['marcas'],      queryFn: marcasService.getAll })
  const { data: proveedores = [] } = useQuery({ queryKey: ['proveedores'], queryFn: marcasService.getProveedores })

  // verificar nombre duplicado con debounce
  const verificarNombre = useCallback((nombre, itemId) => {
    const limpio = normalizar(nombre)
    if (!limpio) { setVerificandoNombre(false); return }
    clearTimeout(timerNombre.current)
    setVerificandoNombre(true)
    timerNombre.current = setTimeout(() => {
      const duplicado = marcas.find(m =>
        normalizar(m.nombre) === limpio && m.id !== itemId
      )
      setVerificandoNombre(false)
      setErrores(prev => ({
        ...prev,
        nombre: duplicado ? `Ya existe una marca con el nombre "${duplicado.nombre}"` : ''
      }))
    }, 400)
  }, [marcas])

  const validarForm = (f) => {
    const e = {}
    const nombre = f.nombre?.trim() || ''
    if (!nombre)          e.nombre = 'El nombre es obligatorio'
    else if (nombre.length < 2)  e.nombre = 'Mínimo 2 caracteres'
    else if (nombre.length > 80) e.nombre = 'Máximo 80 caracteres'
    if (f.sitio_web && !esUrlValida(f.sitio_web)) e.sitio_web = 'URL inválida'
    return e
  }

  const guardar = useMutation({
    mutationFn: data => {
      const payload = {
        ...data,
        nombre: data.nombre.trim(),
        sitio_web: normalizarUrl(data.sitio_web),
      }
      return modal.item
        ? marcasService.update(modal.item.id, payload)
        : marcasService.create(payload)
    },
    onSuccess: () => { qc.invalidateQueries(['marcas']); cerrarModal(); toast.success('Marca guardada') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error al guardar'),
  })
  const toggleEstado = useMutation({
    mutationFn: marcasService.toggleEstado,
    onSuccess: () => { qc.invalidateQueries(['marcas']); toast.success('Estado actualizado') },
  })
  const eliminar = useMutation({
    mutationFn: marcasService.delete,
    onSuccess: () => { qc.invalidateQueries(['marcas']); setModalEliminar({ abierto: false, item: null }); toast.success('Marca eliminada') },
    onError: err => toast.error(err.response?.data?.mensaje || 'No se puede eliminar'),
  })

  const abrirModal = (item = null) => {
    setForm(item ? {
      nombre:       item.nombre,
      descripcion:  item.descripcion || '',
      logo:         item.logo || '',
      proveedor_id: item.proveedor_id || '',
      sitio_web:    item.sitio_web || '',
    } : formVacio)
    setErrores({})
    setVerificandoNombre(false)
    setModal({ abierto: true, item })
  }
  const cerrarModal = () => {
    clearTimeout(timerNombre.current)
    setModal({ abierto: false, item: null })
    setErrores({})
    setVerificandoNombre(false)
  }

  const handleChange = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }))
    // validar en tiempo real
    const e = validarForm({ ...form, [campo]: valor })
    setErrores(prev => ({ ...prev, [campo]: e[campo] || '' }))
    if (campo === 'nombre') verificarNombre(valor, modal.item?.id)
  }

  const handleSubmit = e => {
    e.preventDefault()
    const e2 = validarForm(form)
    if (Object.keys(e2).some(k => e2[k])) { setErrores(e2); return }
    if (errores.nombre) return
    if (verificandoNombre) { toast.error('Espera, verificando nombre...'); return }
    guardar.mutate(form)
  }

  return {
    marcas, proveedores, form, errores,
    modal, modalDetalle, modalEliminar,
    setForm, setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal, handleSubmit, handleChange,
    toggleEstado, eliminar, verificandoNombre,
    guardando: guardar.isPending, eliminando: eliminar.isPending,
  }
}