import { useState, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientesService } from '../services/clientesService'
import toast from 'react-hot-toast'
 
const formVacio = {
  nombre: '', apellido: '', email: '', telefono: '',
  tipo_documento: 'CC', numero_documento: '',
  permite_fiado: false, limite_fiado: '',
}
const validarCampo = (campo, valor) => {
  switch (campo) {
    case 'nombre':   return !valor.trim() ? 'El nombre es obligatorio' : ''
    case 'apellido': return !valor.trim() ? 'El apellido es obligatorio' : ''
    case 'email':
      if (!valor) return ''
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return 'Correo inválido'
      return ''
    case 'telefono':
      if (!valor) return ''
      if (!/^\d+$/.test(valor)) return 'Solo números'
      if (valor.length !== 10) return 'Debe tener 10 dígitos'
      return ''
    case 'numero_documento':
      if (!valor) return ''
      if (!/^\d+$/.test(valor)) return 'Solo números'
      if (valor.length < 5) return 'Mínimo 5 dígitos'
      return ''
    default: return ''
  }
}
 
export function useClientes() {
  const qc = useQueryClient()
  const [modal, setModal]               = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, item: null })
  const [form, setForm]                 = useState(formVacio)
  const [errores, setErrores]           = useState({})
  const [verificando, setVerificando]   = useState({})
  const [filtroEstado, setFiltroEstado] = useState('')
 
  const timerEmail = useRef(null)
  const timerDoc   = useRef(null)
 
  const { data: clientes = [] } = useQuery({ queryKey: ['clientes'], queryFn: clientesService.getAll })
  const { data: historial = [] } = useQuery({
    queryKey: ['historial-cliente', modalDetalle.item?.id],
    queryFn: () => clientesService.getPedidos(modalDetalle.item?.id),
    enabled: !!modalDetalle.item?.id,
  })
 
  // verificar email duplicado (local)
  const verificarEmail = useCallback((email, itemId) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return
    clearTimeout(timerEmail.current)
    setVerificando(v => ({ ...v, email: true }))
    timerEmail.current = setTimeout(() => {
      const existe = clientes.find(c => c.email?.toLowerCase() === email.toLowerCase() && c.id !== itemId)
      setVerificando(v => ({ ...v, email: false }))
      if (existe) setErrores(p => ({ ...p, email: 'Este correo ya está registrado' }))
    }, 400)
  }, [clientes])
 
  // verificar documento duplicado (local)
  const verificarDoc = useCallback((doc, itemId) => {
    if (!doc || doc.length < 5) return
    clearTimeout(timerDoc.current)
    setVerificando(v => ({ ...v, numero_documento: true }))
    timerDoc.current = setTimeout(() => {
      const existe = clientes.find(c => c.numero_documento === doc && c.id !== itemId)
      setVerificando(v => ({ ...v, numero_documento: false }))
      if (existe) setErrores(p => ({ ...p, numero_documento: 'Este documento ya está registrado' }))
    }, 400)
  }, [clientes])
 
  const guardar = useMutation({
    mutationFn: data => modal.item ? clientesService.update(modal.item.id, data) : clientesService.create(data),
    onSuccess: () => { qc.invalidateQueries(['clientes']); cerrarModal(); toast.success('Cliente guardado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error al guardar'),
  })
  const toggleEstado = useMutation({
    mutationFn: clientesService.toggleEstado,
    onSuccess: () => { qc.invalidateQueries(['clientes']); toast.success('Estado actualizado') },
  })
 
  const abrirModal = (item = null) => {
    setForm(item ? {
      nombre: item.nombre, apellido: item.apellido,
      email: item.email || '', telefono: item.telefono || '',
      tipo_documento: item.tipo_documento || 'CC',
      numero_documento: item.numero_documento || '',
      permite_fiado: item.permite_fiado || false,
      limite_fiado: item.limite_fiado || '',
    } : formVacio)
    setErrores({})
    setVerificando({})
    setModal({ abierto: true, item })
  }
  const cerrarModal = () => {
    setModal({ abierto: false, item: null })
    setErrores({})
    setVerificando({})
    clearTimeout(timerEmail.current)
    clearTimeout(timerDoc.current)
  }
 
  const handleChange = (campo, valor) => {
    if ((campo === 'telefono' || campo === 'numero_documento') && valor && !/^\d*$/.test(valor)) return
    const nuevo = { ...form, [campo]: valor }
    setForm(nuevo)
    const err = validarCampo(campo, valor)
    setErrores(prev => ({ ...prev, [campo]: err }))
    if (campo === 'email' && !err) verificarEmail(valor, modal.item?.id)
    if (campo === 'numero_documento' && !err) verificarDoc(valor, modal.item?.id)
  }
 
  const handleSubmit = e => {
    e.preventDefault()
    const campos = ['nombre', 'apellido', 'email', 'telefono', 'numero_documento']
    const nuevosErrores = {}
    campos.forEach(c => { nuevosErrores[c] = validarCampo(c, form[c]) })
    setErrores(nuevosErrores)
    if (Object.values(nuevosErrores).some(Boolean)) return
    if (Object.values(verificando).some(Boolean)) { toast.error('Espera, verificando datos...'); return }
    guardar.mutate(form)
  }
 
  const clientesFiltrados = clientes.filter(c => {
    if (filtroEstado === 'activo'   && !c.estado) return false
    if (filtroEstado === 'inactivo' &&  c.estado) return false
    return true
  })
 
  return {
    clientes: clientesFiltrados, historial,
    form, errores, verificando,
    modal, modalDetalle,
    filtroEstado, setFiltroEstado,
    setModalDetalle,
    abrirModal, cerrarModal, handleChange, handleSubmit,
    toggleEstado, guardando: guardar.isPending,
  }
}