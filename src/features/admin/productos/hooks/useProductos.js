import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productosService } from '../services/productosService'
import toast from 'react-hot-toast'
 
const formVacio = { nombre: '', descripcion: '', precio: '', stock: '', categoria_id: '', proveedor_id: '', marca_id: '', codigo_barras: '', imagen_url: '' }
 
const validar = form => {
  const e = {}
  if (!form.nombre.trim())                  e.nombre = 'El nombre es obligatorio'
  if (!form.precio || +form.precio <= 0)    e.precio = 'Precio inválido'
  if (form.stock === '' || +form.stock < 0) e.stock  = 'Stock inválido'
  return e
}
 
export function useProductos() {
  const qc = useQueryClient()
  const [modal, setModal]                 = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle]   = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]     = useState(formVacio)
  const [errores, setErrores] = useState({})
 
  const { data: productos = [] }  = useQuery({ queryKey: ['productos'],   queryFn: productosService.getAll })
  const { data: categorias = [] } = useQuery({ queryKey: ['categorias'],  queryFn: productosService.getCategorias })
  const { data: proveedores = [] }= useQuery({ queryKey: ['proveedores'], queryFn: productosService.getProveedores })
  const { data: marcas = [] }     = useQuery({ queryKey: ['marcas'],      queryFn: productosService.getMarcas })
 
  const guardar = useMutation({
    mutationFn: data => modal.item ? productosService.update(modal.item.id, data) : productosService.create(data),
    onSuccess: () => { qc.invalidateQueries(['productos']); cerrarModal(); toast.success('Producto guardado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'Error al guardar'),
  })
  const toggleEstado = useMutation({
    mutationFn: productosService.toggleEstado,
    onSuccess: () => { qc.invalidateQueries(['productos']); toast.success('Estado actualizado') },
  })
  const eliminar = useMutation({
    mutationFn: productosService.delete,
    onSuccess: () => { qc.invalidateQueries(['productos']); setModalEliminar({ abierto: false, item: null }); toast.success('Producto eliminado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'No se puede eliminar'),
  })
 
  const abrirModal = (item = null) => {
    setForm(item ? { nombre: item.nombre, descripcion: item.descripcion || '', precio: item.precio,
      stock: item.stock, categoria_id: item.categoria_id || '', proveedor_id: item.proveedor_id || '',
      marca_id: item.marca_id || '', codigo_barras: item.codigo_barras || '', imagen_url: item.imagen_url || '' } : formVacio)
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
    productos, categorias, proveedores, marcas,
    form, errores, modal, modalDetalle, modalEliminar,
    setForm, setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal, handleChange, handleSubmit,
    toggleEstado, eliminar,
    guardando: guardar.isPending, eliminando: eliminar.isPending,
  }
}
