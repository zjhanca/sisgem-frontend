import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import Tabla from '../../components/Tabla'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { Plus, Edit2, ToggleLeft, ToggleRight, Download, Eye, Trash2, Scan } from 'lucide-react'
import { formatPrecio } from '../../utils/validaciones'
import { descargarPDF } from '../../utils/reportes'
 
const formVacio = {
  nombre: '', descripcion: '', precio: '', stock: '',
  categoria_id: '', proveedor_id: '', marca_id: '',
  codigo_barras: '', imagen_url: ''
}
 
export default function Productos() {
  const qc = useQueryClient()
  const [modal, setModal]               = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]   = useState(formVacio)
  const [errores, setErrores] = useState({})
 
  const { data: productos = [] } = useQuery({
    queryKey: ['productos'],
    queryFn: () => api.get('/productos').then(r => r.data.datos)
  })
  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => api.get('/categorias').then(r => r.data.datos.filter(c => c.estado))
  })
  const { data: proveedores = [] } = useQuery({
    queryKey: ['proveedores'],
    queryFn: () => api.get('/proveedores').then(r => r.data.datos.filter(p => p.estado))
  })
  const { data: marcas = [] } = useQuery({
    queryKey: ['marcas'],
    queryFn: () => api.get('/marcas').then(r => r.data.datos.filter(m => m.estado))
  })
 
  const guardar = useMutation({
    mutationFn: data => modal.item
      ? api.put(`/productos/${modal.item.id}`, data)
      : api.post('/productos', data),
    onSuccess: () => { qc.invalidateQueries(['productos']); cerrarModal(); toast.success('producto guardado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const toggleEstado = useMutation({
    mutationFn: id => api.patch(`/productos/${id}/estado`),
    onSuccess: () => qc.invalidateQueries(['productos'])
  })
 
  const eliminar = useMutation({
    mutationFn: id => api.delete(`/productos/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['productos'])
      setModalEliminar({ abierto: false, item: null })
      toast.success('producto eliminado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error al eliminar')
  })
 
  const buscarPorCodigo = async (codigo) => {
    if (!codigo) return
    try {
      const { data } = await api.get(`/productos/barcode/${codigo}`)
      if (data.ok) toast.success(`Encontrado: ${data.datos.nombre}`)
    } catch {
      toast.error('producto no encontrado')
    }
  }
 
  const abrirModal = (item = null) => {
    setForm(item ? {
      nombre: item.nombre, descripcion: item.descripcion || '',
      precio: item.precio, stock: item.stock,
      categoria_id: item.categoria_id || '',
      proveedor_id: item.proveedor_id || '',
      marca_id: item.marca_id || '',
      codigo_barras: item.codigo_barras || '',
      imagen_url: item.imagen_url || ''
    } : formVacio)
    setErrores({})
    setModal({ abierto: true, item })
  }
 
  const cerrarModal = () => setModal({ abierto: false, item: null })
 
  const validar = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'el nombre es obligatorio'
    if (!form.precio || isNaN(form.precio) || +form.precio <= 0) e.precio = 'precio invalido'
    if (form.stock === '' || isNaN(form.stock) || +form.stock < 0) e.stock = 'stock invalido'
    return e
  }
 
  const handleSubmit = e => {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length) { setErrores(e2); return }
    guardar.mutate(form)
  }
 
  const columnas = [
    { key: 'imagen_url', label: 'Img',
      render: r => r.imagen_url
        ? <img src={r.imagen_url} alt={r.nombre} className="w-8 h-8 object-cover rounded" />
        : <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-xs text-primary">-</div>
    },
    { key: 'nombre',    label: 'Nombre' },
    { key: 'categoria', label: 'Categoria', render: r => r.categoria || '-' },
    { key: 'marca',     label: 'Marca', render: r => r.marca || '-' },
    { key: 'precio',    label: 'Precio', render: r => formatPrecio(r.precio) },
    { key: 'stock',     label: 'Stock',
      render: r => <span className={r.stock <= 5 ? 'text-red-400 font-medium' : ''}>{r.stock}</span>
    },
    { key: 'estado', label: 'Estado',
      render: r => (
        <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>
          {r.estado ? 'activo' : 'inactivo'}
        </span>
      )
    },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">productos</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarPDF('/reportes/productos', 'reporte-productos.pdf')}
            className="btn-outline"><Download size={14} /> reporte</button>
          <button onClick={() => abrirModal()} className="btn-primary">
            <Plus size={14} /> nuevo</button>
        </div>
      </div>
 
      <Tabla columnas={columnas} datos={productos}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })}
            className="btn-ghost" title="ver"><Eye size={14} /></button>
          <button onClick={() => abrirModal(fila)}
            className="btn-ghost" title="editar"><Edit2 size={14} /></button>
          <button onClick={() => toggleEstado.mutate(fila.id)}
            className={`btn-ghost ${fila.estado ? 'hover:text-red-400' : 'hover:text-green-400'}`}>
            {fila.estado ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })}
            className="btn-ghost hover:text-red-400"><Trash2 size={14} /></button>
        </>)}
      />
 
      <Modal abierto={modal.abierto} onCerrar={cerrarModal}
        titulo={modal.item ? 'editar producto' : 'nuevo producto'} ancho="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="campo-label">nombre *</label>
              <input value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`}
                placeholder="nombre del producto" />
              {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
            </div>
            <div>
              <label className="campo-label">precio *</label>
              <input type="number" step="0.01" value={form.precio}
                onChange={e => setForm({ ...form, precio: e.target.value })}
                className={`campo-input ${errores.precio ? 'border-red-400' : ''}`} placeholder="0.00" />
              {errores.precio && <p className="campo-error">{errores.precio}</p>}
            </div>
            <div>
              <label className="campo-label">stock *</label>
              <input type="number" value={form.stock}
                onChange={e => setForm({ ...form, stock: e.target.value })}
                className={`campo-input ${errores.stock ? 'border-red-400' : ''}`} placeholder="0" />
              {errores.stock && <p className="campo-error">{errores.stock}</p>}
            </div>
            <div>
              <label className="campo-label">categoria</label>
              <select value={form.categoria_id}
                onChange={e => setForm({ ...form, categoria_id: e.target.value })}
                className="campo-input">
                <option value="">seleccionar...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="campo-label">marca</label>
              <select value={form.marca_id}
                onChange={e => setForm({ ...form, marca_id: e.target.value })}
                className="campo-input">
                <option value="">seleccionar...</option>
                {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="campo-label">proveedor</label>
              <select value={form.proveedor_id}
                onChange={e => setForm({ ...form, proveedor_id: e.target.value })}
                className="campo-input">
                <option value="">seleccionar...</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className="relative">
              <label className="campo-label">codigo de barras</label>
              <input value={form.codigo_barras}
                onChange={e => setForm({ ...form, codigo_barras: e.target.value })}
                className="campo-input pr-8" placeholder="ej: 7702001234567" />
              <Scan size={14} className="absolute right-2 top-7 text-gray-400" />
            </div>
            <div className="col-span-2">
              <label className="campo-label">url de imagen</label>
              <input value={form.imagen_url}
                onChange={e => setForm({ ...form, imagen_url: e.target.value })}
                className="campo-input" placeholder="https://ejemplo.com/imagen.jpg" />
              {form.imagen_url && (
                <img src={form.imagen_url} alt="preview"
                  className="mt-2 h-16 w-16 object-cover rounded border border-gray-200 dark:border-dark-border"
                  onError={e => e.target.style.display = 'none'} />
              )}
            </div>
            <div className="col-span-2">
              <label className="campo-label">descripcion</label>
              <textarea value={form.descripcion}
                onChange={e => setForm({ ...form, descripcion: e.target.value })}
                rows={2} className="campo-input resize-none" placeholder="descripcion del producto" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button type="button" onClick={cerrarModal}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border
                text-gray-500 dark:text-dark-text/60 rounded-lg hover:border-primary/40">cancelar</button>
            <button type="submit" disabled={guardar.isPending} className="btn-primary">
              {guardar.isPending ? 'guardando...' : 'guardar'}</button>
          </div>
        </form>
      </Modal>
 
      <Modal abierto={modalDetalle.abierto}
        onCerrar={() => setModalDetalle({ abierto: false, item: null })}
        titulo="detalles del producto">
        {modalDetalle.item && (
          <div className="space-y-3 text-sm">
            {modalDetalle.item.imagen_url && (
              <img src={modalDetalle.item.imagen_url} alt={modalDetalle.item.nombre}
                className="w-full h-40 object-cover rounded-lg" />
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><p className="campo-label">nombre</p>
                <p className="font-medium text-light-text dark:text-dark-text">{modalDetalle.item.nombre}</p></div>
              <div><p className="campo-label">estado</p>
                <span className={modalDetalle.item.estado ? 'badge-activo' : 'badge-inactivo'}>
                  {modalDetalle.item.estado ? 'activo' : 'inactivo'}</span></div>
              <div><p className="campo-label">precio</p>
                <p className="text-primary font-semibold">{formatPrecio(modalDetalle.item.precio)}</p></div>
              <div><p className="campo-label">stock</p>
                <p className={modalDetalle.item.stock <= 5 ? 'text-red-400 font-medium' : ''}>
                  {modalDetalle.item.stock} unidades</p></div>
              <div><p className="campo-label">categoria</p>
                <p>{modalDetalle.item.categoria || '-'}</p></div>
              <div><p className="campo-label">marca</p>
                <p>{modalDetalle.item.marca || '-'}</p></div>
              <div><p className="campo-label">proveedor</p>
                <p>{modalDetalle.item.proveedor || '-'}</p></div>
              <div><p className="campo-label">codigo de barras</p>
                <p className="font-mono text-xs">{modalDetalle.item.codigo_barras || '-'}</p></div>
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-dark-border">
              <button onClick={() => { setModalDetalle({ abierto: false, item: null }); abrirModal(modalDetalle.item) }}
                className="btn-outline text-xs"><Edit2 size={12} /> editar</button>
            </div>
          </div>
        )}
      </Modal>
 
      <Modal abierto={modalEliminar.abierto}
        onCerrar={() => setModalEliminar({ abierto: false, item: null })}
        titulo="confirmar eliminacion" ancho="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-light-text dark:text-dark-text">
            estas seguro que deseas eliminar el producto
            <span className="font-medium text-primary"> {modalEliminar.item?.nombre}</span>?
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => setModalEliminar({ abierto: false, item: null })}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border
                text-gray-500 dark:text-dark-text/60 rounded-lg">cancelar</button>
            <button onClick={() => eliminar.mutate(modalEliminar.item.id)}
              disabled={eliminar.isPending}
              className="px-4 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg disabled:opacity-50">
              {eliminar.isPending ? 'eliminando...' : 'eliminar'}</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
