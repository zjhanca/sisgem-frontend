import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { marcasService } from '../services/marcasService'
import toast from 'react-hot-toast'
 
const formVacio = { nombre: '', descripcion: '', logo: '', proveedor_id: '', sitio_web: '' }
 
export function useMarcas() {
  const qc = useQueryClient()
  const [modal, setModal]                 = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle]   = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]     = useState(formVacio)
  const [errores, setErrores] = useState({})
 
  const { data: marcas = [] }      = useQuery({ queryKey: ['marcas'],      queryFn: marcasService.getAll })
  const { data: proveedores = [] } = useQuery({ queryKey: ['proveedores'], queryFn: marcasService.getProveedores })
 
  const guardar = useMutation({
    mutationFn: data => modal.item ? marcasService.update(modal.item.id, data) : marcasService.create(data),
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
    setForm(item ? { nombre: item.nombre, descripcion: item.descripcion || '', logo: item.logo || '',
      proveedor_id: item.proveedor_id || '', sitio_web: item.sitio_web || '' } : formVacio)
    setErrores({})
    setModal({ abierto: true, item })
  }
  const cerrarModal = () => { setModal({ abierto: false, item: null }); setErrores({}) }
  const handleSubmit = e => {
    e.preventDefault()
    if (!form.nombre.trim()) { setErrores({ nombre: 'El nombre es obligatorio' }); return }
    guardar.mutate(form)
  }
 
  return {
    marcas, proveedores, form, errores,
    modal, modalDetalle, modalEliminar,
    setForm, setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal, handleSubmit,
    toggleEstado, eliminar,
    guardando: guardar.isPending, eliminando: eliminar.isPending,
  }
}
