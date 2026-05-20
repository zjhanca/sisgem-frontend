import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usuariosService } from '../services/usuariosService'
import toast from 'react-hot-toast'
 
const formVacio = { nombre: '', apellido: '', email: '', password: '', telefono: '', rol_id: '', tipo_documento: 'CC', numero_documento: '' }
 
const validar = (form, esEdicion) => {
  const e = {}
  if (!form.nombre.trim())   e.nombre   = 'El nombre es obligatorio'
  if (!form.apellido.trim()) e.apellido = 'El apellido es obligatorio'
  if (!form.email.trim())    e.email    = 'El correo es obligatorio'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo inválido'
  if (!esEdicion && !form.password)            e.password = 'La contraseña es obligatoria'
  if (!esEdicion && form.password?.length < 6) e.password = 'Mínimo 6 caracteres'
  if (!form.rol_id) e.rol_id = 'Selecciona un rol'
  return e
}
 
export function useUsuarios() {
  const qc = useQueryClient()
  const [modal, setModal]                 = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle]   = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]     = useState(formVacio)
  const [errores, setErrores] = useState({})
 
  const { data: usuarios = [] } = useQuery({ queryKey: ['usuarios'], queryFn: usuariosService.getAll })
  const { data: roles = [] }    = useQuery({ queryKey: ['roles'],    queryFn: usuariosService.getRoles })
 
  const guardar = useMutation({
    mutationFn: data => modal.item ? usuariosService.update(modal.item.id, data) : usuariosService.create(data),
    onSuccess: () => { qc.invalidateQueries(['usuarios']); cerrarModal(); toast.success('Usuario guardado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error al guardar'),
  })
  const toggleEstado = useMutation({
    mutationFn: usuariosService.toggleEstado,
    onSuccess: () => { qc.invalidateQueries(['usuarios']); toast.success('Estado actualizado') },
  })
  const eliminar = useMutation({
    mutationFn: usuariosService.delete,
    onSuccess: () => { qc.invalidateQueries(['usuarios']); setModalEliminar({ abierto: false, item: null }); toast.success('Usuario eliminado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'No se puede eliminar'),
  })
 
  const abrirModal = (item = null) => {
    setForm(item ? { nombre: item.nombre, apellido: item.apellido, email: item.email, password: '',
      telefono: item.telefono || '', rol_id: item.rol_id,
      tipo_documento: item.tipo_documento || 'CC', numero_documento: item.numero_documento || '' } : formVacio)
    setErrores({})
    setModal({ abierto: true, item })
  }
  const cerrarModal = () => { setModal({ abierto: false, item: null }); setErrores({}) }
  const handleChange = (campo, valor) => {
    const nuevo = { ...form, [campo]: valor }
    setForm(nuevo)
    const e = validar(nuevo, !!modal.item)
    setErrores(prev => ({ ...prev, [campo]: e[campo] || '' }))
  }
  const handleSubmit = e => {
    e.preventDefault()
    const e2 = validar(form, !!modal.item)
    if (Object.keys(e2).length) { setErrores(e2); return }
    const data = { ...form }
    if (modal.item && !data.password) delete data.password
    guardar.mutate(data)
  }
 
  return {
    usuarios, roles, form, errores,
    modal, modalDetalle, modalEliminar,
    setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal, handleChange, handleSubmit,
    toggleEstado, eliminar,
    guardando: guardar.isPending, eliminando: eliminar.isPending,
  }
}
