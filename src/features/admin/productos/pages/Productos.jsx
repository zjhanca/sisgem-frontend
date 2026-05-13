import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/services/api'
import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
import toast from 'react-hot-toast'
import { Plus, Edit2, ToggleLeft, ToggleRight, Download, Eye, Trash2, Scan, Search } from 'lucide-react'
import { formatPrecio } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
 
const formVacio = {
  nombre: '', descripcion: '', precio: '', stock: '',
  categoria_id: '', proveedor_id: '', marca_id: '',
  codigo_barras: '', imagen_url: ''
}
 
function BuscadorSelect({ label, items, valorId, onSelect, placeholder }) {
  const [busq, setBusq] = useState('')
  const [abierto, setAbierto] = useState(false)
 
  const filtrados = items.filter(i =>
    !busq || i.nombre.toLowerCase().includes(busq.toLowerCase())
  ).slice(0, 8)
 
  const seleccionado = items.find(i => i.id === +valorId)
 
  return (
    <div>
      <label className="campo-label">{label}</label>
      <div className="relative">
        <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400 pointer-events-none" />
        <input
          value={seleccionado ? seleccionado.nombre : busq}
          onChange={e => { setBusq(e.target.value); onSelect(''); setAbierto(true) }}
          onFocus={() => setAbierto(true)}
          className="campo-input pl-8 text-xs"
          placeholder={placeholder} />
        {seleccionado && (
          <button type="button" onClick={() => { onSelect(''); setBusq(''); setAbierto(false) }}
            className="absolute right-2 top-2 text-gray-400 hover:text-red-400 text-xs">✕</button>
        )}
        {abierto && busq && filtrados.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-30 bg-light-card dark:bg-dark-card
            border border-gray-200 dark:border-dark-border rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
            {filtrados.map(i => (
              <button key={i.id} type="button"
                onClick={() => { onSelect(i.id); setBusq(''); setAbierto(false) }}
                className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 text-light-text dark:text-dark-text">
                {i.nombre}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
 
export default function Productos() {
  const qc = useQueryClient()
  const [modal, setModal]                 = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle]   = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]     = useState(formVacio)
  const [errores, setErrores] = useState({})
 
  const { data: productos = [] }  = useQuery({ queryKey: ['productos'],   queryFn: () => api.get('/productos').then(r => r.data.datos) })
  const { data: categorias = [] } = useQuery({ queryKey: ['categorias'],  queryFn: () => api.get('/categorias').then(r => r.data.datos.filter(c => c.estado)) })
  const { data: proveedores = [] }= useQuery({ queryKey: ['proveedores'], queryFn: () => api.get('/proveedores').then(r => r.data.datos.filter(p => p.estado)) })
  const { data: marcas = [] }     = useQuery({ queryKey: ['marcas'],      queryFn: () => api.get('/marcas').then(r => r.data.datos.filter(m => m.estado)) })
 
  const guardar = useMutation({
    mutationFn: data => modal.item ? api.put(`/productos/${modal.item.id}`, data) : api.post('/productos', data),
    onSuccess: () => { qc.invalidateQueries(['productos']); cerrarModal(); 	oast.success('Producto guardado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
  const toggleEstado = useMutation({
    mutationFn: id => api.patch(`/productos/${id}/estado`),
    onSuccess: () => qc.invalidateQueries(['productos'])
  })
  const eliminar = useMutation({
    mutationFn: id => api.delete(`/productos/${id}`),
    onSuccess: () => { qc.invalidateQueries(['productos']); setModalEliminar({ abierto: false, item: null }); 	oast.success('Producto eliminado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'no se puede eliminar')
  })
 
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
    if (!form.nombre.trim()) e.nombre = 'nombre obligatorio'
    if (!form.precio || +form.precio <= 0) e.precio = 'precio inválido'
    if (form.stock === '' || +form.stock < 0) e.stock = 'stock inválido'
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
        ? <img src={r.imagen_url} alt="" className="w-8 h-8 object-cover rounded" onError={e => e.target.style.display = 'none'} />
        : <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-xs text-primary/50">—</div>
    },
    { key: 'nombre',        label: 'Nombre' },
    { key: 'codigo_barras', label: 'Código', render: r => <span className="font-mono text-xs">{r.codigo_barras || '-'}</span> },
    { key: 'categoria',     label: 'Categoría', render: r => r.categoria || '-' },
    { key: 'marca',         label: 'Marca',     render: r => r.marca || '-' },
    { key: 'precio',        label: 'Precio',    render: r => formatPrecio(r.precio) },
    { key: 'stock',         label: 'Stock',
      render: r => <span className={r.stock <= 5 ? 'text-red-400 font-semibold' : ''}>{r.stock}</span>
    },
    { key: 'estado', label: 'Estado',
      render: r => <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>{r.estado ? 'activo' : 'inactivo'}</span>
    },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Productos</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarPDF('/reportes/productos', 'reporte-productos.pdf')} className="btn-outline">
            <Download size={14} /> Reporte</button>
          <button onClick={() => abrirModal()} className="btn-primary"><Plus size={14} /> Nuevo</button>
        </div>
      </div>
 
      <Tabla columnas={columnas} datos={productos}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost"><Edit2 size={14} /></button>
          <button onClick={() => toggleEstado.mutate(fila.id)}
            className={`btn-ghost ${fila.estado ? 'hover:text-red-400' : 'hover:text-green-400'}`}>
            {fila.estado ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })} className="btn-ghost hover:text-red-400">
            <Trash2 size={14} /></button>
        </>)}
      />
 
      {/* ───── MODAL CREAR/EDITAR ───── */}
      <Modal abierto={modal.abierto} onCerrar={cerrarModal}
        titulo={modal.item ? 'editar producto' : 'nuevo producto'} ancho="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
 
            {/* nombre */}
            <div className="col-span-2">
              <label className="campo-label">nombre *</label>
              <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`} placeholder="Nombre del producto" />
              {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
            </div>
 
            {/* precio y stock */}
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
 
            {/* buscador categoría */}
            <BuscadorSelect
              label="categoría"
              items={categorias}
              valorId={form.categoria_id}
              onSelect={id => setForm({ ...form, categoria_id: id })}
              placeholder="Buscar categoría..." />
 
            {/* buscador marca */}
            <BuscadorSelect
              label="marca"
              items={marcas}
              valorId={form.marca_id}
              onSelect={id => setForm({ ...form, marca_id: id })}
              placeholder="Buscar marca..." />
 
            {/* buscador proveedor */}
            <BuscadorSelect
              label="proveedor"
              items={proveedores}
              valorId={form.proveedor_id}
              onSelect={id => setForm({ ...form, proveedor_id: id })}
              placeholder="Buscar proveedor..." />
 
            {/* código de barras */}
            <div className="relative">
              <label className="campo-label">código de barras</label>
              <input value={form.codigo_barras}
                onChange={e => setForm({ ...form, codigo_barras: e.target.value })}
                className="campo-input pr-8" placeholder="Ej: 7702001234567" />
              <Scan size={13} className="absolute right-2 bottom-2.5 text-gray-400" />
            </div>
 
            {/* url imagen */}
            <div className="col-span-2">
              <label className="campo-label">url de imagen</label>
              <input value={form.imagen_url} onChange={e => setForm({ ...form, imagen_url: e.target.value })}
                className="campo-input" placeholder="https://ejemplo.com/imagen.jpg" />
              {form.imagen_url && (
                <img src={form.imagen_url} alt="preview"
                  className="mt-2 h-20 w-20 object-cover rounded-lg border border-gray-200 dark:border-dark-border"
                  onError={e => e.target.style.display = 'none'} />
              )}
            </div>
 
            {/* descripción */}
            <div className="col-span-2">
              <label className="campo-label">descripción</label>
              <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
                rows={2} className="campo-input resize-none" />
            </div>
          </div>
 
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button type="button" onClick={cerrarModal}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
            <button type="submit" disabled={guardar.isPending} className="btn-primary">
              {guardar.isPending ? 'Guardando...' : 'Aceptar'}
            </button>
          </div>
        </form>
      </Modal>
 
      {/* ───── MODAL DETALLE ───── */}
      <Modal abierto={modalDetalle.abierto} onCerrar={() => setModalDetalle({ abierto: false, item: null })}
        titulo="detalles del producto">
        {modalDetalle.item && (
          <div className="space-y-3">
            {modalDetalle.item.imagen_url && (
              <img src={modalDetalle.item.imagen_url} alt="" className="w-full h-40 object-cover rounded-xl"
                onError={e => e.target.style.display = 'none'} />
            )}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="campo-label">nombre</p><p className="font-medium">{modalDetalle.item.nombre}</p></div>
              <div><p className="campo-label">estado</p>
                <span className={modalDetalle.item.estado ? 'badge-activo' : 'badge-inactivo'}>
                  {modalDetalle.item.estado ? 'activo' : 'inactivo'}</span></div>
              <div><p className="campo-label">precio</p><p className="text-primary font-bold">{formatPrecio(modalDetalle.item.precio)}</p></div>
              <div><p className="campo-label">stock</p>
                <p className={modalDetalle.item.stock <= 5 ? 'text-red-400 font-semibold' : ''}>{modalDetalle.item.stock} uds</p></div>
              <div><p className="campo-label">categoría</p><p>{modalDetalle.item.categoria || '-'}</p></div>
              <div><p className="campo-label">marca</p><p>{modalDetalle.item.marca || '-'}</p></div>
              <div><p className="campo-label">proveedor</p><p>{modalDetalle.item.proveedor || '-'}</p></div>
              <div><p className="campo-label">código barras</p><p className="font-mono text-xs">{modalDetalle.item.codigo_barras || '-'}</p></div>
            </div>
            <div className="flex justify-end pt-2 border-t border-gray-200 dark:border-dark-border">
              <button onClick={() => { setModalDetalle({ abierto: false, item: null }); abrirModal(modalDetalle.item) }}
                className="btn-outline text-xs"><Edit2 size={12} /> Editar</button>
            </div>
          </div>
        )}
      </Modal>
 
      {/* ───── MODAL ELIMINAR ───── */}
      <Modal abierto={modalEliminar.abierto} onCerrar={() => setModalEliminar({ abierto: false, item: null })}
        titulo="confirmar eliminación" ancho="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm">¿eliminar <span className="font-medium text-primary">{modalEliminar.item?.nombre}</span>?
            No se puede si tiene movimientos.</p>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => setModalEliminar({ abierto: false, item: null })}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
            <button onClick={() => eliminar.mutate(modalEliminar.item.id)} disabled={eliminar.isPending}
              className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50">
              {eliminar.isPending ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
