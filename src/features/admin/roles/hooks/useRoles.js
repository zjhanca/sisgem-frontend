import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { rolesService } from '../services/rolesService'
import toast from 'react-hot-toast'

const formVacio = { nombre: '', descripcion: '' }

const agruparPermisos = permisos => permisos.reduce((acc, p) => {
  if (!acc[p.modulo]) acc[p.modulo] = []
  acc[p.modulo].push(p)
  return acc
}, {})

const ROLES_PROTEGIDOS = ['administrador', 'admin', 'cliente']

export function useRoles() {
  const qc = useQueryClient()
  const [modal, setModal]                 = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle]   = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]       = useState(formVacio)
  const [errores, setErrores] = useState({})
  const [tab, setTab]         = useState('info')
  const [permisosSeleccionados, setPermisosSeleccionados] = useState([])

  const { data: roles = [] }         = useQuery({ queryKey: ['roles'],    queryFn: rolesService.getAll })
  const { data: todosPermisos = [] } = useQuery({ queryKey: ['permisos'], queryFn: rolesService.getPermisos })

  const gruposPermisos = agruparPermisos(todosPermisos)

  const esProtegido = id => {
    const rol = roles.find(r => r.id === +id)
    return ROLES_PROTEGIDOS.some(n => rol?.nombre?.toLowerCase().includes(n))
  }

  const abrirModal = async (item = null) => {
    setForm(item ? { nombre: item.nombre, descripcion: item.descripcion || '' } : formVacio)
    setTab('info'); setErrores({})
    if (item) {
      try {
        const { data } = await rolesService.getById(item.id)
        setPermisosSeleccionados(data.datos.permisos?.map(p => p.id) || [])
      } catch { setPermisosSeleccionados([]) }
    } else { setPermisosSeleccionados([]) }
    setModal({ abierto: true, item })
  }
  const cerrarModal = () => { setModal({ abierto: false, item: null }); setTab('info') }

  const handleNombreChange = valor => {
    setForm(p => ({ ...p, nombre: valor }))
    if (!valor.trim()) { setErrores(p => ({ ...p, nombre: 'El nombre es obligatorio' })); return }
    const duplicado = roles.find(r =>
      r.nombre.toLowerCase() === valor.trim().toLowerCase() && r.id !== modal.item?.id
    )
    setErrores(p => ({ ...p, nombre: duplicado ? 'Ya existe un rol con ese nombre' : '' }))
  }

  const guardar = useMutation({
    mutationFn: async data => {
      let res
      if (modal.item) {
        res = await rolesService.update(modal.item.id, { nombre: data.nombre, descripcion: data.descripcion })
        await rolesService.setPermisos(modal.item.id, { permiso_ids: permisosSeleccionados })
      } else {
        res = await rolesService.create({ nombre: data.nombre, descripcion: data.descripcion })
        if (permisosSeleccionados.length > 0)
          await rolesService.setPermisos(res.data.datos.id, { permiso_ids: permisosSeleccionados })
      }
      return res.data
    },
    onSuccess: () => { qc.invalidateQueries(['roles']); cerrarModal(); toast.success('Rol guardado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error'),
  })
  const toggleEstado = useMutation({
    mutationFn: rolesService.toggleEstado,
    onSuccess: () => { qc.invalidateQueries(['roles']); toast.success('Estado actualizado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'No se puede modificar'),
  })
  const eliminar = useMutation({
    mutationFn: rolesService.delete,
    onSuccess: () => { qc.invalidateQueries(['roles']); setModalEliminar({ abierto: false, item: null }); toast.success('Rol eliminado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'No se puede eliminar'),
  })

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.nombre.trim()) { setErrores({ nombre: 'El nombre es obligatorio' }); return }
    if (errores.nombre) return

    // si todavía estamos en la pestaña de información, no guardar aún:
    // llevar al usuario a la pestaña de permisos para que los seleccione
    if (tab === 'info') {
      setTab('permisos')
      return
    }

    // en la pestaña de permisos: son obligatorios, no se puede guardar sin ninguno
    if (permisosSeleccionados.length === 0) {
      toast.error('Selecciona al menos un permiso para este rol')
      return
    }

    guardar.mutate(form)
  }

  const togglePermiso = useCallback(id => setPermisosSeleccionados(prev =>
    prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]), [])
  const toggleModulo = perms => {
    const ids   = perms.map(p => p.id)
    const todos = ids.every(id => permisosSeleccionados.includes(id))
    setPermisosSeleccionados(prev => todos ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])])
  }
  const seleccionarTodos = () => setPermisosSeleccionados(todosPermisos.map(p => p.id))
  const limpiarTodos     = () => setPermisosSeleccionados([])

  return {
    roles, todosPermisos, gruposPermisos,
    form, setForm, errores, tab, setTab,
    permisosSeleccionados,
    modal, modalDetalle, modalEliminar,
    setModalDetalle, setModalEliminar,
    esProtegido, abrirModal, cerrarModal, handleSubmit, handleNombreChange,
    toggleEstado, eliminar, togglePermiso, toggleModulo,
    seleccionarTodos, limpiarTodos,
    guardando: guardar.isPending, eliminando: eliminar.isPending,
  }
}