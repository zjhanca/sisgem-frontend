import { useState, useCallback, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientesService } from '../services/clientesService'
import { descargarPDF, descargarExcel } from '@shared/utils/reportes'
import toast from 'react-hot-toast'

const formVacio = {
  nombre: '', apellido: '', email: '', telefono: '',
  tipo_documento: 'CC', numero_documento: '',
  permite_fiado: false, limite_fiado: '',
}

const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]*$/

const validarCampo = (campo, valor) => {
  switch (campo) {
    case 'nombre':
      if (!valor.trim()) return 'El nombre es obligatorio'
      if (!SOLO_LETRAS.test(valor)) return 'Solo se permiten letras'
      return ''
    case 'apellido':
      if (!valor.trim()) return 'El apellido es obligatorio'
      if (!SOLO_LETRAS.test(valor)) return 'Solo se permiten letras'
      return ''
    case 'email':
      if (!valor) return ''
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return 'Correo inválido'
      return ''
    case 'telefono':
      if (!valor) return ''
      if (!/^\d+$/.test(valor)) return 'Solo números'
      if (valor.length < 7 || valor.length > 10) return 'El teléfono debe tener entre 7 y 10 dígitos'
      return ''
    case 'numero_documento':
      if (!valor) return ''
      if (!/^\d+$/.test(valor)) return 'Solo números'
      if (valor.length < 7 || valor.length > 10) return 'El documento debe tener entre 7 y 10 dígitos'
      return ''
    default: return ''
  }
}

export function useClientes() {
  const qc = useQueryClient()
  const [modal, setModal]               = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]                   = useState(formVacio)
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

  const verificarDoc = useCallback((doc, itemId) => {
    if (!doc || doc.length < 7) return
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

  const eliminar = useMutation({
    mutationFn: id => clientesService.delete(id),
    onSuccess: () => { qc.invalidateQueries(['clientes']); setModalEliminar({ abierto: false, item: null }); toast.success('Cliente eliminado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'No se puede eliminar'),
  })

  const toggleEstado = useMutation({
    mutationFn: clientesService.toggleEstado,
    onSuccess: () => { qc.invalidateQueries(['clientes']); toast.success('Estado actualizado') },
  })

  const abrirModal = (item = null) => {
    setForm(item ? {
      nombre:           item.nombre,
      apellido:         item.apellido,
      email:            item.email            || '',
      telefono:         item.telefono         || '',
      tipo_documento:   item.tipo_documento   || 'CC',
      numero_documento: item.numero_documento || '',
      permite_fiado:    item.permite_fiado    || false,
      limite_fiado:     item.limite_fiado     || '',
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
    // Máximo 10 dígitos en teléfono y documento
    if ((campo === 'telefono' || campo === 'numero_documento') && valor.length > 10) return
    if ((campo === 'nombre' || campo === 'apellido') && valor && !SOLO_LETRAS.test(valor)) return
    const nuevo = { ...form, [campo]: valor }
    setForm(nuevo)
    const err = validarCampo(campo, valor)
    setErrores(prev => ({ ...prev, [campo]: err }))
    if (campo === 'email'            && !err) verificarEmail(valor, modal.item?.id)
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

  const descargarReporte = async ({ formato = 'pdf' } = {}) => {
    const ext = formato === 'excel' ? 'xlsx' : 'pdf'
    const url = `/reportes/clientes?formato=${formato}`
    const nombreArchivo = `reporte-clientes.${ext}`
    if (formato === 'excel') await descargarExcel(url, nombreArchivo)
    else await descargarPDF(url, nombreArchivo)
  }

  return {
    clientes: clientesFiltrados, historial,
    form, errores, verificando,
    modal, modalDetalle,
    filtroEstado, setFiltroEstado,
    setModalDetalle,
    abrirModal, cerrarModal, handleChange, handleSubmit,
    toggleEstado, eliminar, eliminando: eliminar.isPending,
    modalEliminar, setModalEliminar,
    guardando: guardar.isPending, descargarReporte,
  }
}