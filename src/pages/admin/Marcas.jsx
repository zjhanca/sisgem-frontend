import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import Tabla from '../../components/Tabla'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { Plus, Edit2, ToggleLeft, ToggleRight, Eye, Trash2 } from 'lucide-react'
import { formatPrecio } from '../../utils/validaciones'

const formVacio = { nombre: '', descripcion: '', logo: '' }

export default function Marcas() {
  const qc = useQueryClient()
  const [modal, setModal]               = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]                 = useState(formVacio)
  const [errores, setErrores]           = useState({})

  const { data: marcas = [] } = useQuery({
    queryKey: ['marcas'],
    queryFn: () => api.get('/marcas').then(r => r.data.datos)
  })

  const guardar = useMutation({
    mutationFn: data => modal.item
      ? api.put(`/marcas/${modal.item.id}`, data)
      : api.post('/marcas', data),
    onSuccess: () => {
      qc.invalidateQueries(['marcas'])
      cerrarModal()
      toast.success('marca guardada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })

  const toggleEstado = useMutation({
    mutationFn: id => api.patch(`/marcas/${id}/estado`),
    onSuccess: () => {
      qc.invalidateQueries(['marcas'])
      toast.success('estado actualizado')
    }
  })

  const eliminar = useMutation({
    mutationFn: id => api.delete(`/marcas/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['marcas'])
      setModalEliminar({ abierto: false, item: null })
      toast.success('marca eliminada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'no se puede eliminar, tiene productos asociados')
  })

  const abrirModal = (item = null) => {
    setForm(item ? {
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      logo: item.logo || ''
    } : formVacio)
    setErrores({})
    setModal({ abierto: true, item })
  }

  const cerrarModal = () => setModal({ abierto: false, item: null })

  const validar = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'el nombre es obligatorio'
    if (form.nombre.trim().length < 2) e.nombre = 'minimo 2 caracteres'
    return e
  }

  const handleSubmit = e => {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length) { setErrores(e2); return }
    guardar.mutate(form)
  }

  const columnas = [
    { key: 'nombre',           label: 'Nombre' },
    { key: 'descripcion',      label: 'Descripcion', render: r => r.descripcion || '-' },
    { key: 'total_productos',  label: 'Productos',
      render: r => (
        <span className="badge-proceso">{r.total_productos} productos</span>
      )
    },
    { key: 'estado', label: 'Estado',
      render: r => (
        <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>
          {r.estado ? 'activa' : 'inactiva'}
        </span>
      )
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">marcas</h1>
        <button onClick={() => abrirModal()} className="btn-primary">
          <Plus size={14} /> nueva
        </button>
      </div>

      <Tabla columnas={columnas} datos={marcas}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })}
            className="btn-ghost" title="ver detalles">
            <Eye size={14} />
          </button>
          <button onClick={() => abrirModal(fila)}
            className="btn-ghost" title="editar">
            <Edit2 size={14} />
          </button>
          <button onClick={() => toggleEstado.mutate(fila.id)}
            className={`btn-ghost ${fila.estado ? 'hover:text-red-400' : 'hover:text-green-400'}`}
            title={fila.estado ? 'desactivar' : 'activar'}>
            {fila.estado ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })}
            className="btn-ghost hover:text-red-400" title="eliminar">
            <Trash2 size={14} />
          </button>
        </>)}
      />

      {/* modal nuevo / editar */}
      <Modal abierto={modal.abierto} onCerrar={cerrarModal}
        titulo={modal.item ? 'editar marca' : 'nueva marca'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="campo-label">nombre *</label>
            <input value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`}
              placeholder="nombre de la marca" />
            {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
          </div>
          <div>
            <label className="campo-label">descripcion</label>
            <textarea value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              rows={2} className="campo-input resize-none"
              placeholder="descripcion de la marca" />
          </div>
          <div>
            <label className="campo-label">url del logo</label>
            <input value={form.logo}
              onChange={e => setForm({ ...form, logo: e.target.value })}
              className="campo-input"
              placeholder="https://ejemplo.com/logo.png" />
            {form.logo && (
              <div className="mt-2 flex items-center gap-2">
                <img src={form.logo} alt="preview"
                  className="w-10 h-10 object-contain rounded border border-gray-200 dark:border-dark-border"
                  onError={e => e.target.style.display = 'none'} />
                <p className="text-xs text-gray-400 dark:text-dark-text/40">preview del logo</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button type="button" onClick={cerrarModal}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border
                text-gray-500 dark:text-dark-text/60 rounded-lg hover:border-primary/40">
              cancelar
            </button>
            <button type="submit" disabled={guardar.isPending} className="btn-primary">
              {guardar.isPending ? 'guardando...' : 'guardar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* modal detalles */}
      <Modal abierto={modalDetalle.abierto}
        onCerrar={() => setModalDetalle({ abierto: false, item: null })}
        titulo="detalles de la marca" ancho="max-w-lg">
        {modalDetalle.item && (
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              {modalDetalle.item.logo ? (
                <img src={modalDetalle.item.logo} alt={modalDetalle.item.nombre}
                  className="w-16 h-16 object-contain rounded-xl border
                    border-gray-200 dark:border-dark-border shrink-0"
                  onError={e => e.target.style.display = 'none'} />
              ) : (
                <div className="w-16 h-16 rounded-xl border border-gray-200 dark:border-dark-border
                  bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-xl">
                    {modalDetalle.item.nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-light-text dark:text-dark-text">
                  {modalDetalle.item.nombre}
                </h3>
                <span className={modalDetalle.item.estado ? 'badge-activo' : 'badge-inactivo'}>
                  {modalDetalle.item.estado ? 'activa' : 'inactiva'}
                </span>
                {modalDetalle.item.descripcion && (
                  <p className="text-xs text-gray-400 dark:text-dark-text/50 mt-1">
                    {modalDetalle.item.descripcion}
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="campo-label mb-2">
                productos asociados ({modalDetalle.item.total_productos})
              </p>
              {modalDetalle.item.total_productos > 0 ? (
                <DetalleProductosMarca id={modalDetalle.item.id} />
              ) : (
                <p className="text-xs text-gray-400 dark:text-dark-text/40 text-center py-3">
                  sin productos asociados
                </p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
              <button onClick={() => toggleEstado.mutate(modalDetalle.item.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  modalDetalle.item.estado
                    ? 'border-red-400/40 text-red-400 hover:bg-red-400/10'
                    : 'border-primary/40 text-primary hover:bg-primary/10'
                }`}>
                {modalDetalle.item.estado ? 'desactivar' : 'activar'}
              </button>
              <button onClick={() => {
                setModalDetalle({ abierto: false, item: null })
                abrirModal(modalDetalle.item)
              }} className="btn-outline text-xs">
                <Edit2 size={12} /> editar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* modal confirmar eliminar */}
      <Modal abierto={modalEliminar.abierto}
        onCerrar={() => setModalEliminar({ abierto: false, item: null })}
        titulo="confirmar eliminacion" ancho="max-w-sm">
        <div className="space-y-4">
          <p className="text-sm text-light-text dark:text-dark-text">
            estas seguro que deseas eliminar la marca
            <span className="font-medium text-primary"> {modalEliminar.item?.nombre}</span>?
            no se puede eliminar si tiene productos asociados.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
            <button onClick={() => setModalEliminar({ abierto: false, item: null })}
              className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border
                text-gray-500 dark:text-dark-text/60 rounded-lg hover:border-primary/40">
              cancelar
            </button>
            <button onClick={() => eliminar.mutate(modalEliminar.item.id)}
              disabled={eliminar.isPending}
              className="px-4 py-1.5 text-sm bg-red-500 hover:bg-red-600
                text-white rounded-lg transition-colors disabled:opacity-50">
              {eliminar.isPending ? 'eliminando...' : 'eliminar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function DetalleProductosMarca({ id }) {
  const { data } = useQuery({
    queryKey: ['marca-detalle', id],
    queryFn: () => api.get(`/marcas/${id}`).then(r => r.data.datos)
  })
  if (!data?.productos?.length) return null
  return (
    <div className="space-y-1 max-h-40 overflow-y-auto">
      {data.productos.map(p => (
        <div key={p.id} className="flex items-center justify-between text-xs
          p-2 rounded bg-light-bg dark:bg-dark-bg">
          <span className="text-light-text dark:text-dark-text">{p.nombre}</span>
          <div className="flex items-center gap-2">
            <span className="text-primary">{formatPrecio(p.precio)}</span>
            <span className={p.estado ? 'badge-activo' : 'badge-inactivo'}>
              {p.estado ? 'activo' : 'inactivo'}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}