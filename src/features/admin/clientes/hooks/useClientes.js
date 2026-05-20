import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientesService } from '../services/clientesService'
import toast from 'react-hot-toast'
 
const formVacio = { nombre: '', apellido: '', email: '', telefono: '', tipo_documento: 'CC', numero_documento: '' }
const dirVacia  = { direccion: '', barrio: '', indicaciones: '' }
 
const validar = form => {
  const e = {}
  if (!form.nombre.trim())   e.nombre   = 'El nombre es obligatorio'
  if (!form.apellido.trim()) e.apellido = 'El apellido es obligatorio'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo inválido'
  return e
}
 
export function useClientes() {
  const qc = useQueryClient()
  const [modal, setModal]               = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, item: null })
  const [modalDir, setModalDir]         = useState({ abierto: false, cliente: null })
  const [form, setForm]       = useState(formVacio)
  const [formDir, setFormDir] = useState(dirVacia)
  const [errores, setErrores] = useState({})
 
  const { data: clientes = [] } = useQuery({ queryKey: ['clientes'], queryFn: clientesService.getAll })
  const { data: direcciones = [], refetch: refetchDir } = useQuery({
    queryKey: ['dirs-cliente', modalDir.cliente?.id],
    queryFn: () => clientesService.getDirecciones(modalDir.cliente?.id),
    enabled: !!modalDir.cliente?.id,
  })
  const { data: historial = [] } = useQuery({
    queryKey: ['historial-cliente', modalDetalle.item?.id],
    queryFn: () => clientesService.getPedidos(modalDetalle.item?.id),
    enabled: !!modalDetalle.item?.id,
  })
 
  const guardar = useMutation({
    mutationFn: data => modal.item ? clientesService.update(modal.item.id, data) : clientesService.create(data),
    onSuccess: () => { qc.invalidateQueries(['clientes']); cerrarModal(); toast.success('Cliente guardado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error al guardar'),
  })
  const guardarDir = useMutation({
    mutationFn: data => clientesService.addDireccion(modalDir.cliente.id, data),
    onSuccess: () => { refetchDir(); setFormDir(dirVacia); toast.success('Dirección guardada') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })
  const toggleEstado = useMutation({
    mutationFn: clientesService.toggleEstado,
    onSuccess: () => { qc.invalidateQueries(['clientes']); toast.success('Estado actualizado') },
  })
 
  const abrirModal = (item = null) => {
    setForm(item ? { nombre: item.nombre, apellido: item.apellido, email: item.email || '',
      telefono: item.telefono || '', tipo_documento: item.tipo_documento || 'CC',
      numero_documento: item.numero_documento || '' } : formVacio)
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
  const handleSubmitDir = e => {
    e.preventDefault()
    if (!formDir.direccion.trim()) { toast.error('La dirección es obligatoria'); return }
    guardarDir.mutate(formDir)
  }
 
  return {
    clientes, historial, direcciones,
    form, formDir, errores,
    modal, modalDetalle, modalDir,
    setModalDetalle, setModalDir, setFormDir,
    abrirModal, cerrarModal, handleChange, handleSubmit, handleSubmitDir,
    toggleEstado, guardando: guardar.isPending, guardandoDir: guardarDir.isPending,
  }
}
