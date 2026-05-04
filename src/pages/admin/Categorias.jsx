import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import Tabla from '../../components/Tabla'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { Plus, Edit2, ToggleLeft, ToggleRight, Eye, Trash2 } from 'lucide-react'
import { formatFecha } from '../../utils/validaciones'

const formVacio = { nombre: '', descripcion: '' }

export default function Categorias() {
  const qc = useQueryClient()
  const [modal, setModal]               = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]                 = useState(formVacio)
  const [errores, setErrores]           = useState({})

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => api.get('/categorias').then(r => r.data.datos)
  })

  const guardar = useMutation({
    mutationFn: data => modal.item
      ? api.put(`/categorias/${modal.item.id}`, data)
      : api.post('/categorias', data),
    onSuccess: () => {
      qc.invalidateQueries(['categorias'])
      cerrarModal()
      toast.success('categoria guardada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })

  const toggleEstado = useMutation({
    mutationFn: id => api.patch(`/categorias/${id}/estado`),
    onSuccess: () => {
      qc.invalidateQueries(['categorias'])
      toast.success('estado actualizado')
    }
  })

  const eliminar = useMutation({
    mutationFn: id => api.delete(`/categorias/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['categorias'])
      setModalEliminar({ abierto: false, item: null })
      toast.success('categoria eliminada')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error al eliminar')
  })

  const abrirModal = (item = null) => {
    setForm(item ? { nombre: item.nombre, descripcion: item.descripcion || '' } : formVacio)
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
    { key: 'nombre',      label: 'Nombre' },
    { key: 'descripcion', label: 'Descripcion',
      render: r => r.descripcion || '-'
    },
    { key: 'created_at',  label: 'Creada',
      render: r => formatFecha(r.created_at)
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
        <h1 className="page-title">categorias</h1>
        <button onClick={() => abrirModal()} className="btn-primary">
          <Plus size={14} /> nueva
        </button>
      </div>

      <Tabla columnas={columnas} datos={categorias}
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
        titulo={modal.item ? 'editar categoria' : 'nueva categoria'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="campo-label">nombre *</label>
            <input value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`}
              placeholder="nombre de la categoria" />
            {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
          </div>
          <div>
            <label className="campo-label">descripcion</label>
            <textarea value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              rows={3} className="campo-input resize-none"
              placeholder="descripcion de la categoria" />
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
        titulo="detalles de la categoria">
        {modalDetalle.item && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="campo-label">nombre</p>
                <p className="text-light-text dark:text-dark-text font-medium">
                  {modalDetalle.item.nombre}
                </p>
              </div>
              <div>
                <p className="campo-label">estado</p>
                <span className={modalDetalle.item.estado ? 'badge-activo' : 'badge-inactivo'}>
                  {modalDetalle.item.estado ? 'activa' : 'inactiva'}
                </span>
              </div>
              <div className="col-span-2">
                <p className="campo-label">descripcion</p>
                <p className="text-light-text dark:text-dark-text">
                  {modalDetalle.item.descripcion || 'sin descripcion'}
                </p>
              </div>
              <div>
                <p className="campo-label">fecha creacion</p>
                <p className="text-light-text dark:text-dark-text">
                  {formatFecha(modalDetalle.item.created_at)}
                </p>
              </div>
              <div>
                <p className="campo-label">ultima actualizacion</p>
                <p className="text-light-text dark:text-dark-text">
                  {formatFecha(modalDetalle.item.updated_at)}
                </p>
              </div>
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
            estas seguro que deseas eliminar la categoria
            <span className="font-medium text-primary"> {modalEliminar.item?.nombre}</span>?
            los productos asociados quedaran sin categoria.
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