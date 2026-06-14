import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { proveedoresService } from '../services/proveedoresService'
import toast from 'react-hot-toast'

const formVacio = {
  tipo_persona: 'juridica', tipo_documento: 'NIT',
  documento: '', nombre: '', contacto: '',
  telefono: '', email: '', direccion: ''
}

const validarCampo = (campo, valor) => {
  switch (campo) {
    case 'nombre':
      if (!valor.trim()) return 'La razón social es obligatoria'
      if (valor.trim().length < 2) return 'Mínimo 2 caracteres'
      return ''
    case 'documento':
      if (!valor.trim()) return 'El documento es obligatorio'
      if (valor.trim().length < 4) return 'Mínimo 4 caracteres'
      return ''
    case 'email':
      if (!valor) return ''
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return 'Correo inválido'
      return ''
    case 'telefono':
      if (!valor) return ''
      if (!/^\d+$/.test(valor)) return 'Solo números'
      if (valor.length !== 10) return 'Debe tener 10 dígitos'
      return ''
    default: return ''
  }
}

export function useProveedores() {
  const qc = useQueryClient()
  const [modal, setModal]                 = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle]   = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]       = useState(formVacio)
  const [errores, setErrores] = useState({})
  const [verificando, setVerificando] = useState({})
  const timerDoc   = useRef(null)
  const timerEmail = useRef(null)

  const { data: proveedores = [] } = useQuery({ queryKey: ['proveedores'], queryFn: proveedoresService.getAll })

  const verificarDoc = useCallback((doc, itemId) => {
    if (!doc || doc.trim().length < 4) { setVerificando(v => ({ ...v, documento: false })); return }
    clearTimeout(timerDoc.current)
    setVerificando(v => ({ ...v, documento: true }))
    timerDoc.current = setTimeout(() => {
      const duplicado = proveedores.find(p =>
        p.documento?.trim() === doc.trim() && p.id !== itemId
      )
      setVerificando(v => ({ ...v, documento: false }))
      if (duplicado) setErrores(prev => ({ ...prev, documento: `Este documento ya está registrado (${duplicado.nombre})` }))
    }, 400)
  }, [proveedores])

  const verificarEmail = useCallback((email, itemId) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setVerificando(v => ({ ...v, email: false })); return }
    clearTimeout(timerEmail.current)
    setVerificando(v => ({ ...v, email: true }))
    timerEmail.current = setTimeout(() => {
      const duplicado = proveedores.find(p =>
        p.email?.toLowerCase() === email.toLowerCase() && p.id !== itemId
      )
      setVerificando(v => ({ ...v, email: false }))
      if (duplicado) setErrores(prev => ({ ...prev, email: `Este correo ya está registrado (${duplicado.nombre})` }))
    }, 400)
  }, [proveedores])

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
    setVerificando({})
    setModal({ abierto: true, item })
  }
  const cerrarModal = () => {
    clearTimeout(timerDoc.current)
    clearTimeout(timerEmail.current)
    setModal({ abierto: false, item: null })
    setErrores({})
    setVerificando({})
  }

  const handleChange = (campo, valor) => {
    if (campo === 'telefono' && valor && !/^\d*$/.test(valor)) return
    const nuevo = { ...form, [campo]: valor }
    setForm(nuevo)
    const err = validarCampo(campo, valor)
    setErrores(prev => ({ ...prev, [campo]: err }))
    if (campo === 'documento' && !err) verificarDoc(valor, modal.item?.id)
    if (campo === 'email'     && !err) verificarEmail(valor, modal.item?.id)
  }

  const handleSubmit = e => {
    e.preventDefault()
    const campos = ['nombre', 'documento', 'email', 'telefono']
    const nuevosErrores = {}
    campos.forEach(c => { nuevosErrores[c] = validarCampo(c, form[c]) })
    setErrores(nuevosErrores)
    if (Object.values(nuevosErrores).some(Boolean)) return
    if (errores.documento || errores.email) return
    if (Object.values(verificando).some(Boolean)) { toast.error('Espera, verificando datos...'); return }
    guardar.mutate(form)
  }

  return {
    proveedores, form, errores, verificando,
    modal, modalDetalle, modalEliminar,
    setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal, handleChange, handleSubmit,
    toggleEstado, eliminar,
    guardando: guardar.isPending, eliminando: eliminar.isPending,
  }
}