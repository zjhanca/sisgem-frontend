import { useState } from 'react'
import { Plus, Edit2, Eye, Trash2, ExternalLink } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
import { useMarcas, normalizarUrl } from '../hooks/useMarcas'
import MarcaForm     from '../components/MarcaForm'
import MarcaDetalle  from '../components/MarcaDetalle'
import MarcaEliminar from '../components/MarcaEliminar'

export default function Marcas() {
  const {
    marcas, proveedores, form, errores,
    modal, modalDetalle, modalEliminar,
    setForm, setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal, handleSubmit, handleChange,
    toggleEstado, eliminar, guardando, eliminando, verificandoNombre,
  } = useMarcas()

  const [confirmToggle, setConfirmToggle] = useState(null)

  const columnas = [
    { key: 'logo', label: 'Logo',
      render: r => r.logo
        ? <img src={r.logo} alt="" className="w-8 h-8 object-contain rounded" onError={e => e.target.style.display='none'} />
        : <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-xs font-bold text-primary">
            {r.nombre?.charAt(0).toUpperCase()}
          </div>
    },
    { key: 'nombre',    label: 'Nombre' },
    { key: 'proveedor', label: 'Proveedor', render: r => r.proveedor || '—' },
    { key: 'sitio_web', label: 'Sitio Web',
      render: r => r.sitio_web
        ? <a href={normalizarUrl(r.sitio_web)} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-primary text-xs flex items-center gap-1 hover:underline">
            <ExternalLink size={11} /> Ver
          </a>
        : '—'
    },
    { key: 'total_productos', label: 'Productos', render: r => <span className="badge-proceso">{r.total_productos}</span> },
    { key: 'estado', label: 'Estado',
      render: r => (
        <span className="inline-block w-16 text-center">
          <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>{r.estado ? 'Activa' : 'Inactiva'}</span>
        </span>
      )
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Marcas</h1>
        <button onClick={() => abrirModal()} className="btn-primary"><Plus size={14} /> Nueva Marca</button>
      </div>

      <Tabla columnas={columnas} datos={marcas}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost"><Edit2 size={14} /></button>
          <button
            onClick={() => setConfirmToggle({ id: fila.id, nombre: fila.nombre, estadoActual: fila.estado })}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 shrink-0 ${fila.estado ? 'bg-primary' : 'bg-gray-300'}`}
            title={fila.estado ? 'Desactivar' : 'Activar'}>
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${fila.estado ? 'translate-x-4' : 'translate-x-1'}`} />
          </button>
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })} className="btn-ghost hover:text-red-400"><Trash2 size={14} /></button>
        </>)}
      />

      <MarcaForm modal={modal} form={form} setForm={setForm} errores={errores}
        handleChange={handleChange} handleSubmit={handleSubmit} cerrarModal={cerrarModal}
        guardando={guardando} proveedores={proveedores} verificandoNombre={verificandoNombre} />
      <MarcaDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle} abrirModal={abrirModal} />
      <MarcaEliminar modalEliminar={modalEliminar} setModalEliminar={setModalEliminar} eliminar={eliminar} eliminando={eliminando} />

      <Modal abierto={!!confirmToggle} onCerrar={() => setConfirmToggle(null)} bloquearCierre
        titulo={confirmToggle?.estadoActual ? 'Desactivar Marca' : 'Activar Marca'} ancho="max-w-sm">
        {confirmToggle && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              ¿Estás seguro que deseas <span className="font-semibold text-light-text">{confirmToggle.estadoActual ? 'desactivar' : 'activar'}</span> la marca{' '}
              <span className="font-semibold text-primary">{confirmToggle.nombre}</span>?
            </p>
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button onClick={() => { toggleEstado.mutate(confirmToggle.id); setConfirmToggle(null) }}
                className={`px-4 py-1.5 text-sm rounded-lg text-white ${confirmToggle.estadoActual ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-mid'}`}>
                Sí, {confirmToggle.estadoActual ? 'desactivar' : 'activar'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}