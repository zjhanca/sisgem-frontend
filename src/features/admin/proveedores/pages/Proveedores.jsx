import { Plus, Edit2, ToggleLeft, ToggleRight, Eye, Trash2, Download } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import { descargarPDF } from '@shared/utils/reportes'
import { useProveedores } from '../hooks/useProveedores'
import ProveedorForm    from '../components/ProveedorForm'
import ProveedorDetalle from '../components/ProveedorDetalle'
import ProveedorEliminar from '../components/ProveedorEliminar'
 
export default function Proveedores() {
  const {
    proveedores, form, errores,
    modal, modalDetalle, modalEliminar,
    setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal, handleChange, handleSubmit,
    toggleEstado, eliminar, guardando, eliminando,
  } = useProveedores()
 
  const columnas = [
    { key: 'nombre',         label: 'Nombre' },
    { key: 'tipo_documento', label: 'Tipo Doc' },
    { key: 'documento',      label: 'Documento' },
    { key: 'telefono',       label: 'Teléfono', render: r => r.telefono || '—' },
    { key: 'email',          label: 'Correo',   render: r => r.email    || '—' },
    { key: 'estado', label: 'Estado',
      render: r => <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>{r.estado ? 'Activo' : 'Inactivo'}</span>
    },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Proveedores</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarPDF('/reportes/proveedores', 'reporte-proveedores.pdf')} className="btn-outline">
            <Download size={14} /> Reporte
          </button>
          <button onClick={() => abrirModal()} className="btn-primary"><Plus size={14} /> Nuevo Proveedor</button>
        </div>
      </div>
 
      <Tabla columnas={columnas} datos={proveedores}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost"><Edit2 size={14} /></button>
          <button onClick={() => toggleEstado.mutate(fila.id)}
            className={`btn-ghost ${fila.estado ? 'hover:text-red-400' : 'hover:text-green-400'}`}>
            {fila.estado ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })} className="btn-ghost hover:text-red-400"><Trash2 size={14} /></button>
        </>)}
      />
 
      <ProveedorForm modal={modal} form={form} errores={errores}
        handleChange={handleChange} handleSubmit={handleSubmit} cerrarModal={cerrarModal} guardando={guardando} />
      <ProveedorDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle} abrirModal={abrirModal} toggleEstado={toggleEstado} />
      <ProveedorEliminar modalEliminar={modalEliminar} setModalEliminar={setModalEliminar} eliminar={eliminar} eliminando={eliminando} />
    </div>
  )
}
