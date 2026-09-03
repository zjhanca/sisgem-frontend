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

const validarCampo = (campo, valor, tipoPersona, tipoDocumento) => {
  switch (campo) {
    case 'nombre':
      if (!valor.trim()) return tipoPersona === 'natural'
        ? 'El nombre completo es obligatorio'
        : 'La razón social es obligatoria'
      if (valor.trim().length < 2) return 'Mínimo 2 caracteres'
      if (tipoPersona === 'natural' && !SOLO_LETRAS.test(valor)) return 'Solo se permiten letras'
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
  const timerDoc      = useRef(null)
  const timerEmail    = useRef(null)
  const timerNombre   = useRef(null)
  const timerTelefono = useRef(null)

  const { data: proveedores = [] } = useQuery({
    queryKey: ['proveedores'],
    queryFn:  proveedoresService.getAll,
  })

  const verificarDoc = useCallback((doc, tipoDocumento, itemId) => {
    clearTimeout(timerDoc.current)
    setVerificando(v => ({ ...v, documento: true }))
    timerDoc.current = setTimeout(() => {
      const duplicado = proveedores.find(p =>
        p.documento?.trim() === doc.trim() && p.id !== itemId
      )
      setVerificando(v => ({ ...v, documento: false }))
      setErrores(prev => ({
        ...prev,
        documento: duplicado ? `Este documento ya está registrado (${duplicado.nombre})` : (prev.documento?.includes('registrado') ? '' : prev.documento)
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
      setErrores(prev => ({
        ...prev,
        email: duplicado ? `Este correo ya está registrado (${duplicado.nombre})` : (prev.email?.includes('registrado') ? '' : prev.email)
      }))
    }, 400)
  }, [proveedores])

  const verificarTelefono = useCallback((telefono, itemId) => {
    clearTimeout(timerTelefono.current)
    setVerificando(v => ({ ...v, telefono: true }))
    timerTelefono.current = setTimeout(() => {
      const duplicado = proveedores.find(p =>
        p.telefono === telefono && p.id !== itemId
      )
      setVerificando(v => ({ ...v, telefono: false }))
      setErrores(prev => ({
        ...prev,
        telefono: duplicado ? `Este teléfono ya está registrado (${duplicado.nombre})` : (prev.telefono?.includes('registrado') ? '' : prev.telefono)
      }))
    }, 400)
  }, [proveedores])

  const verificarNombre = useCallback((nombre, tipoPersona, tipoDocumento, itemId) => {
    if (!nombre || nombre.trim().length < 2) return
    clearTimeout(timerNombre.current)
    setVerificando(v => ({ ...v, nombre: true }))
    timerNombre.current = setTimeout(() => {
      const duplicado = proveedores.find(p =>
        p.nombre?.trim().toLowerCase() === nombre.trim().toLowerCase() && p.id !== itemId
      )
      setVerificando(v => ({ ...v, nombre: false }))
      setErrores(prev => ({
        ...prev,
        nombre: duplicado ? 'Ya existe un proveedor con ese nombre' : (prev.nombre?.includes('existe') ? '' : prev.nombre)
      }))
    }, 300)
  }, [proveedores])

  const guardar = useMutation({
    mutationFn: data => modal.item
      ? proveedoresService.update(modal.item.id, data)
      : proveedoresService.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['proveedores'])
      cerrarModal()
      toast.success('Proveedor guardado')
    },
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
    clearTimeout(timerTelefono.current)
    setModal({ abierto: false, item: null })
    setErrores({})
    setVerificando({})
  }

  const handleChange = (campo, valor) => {
    if ((campo === 'telefono' || campo === 'documento') && valor && !/^\d*$/.test(valor)) return
    if (campo === 'documento') {
      const max = form.tipo_documento === 'NIT' ? 10
        : form.tipo_documento === 'CE' ? 7 : 10
      if (valor.length > max) return
    }
    if (campo === 'telefono' && valor.length > 10) return
    if (campo === 'contacto' && valor && !SOLO_LETRAS.test(valor)) return
    if (campo === 'nombre' && valor && form.tipo_persona === 'natural' && !SOLO_LETRAS.test(valor)) return

    const nuevo = { ...form, [campo]: valor }

    // Al cambiar tipo_persona: solo cambia tipo_documento y limpia documento
    // NO borra nombre, contacto, telefono, email
    if (campo === 'tipo_persona') {
      nuevo.tipo_documento = valor === 'juridica' ? 'NIT' : 'CC'
      nuevo.documento = ''
      setErrores(prev => ({ ...prev, documento: '' }))
      clearTimeout(timerDoc.current)
      setVerificando(v => ({ ...v, documento: false }))
    }

    // Al cambiar tipo_documento: limpia solo el documento
    if (campo === 'tipo_documento') {
      nuevo.documento = ''
      setErrores(prev => ({ ...prev, documento: '' }))
      clearTimeout(timerDoc.current)
      setVerificando(v => ({ ...v, documento: false }))
    }

    setForm(nuevo)

    // Validación sincrónica
    const err = validarCampo(campo, valor, nuevo.tipo_persona, nuevo.tipo_documento)
    setErrores(prev => ({ ...prev, [campo]: err }))

    // Validaciones async — solo si no hay error de formato
    if (!err) {
      if (campo === 'documento')  verificarDoc(valor, nuevo.tipo_documento, modal.item?.id)
      if (campo === 'email')      verificarEmail(valor, modal.item?.id)
      if (campo === 'telefono')   verificarTelefono(valor, modal.item?.id)
      if (campo === 'nombre')     verificarNombre(valor, nuevo.tipo_persona, nuevo.tipo_documento, modal.item?.id)
    } else {
      // Cancela timers si hay error de formato
      if (campo === 'documento') { clearTimeout(timerDoc.current);      setVerificando(v => ({ ...v, documento: false })) }
      if (campo === 'email')     { clearTimeout(timerEmail.current);    setVerificando(v => ({ ...v, email: false })) }
      if (campo === 'telefono')  { clearTimeout(timerTelefono.current); setVerificando(v => ({ ...v, telefono: false })) }
      if (campo === 'nombre')    { clearTimeout(timerNombre.current);   setVerificando(v => ({ ...v, nombre: false })) }
    }
  }

  const handleSubmit = e => {
    e.preventDefault()
    const campos = ['nombre', 'documento', 'contacto', 'telefono', 'email']

    // Errores sincrónicos
    const erroresSinc = {}
    campos.forEach(c => {
      erroresSinc[c] = validarCampo(c, form[c], form.tipo_persona, form.tipo_documento)
    })

    // Merge con errores async existentes — los async tienen prioridad si el campo no tiene error sincrónico
    setErrores(prev => {
      const merged = { ...erroresSinc }
      campos.forEach(c => {
        if (!merged[c] && prev[c]) merged[c] = prev[c]
      })
      return merged
    })

    // Verificar todos los errores (sinc + async actuales)
    const todosErrores = { ...errores }
    campos.forEach(c => { if (erroresSinc[c]) todosErrores[c] = erroresSinc[c] })
    if (Object.values(todosErrores).some(Boolean)) return
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