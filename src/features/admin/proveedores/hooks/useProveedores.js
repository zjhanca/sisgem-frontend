import { useState, useRef, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { proveedoresService } from '../services/proveedoresService'
import { descargarPDF, descargarExcel } from '@shared/utils/reportes'
import toast from 'react-hot-toast'

const formVacio = {
  tipo_persona: 'juridica', tipo_documento: 'NIT',
  documento: '', nombre: '', contacto: '',
  telefono: '', email: '', direccion: ''
}

const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s]*$/

const validarDocumento = (valor, tipoDocumento) => {
  if (!valor.trim()) return 'El documento es obligatorio'
  if (!/^\d+$/.test(valor)) return 'Solo se permiten números'
  if (tipoDocumento === 'NIT') {
    if (valor.length !== 10) return 'El NIT debe tener exactamente 10 dígitos'
  } else if (tipoDocumento === 'CC') {
    if (valor.length < 7 || valor.length > 10) return 'La CC debe tener entre 7 y 10 dígitos'
  } else if (tipoDocumento === 'CE') {
    if (valor.length < 6 || valor.length > 7) return 'La CE debe tener entre 6 y 7 dígitos'
  }
  return ''
}

const validarCampo = (campo, valor, tipoPersona, tipoDocumento, proveedores, itemId) => {
  switch (campo) {
    case 'nombre':
      if (!valor.trim()) return tipoPersona === 'natural'
        ? 'El nombre completo es obligatorio'
        : 'La razón social es obligatoria'
      if (valor.trim().length < 2) return 'Mínimo 2 caracteres'
      if (tipoPersona === 'natural' && !SOLO_LETRAS.test(valor)) return 'Solo se permiten letras'
      if (proveedores) {
        const dup = proveedores.find(p =>
          p.nombre?.trim().toLowerCase() === valor.trim().toLowerCase() && p.id !== itemId
        )
        if (dup) return 'Ya existe un proveedor con ese nombre'
      }
      return ''
    case 'documento':
      return validarDocumento(valor, tipoDocumento)
    case 'contacto':
      if (!valor.trim()) return 'El contacto es obligatorio'
      if (valor.trim().length < 2) return 'Mínimo 2 caracteres'
      return ''
    case 'telefono':
      if (!valor.trim()) return 'El teléfono es obligatorio'
      if (!/^\d+$/.test(valor)) return 'Solo números'
      if (valor.length < 7 || valor.length > 10) return 'El teléfono debe tener entre 7 y 10 dígitos'
      return ''
    case 'email':
      if (!valor.trim()) return 'El correo es obligatorio'
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) return 'Correo inválido'
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
  const timerDoc    = useRef(null)
  const timerEmail  = useRef(null)
  const timerNombre = useRef(null)

  const { data: proveedores = [] } = useQuery({ queryKey: ['proveedores'], queryFn: proveedoresService.getAll })

  const verificarDoc = useCallback((doc, tipoDocumento, itemId) => {
    clearTimeout(timerDoc.current)
    setVerificando(v => ({ ...v, documento: true }))
    timerDoc.current = setTimeout(() => {
      const duplicado = proveedores.find(p =>
        p.documento?.trim() === doc.trim() && p.id !== itemId
      )
      setVerificando(v => ({ ...v, documento: false }))
      if (duplicado) setErrores(prev => ({
        ...prev, documento: `Este documento ya está registrado (${duplicado.nombre})`
      }))
    }, 400)
  }, [proveedores])

  const verificarEmail = useCallback((email, itemId) => {
    clearTimeout(timerEmail.current)
    setVerificando(v => ({ ...v, email: true }))
    timerEmail.current = setTimeout(() => {
      const duplicado = proveedores.find(p =>
        p.email?.toLowerCase() === email.toLowerCase() && p.id !== itemId
      )
      setVerificando(v => ({ ...v, email: false }))
      if (duplicado) setErrores(prev => ({
        ...prev, email: `Este correo ya está registrado (${duplicado.nombre})`
      }))
    }, 400)
  }, [proveedores])

  const verificarNombre = useCallback((nombre, tipoPersona, tipoDocumento, itemId) => {
    if (!nombre || nombre.trim().length < 2) return
    clearTimeout(timerNombre.current)
    setVerificando(v => ({ ...v, nombre: true }))
    timerNombre.current = setTimeout(() => {
      const err = validarCampo('nombre', nombre, tipoPersona, tipoDocumento, proveedores, itemId)
      setVerificando(v => ({ ...v, nombre: false }))
      setErrores(prev => ({ ...prev, nombre: err }))
    }, 300)
  }, [proveedores])

  const guardar = useMutation({
    mutationFn: data => modal.item
      ? proveedoresService.update(modal.item.id, data)
      : proveedoresService.create(data),
    onSuccess: () => { qc.invalidateQueries(['proveedores']); cerrarModal(); toast.success('Proveedor guardado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error al guardar'),
  })

  const toggleEstado = useMutation({
    mutationFn: proveedoresService.toggleEstado,
    onSuccess: () => { qc.invalidateQueries(['proveedores']); toast.success('Estado actualizado') },
  })

  const eliminar = useMutation({
    mutationFn: proveedoresService.delete,
    onSuccess: () => {
      qc.invalidateQueries(['proveedores'])
      setModalEliminar({ abierto: false, item: null })
      toast.success('Proveedor eliminado')
    },
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
    clearTimeout(timerNombre.current)
    setModal({ abierto: false, item: null })
    setErrores({})
    setVerificando({})
  }

  const handleChange = (campo, valor) => {
    // Solo números en teléfono y documento
    if ((campo === 'telefono' || campo === 'documento') && valor && !/^\d*$/.test(valor)) return
    // Máximo según tipo documento
    if (campo === 'documento') {
      const max = form.tipo_documento === 'NIT' ? 10
        : form.tipo_documento === 'CE' ? 7 : 10
      if (valor.length > max) return
    }
    if (campo === 'telefono' && valor.length > 10) return
    if (campo === 'contacto' && valor && !SOLO_LETRAS.test(valor)) return
    if (campo === 'nombre' && valor && form.tipo_persona === 'natural' && !SOLO_LETRAS.test(valor)) return

    const nuevo = { ...form, [campo]: valor }

    if (campo === 'tipo_persona') {
      nuevo.tipo_documento = valor === 'juridica' ? 'NIT' : 'CC'
      nuevo.nombre   = ''
      nuevo.contacto = ''
      nuevo.telefono = ''
      nuevo.email    = ''
      nuevo.documento = ''
      setErrores(prev => ({ ...prev, nombre: '', contacto: '', telefono: '', email: '', documento: '' }))
      setVerificando({})
      clearTimeout(timerDoc.current)
      clearTimeout(timerEmail.current)
      clearTimeout(timerNombre.current)
    }

    if (campo === 'tipo_documento') {
      nuevo.documento = ''
      setErrores(prev => ({ ...prev, documento: '' }))
    }

    setForm(nuevo)
    const err = validarCampo(campo, valor, nuevo.tipo_persona, nuevo.tipo_documento, proveedores, modal.item?.id)
    setErrores(prev => ({ ...prev, [campo]: err }))

    if (campo === 'documento' && !err) verificarDoc(valor, nuevo.tipo_documento, modal.item?.id)
    if (campo === 'email'     && !err) verificarEmail(valor, modal.item?.id)
    if (campo === 'nombre'    && !err) verificarNombre(valor, nuevo.tipo_persona, nuevo.tipo_documento, modal.item?.id)
  }

  const handleSubmit = e => {
    e.preventDefault()
    const campos = ['nombre', 'documento', 'contacto', 'telefono', 'email']
    const nuevosErrores = {}
    campos.forEach(c => {
      nuevosErrores[c] = validarCampo(c, form[c], form.tipo_persona, form.tipo_documento, proveedores, modal.item?.id)
    })
    setErrores(nuevosErrores)
    if (Object.values(nuevosErrores).some(Boolean)) return
    if (errores.documento || errores.email || errores.nombre) return
    if (Object.values(verificando).some(Boolean)) { toast.error('Espera, verificando datos...'); return }
    guardar.mutate(form)
  }

  const descargarReporte = async ({ formato = 'pdf' } = {}) => {
    const ext = formato === 'excel' ? 'xlsx' : 'pdf'
    const url = `/reportes/proveedores?formato=${formato}`
    const nombreArchivo = `reporte-proveedores.${ext}`
    if (formato === 'excel') await descargarExcel(url, nombreArchivo)
    else await descargarPDF(url, nombreArchivo)
  }

  return {
    proveedores, form, errores, verificando,
    modal, modalDetalle, modalEliminar,
    setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal, handleChange, handleSubmit,
    toggleEstado, eliminar,
    guardando:  guardar.isPending,
    eliminando: eliminar.isPending,
    descargarReporte,
  }
}