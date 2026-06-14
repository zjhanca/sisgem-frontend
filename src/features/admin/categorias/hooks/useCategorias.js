import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoriasService } from '../services/categoriasService'
import toast from 'react-hot-toast'

const formVacio = { nombre: '', descripcion: '', margen: '', icono: '' }

const validar = form => {
  const e = {}
  if (!form.nombre.trim())                  e.nombre = 'El nombre es obligatorio'
  else if (form.nombre.trim().length < 2)   e.nombre = 'Mínimo 2 caracteres'
  else if (form.nombre.trim().length > 100) e.nombre = 'Máximo 100 caracteres'
  if (form.margen === '' || form.margen === null || form.margen === undefined || isNaN(+form.margen))
    e.margen = 'El margen es obligatorio'
  else if (+form.margen < 0) e.margen = 'El margen no puede ser negativo'
  return e
}

export function useCategorias() {
  const qc = useQueryClient()

  const [modal, setModal]                 = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle]   = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]                   = useState(formVacio)
  const [errores, setErrores]             = useState({})

  const { data: categorias = [], isLoading } = useQuery({
    queryKey: ['categorias'],
    queryFn:  categoriasService.getAll,
  })

  const guardar = useMutation({
    mutationFn: data => modal.item
      ? categoriasService.update(modal.item.id, data)
      : categoriasService.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['categorias'])
      cerrarModal()
      toast.success('Categoría guardada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error al guardar'),
  })

  const actualizarMargen = useMutation({
    mutationFn: ({ id, margen }) => categoriasService.updateMargen(id, margen),
    onSuccess: () => { qc.invalidateQueries(['categorias']); toast.success('Margen actualizado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })

  const toggleEstado = useMutation({
    mutationFn: categoriasService.toggleEstado,
    onSuccess:  () => { qc.invalidateQueries(['categorias']); toast.success('Estado actualizado') },
    onError:    err => toast.error(err.response?.data?.mensaje || 'Error'),
  })

  const eliminar = useMutation({
    mutationFn: categoriasService.delete,
    onSuccess: () => {
      qc.invalidateQueries(['categorias'])
      setModalEliminar({ abierto: false, item: null })
      toast.success('Categoría eliminada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'No se puede eliminar'),
  })

  const abrirModal = (item = null) => {
    setForm(item
      ? { nombre: item.nombre, descripcion: item.descripcion || '', margen: item.margen ?? '', icono: item.icono || '' }
      : formVacio)
    setErrores({})
    setModal({ abierto: true, item })
  }

  const cerrarModal = () => {
    setModal({ abierto: false, item: null })
    setErrores({})
  }

  const handleChange = (campo, valor) => {
    const nuevo = { ...form, [campo]: valor }
    setForm(nuevo)
    const e = validar(nuevo)
    setErrores(prev => ({ ...prev, [campo]: e[campo] || '' }))
  }

  const handleSubmit = e => {
    e.preventDefault()
    const e2 = validar(form)
    if (Object.keys(e2).length) { setErrores(e2); return }
    guardar.mutate(form)
  }

  return {
    categorias, isLoading,
    form, errores, handleChange, handleSubmit,
    modal, modalDetalle, modalEliminar,
    setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal,
    toggleEstado, eliminar, actualizarMargen,
    guardando:  guardar.isPending,
    eliminando: eliminar.isPending,
  }
}