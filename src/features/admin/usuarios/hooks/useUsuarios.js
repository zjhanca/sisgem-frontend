import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usuariosService } from '../services/usuariosService'
import toast from 'react-hot-toast'
 
const formVacio = { nombre: '', apellido: '', email: '', password: '', telefono: '', rol_id: '', tipo_documento: 'CC', numero_documento: '' }
 
const validarCampo = (campo, valor, form, esEdicion) => {
  switch (campo) {
    case 'nombre':   return !valor.trim() ? 'El nombre es obligatorio' : ''
    case 'apellido': return !valor.trim() ? 'El apellido es obligatorio' : ''
    case 'email':
      if (!valor.trim()) return 'El correo es obligatorio'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return 'Correo inválido'
      return ''
    case 'password':
      if (esEdicion && !valor) return '' // en edición se puede dejar vacío
      if (!valor) return 'La contraseña es obligatoria'
      if (valor.length < 6) return 'Mínimo 6 caracteres'
      return ''
    case 'telefono':
      if (!valor) return ''
      if (!/^\d+$/.test(valor)) return 'Solo números'
      if (valor.length !== 10) return 'Debe tener 10 dígitos'
      return ''
    case 'numero_documento':
      if (!valor) return ''
      if (!/^\d+$/.test(valor)) return 'Solo números'
      return ''
    case 'rol_id': return !valor ? 'Selecciona un rol' : ''
    default: return ''
  }
}
 
export function useUsuarios() {
  const qc = useQueryClient()
  const [modal, setModal]                 = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle]   = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]       = useState(formVacio)
  const [errores, setErrores] = useState({})
  const [filtroRol, setFiltroRol]       = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
 
  const { data: usuarios = [] } = useQuery({ queryKey: ['usuarios'], queryFn: usuariosService.getAll })
  const { data: roles = [] }    = useQuery({ queryKey: ['roles'],    queryFn: usuariosService.getRoles })
 
  const usuariosFiltrados = usuarios.filter(u => {
    if (filtroRol    && u.rol_id !== +filtroRol)              return false
    if (filtroEstado === 'activo'   && !u.estado)             return false
    if (filtroEstado === 'inactivo' &&  u.estado)             return false
    return true
  })
 
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
    // bloquear letras en teléfono y documento
    if ((campo === 'telefono' || campo === 'numero_documento') && valor && !/^\d*$/.test(valor)) return
    const nuevo = { ...form, [campo]: valor }
    setForm(nuevo)
    const err = validarCampo(campo, valor, nuevo, !!modal.item)
    setErrores(prev => ({ ...prev, [campo]: err }))
  }
 
  const handleSubmit = e => {
    e.preventDefault()
    const campos = ['nombre', 'apellido', 'email', 'password', 'telefono', 'numero_documento', 'rol_id']
    const nuevosErrores = {}
    campos.forEach(c => { nuevosErrores[c] = validarCampo(c, form[c], form, !!modal.item) })
    setErrores(nuevosErrores)
    if (Object.values(nuevosErrores).some(Boolean)) return
    const data = { ...form }
    if (modal.item && !data.password) delete data.password
    guardar.mutate(data)
  }
 
  return {
    usuarios: usuariosFiltrados, usuariosTodos: usuarios, roles, form, errores,
    modal, modalDetalle, modalEliminar,
    setModalDetalle, setModalEliminar,
    filtroRol, setFiltroRol, filtroEstado, setFiltroEstado,
    abrirModal, cerrarModal, handleChange, handleSubmit,
    toggleEstado, eliminar,
    guardando: guardar.isPending, eliminando: eliminar.isPending,
  }
}
 
 
