import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@shared/services/api'
import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
import toast from 'react-hot-toast'
import { Plus, Edit2, ToggleLeft, ToggleRight, Eye, MapPin, Download } from 'lucide-react'
import { formatFecha, formatPrecio } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
 
const formVacio  = { nombre: '', apellido: '', email: '', telefono: '', tipo_documento: 'CC', numero_documento: '' }
const dirVacio   = { direccion: '', barrio: '', indicaciones: '' }
 
export default function Clientes() {
  const qc = useQueryClient()
  const [modal, setModal]               = useState({ abierto: false, item: null })
  const [modalDetalle, setModalDetalle] = useState({ abierto: false, item: null })
  const [modalDir, setModalDir]         = useState({ abierto: false, cliente: null })
  const [form, setForm]     = useState(formVacio)
  const [formDir, setFormDir] = useState(dirVacio)
  const [errores, setErrores] = useState({})
 
  const { data: clientes = [] } = useQuery({ queryKey: ['clientes'], queryFn: () => api.get('/clientes').then(r => r.data.datos) })
  const { data: direcciones = [], refetch: refetchDir } = useQuery({
    queryKey: ['dirs-cliente', modalDir.cliente?.id],
    queryFn: () => api.get(`/clientes/${modalDir.cliente?.id}/direcciones`).then(r => r.data.datos),
    enabled: !!modalDir.cliente?.id
  })
  const { data: historial = [] } = useQuery({
    queryKey: ['historial-cliente', modalDetalle.item?.id],
    queryFn: () => api.get(`/pedidos?cliente_id=${modalDetalle.item?.id}`).then(r => r.data.datos),
    enabled: !!modalDetalle.item?.id
  })
 
  const guardar = useMutation({
    mutationFn: data => modal.item ? api.put(`/clientes/${modal.item.id}`, data) : api.post('/clientes', data),
    onSuccess: () => { qc.invalidateQueries(['clientes']); cerrarModal(); 	oast.success('Cliente guardado') },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
  const guardarDir = useMutation({
    mutationFn: data => api.post(`/clientes/${modalDir.cliente.id}/direcciones`, data),
    onSuccess: () => { refetchDir(); setFormDir(dirVacio); 	oast.success('Direccion guardada') },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })
  const toggleEstado = useMutation({
    mutationFn: id => api.patch(`/clientes/${id}/estado`),
    onSuccess: () => { qc.invalidateQueries(['clientes']); 	oast.success('Estado actualizado') }
  })
 
  const abrirModal = (item = null) => {
    setForm(item ? {
      nombre: item.nombre, apellido: item.apellido,
      email: item.email || '', telefono: item.telefono || '',
      tipo_documento: item.tipo_documento || 'CC',
      numero_documento: item.numero_documento || ''
    } : formVacio)
    setErrores({})
    setModal({ abierto: true, item })
  }
  const cerrarModal = () => setModal({ abierto: false, item: null })
 
  const validar = () => {
    const e = {}
    if (!form.nombre.trim())   e.nombre   = 'nombre obligatorio'
    if (!form.apellido.trim()) e.apellido = 'apellido obligatorio'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'correo invalido'
    return e
  }
 
  const handleSubmit = e => {
    e.preventDefault()
    const e2 = validar()
    if (Object.keys(e2).length) { setErrores(e2); return }
    guardar.mutate(form)
  }
 
  const handleSubmitDir = e => {
    e.preventDefault()
    if (!formDir.direccion.trim()) { toast.error('la direccion es obligatoria'); return }
    guardarDir.mutate(formDir)
  }
 
  const columnas = [
    { key: 'nombre',   label: 'Nombre', render: r => `${r.nombre} ${r.apellido}` },
    { key: 'numero_documento', label: 'Documento',
      render: r => r.numero_documento ? `${r.tipo_documento}: ${r.numero_documento}` : '-'
    },
    { key: 'email',    label: 'Correo',   render: r => r.email    || '-' },
    { key: 'telefono', label: 'Telefono', render: r => r.telefono || '-' },
    { key: 'estado', label: 'Estado',
      render: r => <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>{r.estado ? 'activo' : 'inactivo'}</span>
    },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Clientes</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarPDF('/reportes/clientes', 'reporte-clientes.pdf')} className="btn-outline">
            <Download size={14} /> Reporte</button>
          <button onClick={() => abrirModal()} className="btn-primary"><Plus size={14} /> nuevo cliente</button>
        </div>
      </div>
 
      <Tabla columnas={columnas} datos={clientes}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => setModalDir({ abierto: true, cliente: fila })} className="btn-ghost" title="direcciones">
            <MapPin size={14} /></button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost"><Edit2 size={14} /></button>
          <button onClick={() => toggleEstado.mutate(fila.id)}
            className={`btn-ghost ${fila.estado ? 'hover:text-red-400' : 'hover:text-green-400'}`}>
            {fila.estado ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
        </>)}
      />
 
      {/* MODAL CREAR/EDITAR */}
      <Modal abierto={modal.abierto} onCerrar={cerrarModal}
        titulo={modal.item ? 'editar cliente' : 'nuevo cliente'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="campo-label">nombre *</label>
              <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
                className={`campo-input ${errores.nombre ? 'border-red-400' : ''}`} />
              {errores.nombre && <p className="campo-error">{errores.nombre}</p>}
            </div>
            <div>
              <label className="campo-label">apellido *</label>
              <input value={form.apellido} onChange={e => setForm({ ...form, apellido: e.target.value })}
                className={`campo-input ${errores.apellido ? 'border-red-400' : ''}`} />
              {errores.apellido && <p className="campo-error">{errores.apellido}</p>}
            </div>
            <div>
              <label className="campo-label">tipo documento</label>
              <select value={form.tipo_documento} onChange={e => setForm({ ...form, tipo_documento: e.target.value })} className="campo-input">
                <option value="CC">Cedula (CC)</option>
                <option value="CE">Cedula extranjeria (CE)</option>
                <option value="TI">Tarjeta identidad (TI)</option>
                <option value="PA">Pasaporte (PA)</option>
                <option value="NIT">NIT</option>
              </select>
            </div>
            <div>
              <label className="campo-label">numero documento</label>
              <input value={form.numero_documento} onChange={e => setForm({ ...form, numero_documento: e.target.value })}
                className="campo-input" placeholder="Ej: 1234567890" />
            </div>
            <div>
              <label className="campo-label">correo</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                className={`campo-input ${errores.email ? 'border-red-400' : ''}`} placeholder="Correo@ejemplo.com" />
              {errores.email && <p className="campo-error">{errores.email}</p>}
            </div>
            <div>
              <label className="campo-label">telefono</label>
              <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })}
                className="campo-input" placeholder="Ej: 3001234567" />
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
 
      {/* MODAL DETALLE */}
      <Modal abierto={modalDetalle.abierto} onCerrar={() => setModalDetalle({ abierto: false, item: null })}
        titulo="detalles del cliente" ancho="max-w-lg">
        {modalDetalle.item && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="campo-label">nombre</p>
                <p className="font-medium">{modalDetalle.item.nombre} {modalDetalle.item.apellido}</p></div>
              <div><p className="campo-label">estado</p>
                <span className={modalDetalle.item.estado ? 'badge-activo' : 'badge-inactivo'}>
                  {modalDetalle.item.estado ? 'activo' : 'inactivo'}</span></div>
              <div><p className="campo-label">documento</p>
                <p>{modalDetalle.item.tipo_documento}: {modalDetalle.item.numero_documento || '-'}</p></div>
              <div><p className="campo-label">telefono</p><p>{modalDetalle.item.telefono || '-'}</p></div>
              <div className="col-span-2"><p className="campo-label">correo</p>
                <p>{modalDetalle.item.email || '-'}</p></div>
            </div>
            <div>
              <p className="campo-label mb-2">historial de pedidos ({historial.length})</p>
              {historial.length === 0
                ? <p className="text-xs text-center text-gray-400 py-3">Sin Pedidos</p>
                : (
                  <div className="space-y-1 max-h-36 overflow-y-auto">
                    {historial.map(p => (
                      <div key={p.id} className="flex justify-between text-xs p-2 rounded bg-light-bg dark:bg-dark-bg">
                        <div>
                          <span className="font-medium">#{p.id}</span>
                          <span className="text-gray-400 ml-2">{formatFecha(p.fecha_pedido)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-primary">{formatPrecio(p.total)}</span>
                          <span className="badge-pendiente text-xs">{p.estado}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              }
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
              <button onClick={() => { setModalDetalle({ abierto: false, item: null }); abrirModal(modalDetalle.item) }}
                className="btn-outline text-xs"><Edit2 size={12} /> Editar</button>
            </div>
          </div>
        )}
      </Modal>
 
      {/* MODAL DIRECCIONES */}
      <Modal abierto={modalDir.abierto} onCerrar={() => setModalDir({ abierto: false, cliente: null })}
        titulo={`direcciones — ${modalDir.cliente?.nombre || ''} ${modalDir.cliente?.apellido || ''}`} ancho="max-w-lg">
        <div className="space-y-4">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {direcciones.length === 0 && <p className="text-xs text-center text-gray-400 py-4">sin direcciones</p>}
            {direcciones.map(d => (
              <div key={d.id} className="p-3 rounded-lg border border-gray-200 dark:border-dark-border">
                <p className="text-sm font-medium">{d.direccion}</p>
                {d.barrio && <p className="text-xs text-gray-400 mt-0.5">Barrio: {d.barrio}</p>}
                {d.indicaciones && <p className="text-xs text-gray-400 italic mt-0.5">{d.indicaciones}</p>}
              </div>
            ))}
          </div>
          <form onSubmit={handleSubmitDir} className="space-y-2 pt-3 border-t border-gray-200 dark:border-dark-border">
            <p className="text-xs font-medium">agregar nueva direccion</p>
            <input value={formDir.direccion} onChange={e => setFormDir({ ...formDir, direccion: e.target.value })}
              className="campo-input" placeholder="Dirección completa *" />
            <div className="grid grid-cols-2 gap-2">
              <input value={formDir.barrio} onChange={e => setFormDir({ ...formDir, barrio: e.target.value })}
                className="campo-input" placeholder="Barrio" />
              <input value={formDir.indicaciones} onChange={e => setFormDir({ ...formDir, indicaciones: e.target.value })}
                className="campo-input" placeholder="Indicaciones" />
            </div>
            <button type="submit" disabled={guardarDir.isPending} className="btn-primary w-full justify-center">
              {guardarDir.isPending ? 'Guardando...' : 'agregar direccion'}
            </button>
          </form>
        </div>
      </Modal>
    </div>
  )
}
 
