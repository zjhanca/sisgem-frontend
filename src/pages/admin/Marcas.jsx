import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import Tabla from '../../components/Tabla'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { Plus, Edit2, ToggleLeft, ToggleRight, Eye, Trash2, ExternalLink } from 'lucide-react'
 
const formVacio = { nombre: '', descripcion: '', logo: '', proveedor_id: '', sitio_web: '' }
 
export default function Marcas() {
  const qc = useQueryClient()
  const [modal, setModal]               = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]     = useState(formVacio)
  const [errores, setErrores] = useState({})
 
  const { data: marcas = [] } = useQuery({ queryKey: ['marcas'], queryFn: () => api.get('/marcas').then(r => r.data.datos) })
  const { data: proveedores = [] } = useQuery({ queryKey: ['proveedores'], queryFn: () => api.get('/proveedores').then(r => r.data.datos.filter(p => p.estado)) })
 
  const guardar = useMutation({
    mutationFn: data => modal.item ? api.put(`/marcas/${modal.item.id}`, data) : api.post('/marcas', data),
    onSuccess: () => { qc.invalidateQueries(['marcas']); cerrarModal(); toast.success('marca guardada') },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
  const toggleEstado = useMutation({
    mutationFn: id => api.patch(`/marcas/${id}/estado`),
    onSuccess: () => { qc.invalidateQueries(['marcas']); toast.success('estado actualizado') }
  })
  const eliminar = useMutation({
    mutationFn: id => api.delete(`/marcas/${id}`),
    onSuccess: () => { qc.invalidateQueries(['marcas']); setModalEliminar({ abierto: false, item: null }); toast.success('marca eliminada') },
    onError: err => toast.error(err.response?.data?.mensaje || 'no se puede eliminar')
  })
 
  const abrirModal = (item = null) => {
    setForm(item ? {
      nombre: item.nombre, descripcion: item.descripcion || '', logo: item.logo || '',
      proveedor_id: item.proveedor_id || '', sitio_web: item.sitio_web || ''
    } : formVacio)
    setErrores({})
    setModal({ abierto: true, item })
  }
  const cerrarModal = () => setModal({ abierto: false, item: null })
 
  const handleSubmit = e => {
    e.preventDefault()
    if (!form.nombre.trim()) { setErrores({ nombre: 'el nombre es obligatorio' }); return }
    guardar.mutate(form)
  }
 
  const columnas = [
    { key: 'logo', label: 'Logo',
      render: r => r.logo
        ? <img src={r.logo} alt="" className="w-8 h-8 object-contain rounded" onError={e => e.target.style.display='none'} />
        : <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-xs font-bold text-primary">
            {r.nombre?.charAt(0).toUpperCase()}
          </div>
    },
    { key: 'nombre',      label: 'Nombre' },
    { key: 'proveedor',   label: 'Proveedor', render: r => r.proveedor || '-' },
    { key: 'sitio_web',   label: 'Sitio web',
      render: r => r.sitio_web
        ? <a href={r.sitio_web} target="_blank" rel="noopener noreferrer"
            className="text-primary text-xs flex items-center gap-1 hover:underline">
            <ExternalLink size={11} /> ver
          </a>
        : <span className="text-gray-400 text-xs">-</span>
    },
    { key: 'total_productos', label: 'Productos',
      render: r => <span className="badge-proceso">{r.total_productos}</span>
    },
    { key: 'estado', label: 'Estado',
      render: r => <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>{r.estado ? 'activa' : 'inactiva'}</span>
    },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">marcas</h1>
        <button onClick={() => abrirModal()} className="btn-primary"><Plus size={14} /> nueva marca</button>
      </div>
 
      <Tabla columnas={columnas} datos={marcas}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost"><Edit2 size={14} /></button>
          <button onClick={() => toggleEstado.mutate(fila.id)}
            className={`btn-ghost ${fila.estado ? 'hover:text-red-400' : 'hover:text-green-400'}`}>
            {fila.estado ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })}
            className="btn-ghost hover:text-red-400"><Trash2 size={14} /></button>
        </>)}
      />
 
      <Modal abierto={modal.abierto} onCerrar={cerrarModal}
        titulo={modal.item ? 'editar marca' : 'nueva marca'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="campo-label">nombre *</label>
            <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
              className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`} placeholder="nombre de la marca" />
            {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
          </div>
          <div>
            <label className="campo-label">proveedor relacionado</label>
            <select value={form.proveedor_id} onChange={e => setForm({ ...form, proveedor_id: e.target.value })} className="campo-input">
              <option value="">seleccionar proveedor...</option>
              {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="campo-label">descripcion</label>
            <textarea value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
              rows={2} className="campo-input resize-none" />
          </div>
          <div>
            <label className="campo-label">url del logo</label>
            <input value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })}
              className="campo-input" placeholder="https://ejemplo.com/logo.png" />
            {form.logo && (
              <img src={form.logo} alt="preview"
                className="mt-2 w-12 h-12 object-contain rounded border border-gray-200 dark:border-dark-border"
                onError={e => e.target.style.display = 'none'} />
            )}
          </div>
          <div>
            <label className="campo-label">sitio web (opcional)</label>
            <input value={form.sitio_web} onChange={e => setForm({ ...form, sitio_web: e.target.value })}
              className="campo-input" placeholder="https://www.marca.com" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button type="button" onClick={cerrarModal}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">cancelar</button>
            <button type="submit" disabled={guardar.isPending} className="btn-primary">
              {guardar.isPending ? 'guardando...' : 'guardar'}
            </button>
          </div>
        </form>
      </Modal>
 
      <Modal abierto={modalDetalle.abierto} onCerrar={() => setModalDetalle({ abierto: false, item: null })}
        titulo="detalles de la marca" ancho="max-w-lg">
        {modalDetalle.item && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {modalDetalle.item.logo
                ? <img src={modalDetalle.item.logo} alt="" className="w-16 h-16 object-contain rounded-xl border border-gray-200 dark:border-dark-border" onError={e => e.target.style.display='none'} />
                : <div className="w-16 h-16 rounded-xl border border-gray-200 dark:border-dark-border bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-2xl">{modalDetalle.item.nombre?.charAt(0).toUpperCase()}</span>
                  </div>
              }
              <div className="flex-1">
                <h3 className="font-semibold text-light-text dark:text-dark-text">{modalDetalle.item.nombre}</h3>
                <span className={modalDetalle.item.estado ? 'badge-activo' : 'badge-inactivo'}>
                  {modalDetalle.item.estado ? 'activa' : 'inactiva'}</span>
                {modalDetalle.item.proveedor && <p className="text-xs text-gray-400 mt-1">proveedor: {modalDetalle.item.proveedor}</p>}
                {modalDetalle.item.descripcion && <p className="text-xs text-gray-400 mt-1">{modalDetalle.item.descripcion}</p>}
                {modalDetalle.item.sitio_web && (
                  <a href={modalDetalle.item.sitio_web} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline">
                    <ExternalLink size={10} /> {modalDetalle.item.sitio_web}
                  </a>
                )}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
              <button onClick={() => { setModalDetalle({ abierto: false, item: null }); abrirModal(modalDetalle.item) }}
                className="btn-outline text-xs"><Edit2 size={12} /> editar</button>
            </div>
          </div>
        )}
      </Modal>
 
      <Modal abierto={modalEliminar.abierto} onCerrar={() => setModalEliminar({ abierto: false, item: null })}
        titulo="confirmar eliminacion" ancho="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm">estas seguro de eliminar la marca
            <span className="font-medium text-primary"> {modalEliminar.item?.nombre}</span>?
            No se puede eliminar si tiene productos asociados.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => setModalEliminar({ abierto: false, item: null })}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">cancelar</button>
            <button onClick={() => eliminar.mutate(modalEliminar.item.id)} disabled={eliminar.isPending}
              className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50">
              {eliminar.isPending ? 'eliminando...' : 'eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
 
