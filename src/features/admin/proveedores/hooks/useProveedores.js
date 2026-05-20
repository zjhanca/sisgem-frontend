import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { proveedoresService } from '../services/proveedoresService'
import toast from 'react-hot-toast'
 
const formVacio = { tipo_persona: 'juridica', tipo_documento: 'NIT', documento: '', nombre: '', contacto: '', telefono: '', email: '', direccion: '' }
 
const validar = form => {
  const e = {}
  if (!form.nombre.trim())    e.nombre    = 'El nombre es obligatorio'
  if (!form.documento.trim()) e.documento = 'El documento es obligatorio'
  return e
}
 
export function useProveedores() {
  const qc = useQueryClient()
  const [modal, setModal]                 = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle]   = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]     = useState(formVacio)
  const [errores, setErrores] = useState({})
 
  const { data: proveedores = [] } = useQuery({ queryKey: ['proveedores'], queryFn: proveedoresService.getAll })
 
  const guardar = useMutation({
    mutationFn: data => modal.item ? proveedoresService.update(modal.item.id, data) : proveedoresService.create(data),
    onSuccess: () => { qc.invalidateQueries(['proveedores']); cerrarModal(); toast.success('Proveedor guardado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error al guardar'),
  })
  const toggleEstado = useMutation({
    mutationFn: proveedoresService.toggleEstado,
    onSuccess: () => { qc.invalidateQueries(['proveedores']); toast.success('Estado actualizado') },
  })
  const eliminar = useMutation({
    mutationFn: proveedoresService.delete,
    onSuccess: () => { qc.invalidateQueries(['proveedores']); setModalEliminar({ abierto: false, item: null }); toast.success('Proveedor eliminado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'No se puede eliminar'),
  })
 
  const abrirModal = (item = null) => {
    setForm(item ? { ...item } : formVacio)
    setErrores({})
    setModal({ abierto: true, item })
  }
  const cerrarModal = () => { setModal({ abierto: false, item: null }); setErrores({}) }
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
    proveedores, form, errores,
    modal, modalDetalle, modalEliminar,
    setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal, handleChange, handleSubmit,
    toggleEstado, eliminar,
    guardando: guardar.isPending, eliminando: eliminar.isPending,
  }
}
 
