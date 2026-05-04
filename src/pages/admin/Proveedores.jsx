import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import Tabla from '../../components/Tabla'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { Plus, Edit2, ToggleLeft, ToggleRight, Download, Eye, Trash2 } from 'lucide-react'
import { descargarPDF } from '../../utils/reportes'
 
const formVacio = {
  tipo_persona: 'juridica', tipo_documento: 'NIT',
  documento: '', nombre: '', contacto: '',
  telefono: '', email: '', direccion: ''
}
 
export default function Proveedores() {
  const qc = useQueryClient()
  const [modal, setModal]               = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, item: null })
  const [modalEliminar, setModalEliminar] = useState({ abierto: false, item: null })
  const [form, setForm]                 = useState(formVacio)
  const [errores, setErrores]           = useState({})
 
  const { data: proveedores = [] } = useQuery({
    queryKey: ['proveedores'],
    queryFn: () => api.get('/proveedores').then(r => r.data.datos)
  })
 
  const guardar = useMutation({
    mutationFn: data => modal.item
      ? api.put(`/proveedores/${modal.item.id}`, data)
      : api.post('/proveedores', data),
    onSuccess: () => {
      qc.invalidateQueries(['proveedores'])
      cerrarModal()
      toast.success('proveedor guardado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
 
  const toggleEstado = useMutation({
    mutationFn: id => api.patch(`/proveedores/${id}/estado`),
    onSuccess: () => {
      qc.invalidateQueries(['proveedores'])
      toast.success('estado actualizado')
    }
  })
 
  const eliminar = useMutation({
    mutationFn: id => api.delete(`/proveedores/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(['proveedores'])
      setModalEliminar({ abierto: false, item: null })
      toast.success('proveedor eliminado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error al eliminar')
  })
 
  const abrirModal = (item = null) => {
    setForm(item ? { ...item } : formVacio)
    setErrores({})
    setModal({ abierto: true, item })
  }
 
  const cerrarModal = () => setModal({ abierto: false, item: null })
 
  const validar = () => {
    const e = {}
    if (!form.nombre.trim())    e.nombre    = 'el nombre es obligatorio'
    if (!form.documento.trim()) e.documento = 'el documento es obligatorio'
    return e
  }
 
  const handleSubmit = e => {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length) { setErrores(e2); return }
    guardar.mutate(form)
  }
 
  const columnas = [
    { key: 'nombre',        label: 'Nombre' },
    { key: 'tipo_documento',label: 'Tipo doc' },
    { key: 'documento',     label: 'Documento' },
    { key: 'telefono',      label: 'Telefono' },
    { key: 'email',         label: 'Correo' },
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
        <h1 className="page-title">proveedores</h1>
        <div className="flex gap-2">
          <button
            onClick={() => descargarPDF('/reportes/proveedores', 'reporte-proveedores.pdf')}
            className="btn-outline">
            <Download size={14} /> reporte
          </button>
          <button onClick={() => abrirModal()} className="btn-primary">
            <Plus size={14} /> nuevo
          </button>
        </div>
      </div>
 
      <Tabla columnas={columnas} datos={proveedores}
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
        titulo={modal.item ? 'editar proveedor' : 'nuevo proveedor'}
        ancho="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="campo-label">tipo persona</label>
              <select value={form.tipo_persona}
                onChange={e => setForm({ ...form, tipo_persona: e.target.value })}
                className="campo-input">
                <option value="juridica">juridica</option>
                <option value="natural">natural</option>
              </select>
            </div>
            <div>
              <label className="campo-label">tipo documento</label>
              <select value={form.tipo_documento}
                onChange={e => setForm({ ...form, tipo_documento: e.target.value })}
                className="campo-input">
                <option value="NIT">NIT</option>
                <option value="CC">cedula</option>
                <option value="CE">cedula extranjeria</option>
              </select>
            </div>
            <div>
              <label className="campo-label">documento *</label>
              <input value={form.documento}
                onChange={e => setForm({ ...form, documento: e.target.value })}
                className={`campo-input ${errores.documento ? 'border-red-400' : ''}`}
                placeholder="ej: 900123456" />
              {errores.documento && <p className="campo-error">{errores.documento}</p>}
            </div>
            <div>
              <label className="campo-label">contacto</label>
              <input value={form.contacto}
                onChange={e => setForm({ ...form, contacto: e.target.value })}
                className="campo-input" placeholder="nombre del contacto" />
            </div>
            <div className="col-span-2">
              <label className="campo-label">razon social *</label>
              <input value={form.nombre}
                onChange={e => setForm({ ...form, nombre: e.target.value })}
                className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`}
                placeholder="nombre o razon social" />
              {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
            </div>
            <div>
              <label className="campo-label">telefono</label>
              <input value={form.telefono}
                onChange={e => setForm({ ...form, telefono: e.target.value })}
                className="campo-input" placeholder="ej: 3001234567" />
            </div>
            <div>
              <label className="campo-label">correo</label>
              <input type="email" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                className="campo-input" placeholder="correo@ejemplo.com" />
            </div>
            <div className="col-span-2">
              <label className="campo-label">direccion</label>
              <input value={form.direccion}
                onChange={e => setForm({ ...form, direccion: e.target.value })}
                className="campo-input" placeholder="direccion del proveedor" />
            </div>
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
        titulo="detalles del proveedor">
        {modalDetalle.item && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="campo-label">razon social</p>
                <p className="text-light-text dark:text-dark-text font-medium">
                  {modalDetalle.item.nombre}
                </p>
              </div>
              <div>
                <p className="campo-label">estado</p>
                <span className={modalDetalle.item.estado ? 'badge-activo' : 'badge-inactivo'}>
                  {modalDetalle.item.estado ? 'activo' : 'inactivo'}
                </span>
              </div>
              <div>
                <p className="campo-label">tipo persona</p>
                <p className="text-light-text dark:text-dark-text">
                  {modalDetalle.item.tipo_persona}
                </p>
              </div>
              <div>
                <p className="campo-label">documento</p>
                <p className="text-light-text dark:text-dark-text">
                  {modalDetalle.item.tipo_documento}: {modalDetalle.item.documento}
                </p>
              </div>
              <div>
                <p className="campo-label">contacto</p>
                <p className="text-light-text dark:text-dark-text">
                  {modalDetalle.item.contacto || '-'}
                </p>
              </div>
              <div>
                <p className="campo-label">telefono</p>
                <p className="text-light-text dark:text-dark-text">
                  {modalDetalle.item.telefono || '-'}
                </p>
              </div>
              <div>
                <p className="campo-label">correo</p>
                <p className="text-light-text dark:text-dark-text">
                  {modalDetalle.item.email || '-'}
                </p>
              </div>
              <div>
                <p className="campo-label">direccion</p>
                <p className="text-light-text dark:text-dark-text">
                  {modalDetalle.item.direccion || '-'}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
              <button onClick={() => {
                setModalDetalle({ abierto: false, item: null })
                abrirModal(modalDetalle.item)
              }} className="btn-outline text-xs">
                <Edit2 size={12} /> editar
              </button>
              <button onClick={() => toggleEstado.mutate(modalDetalle.item.id)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  modalDetalle.item.estado
                    ? 'border-red-400/40 text-red-400 hover:bg-red-400/10'
                    : 'border-primary/40 text-primary hover:bg-primary/10'
                }`}>
                {modalDetalle.item.estado ? 'desactivar' : 'activar'}
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
            estas seguro que deseas eliminar el proveedor
            <span className="font-medium text-primary"> {modalEliminar.item?.nombre}</span>?
            esta accion no se puede deshacer.
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
