import { Plus, Edit2, ToggleLeft, ToggleRight, Eye, MapPin, Download } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import { descargarPDF } from '@shared/utils/reportes'
import { useClientes } from '../hooks/useClientes'
import ClienteForm        from '../components/ClienteForm'
import ClienteDetalle     from '../components/ClienteDetalle'
import ClienteDirecciones from '../components/ClienteDirecciones'
import { formatFecha, formatPrecio } from '@shared/utils/validaciones'
 
export default function Clientes() {
  const {
    clientes, historial, direcciones,
    form, formDir, errores,
    modal, modalDetalle, modalDir,
    setModalDetalle, setModalDir, setFormDir,
    abrirModal, cerrarModal,
    handleChange, handleSubmit, handleSubmitDir,
    toggleEstado, guardando, guardandoDir,
  } = useClientes()
 
  const columnas = [
    { key: 'nombre',   label: 'Nombre', render: r => `${r.nombre} ${r.apellido}` },
    { key: 'numero_documento', label: 'Documento',
      render: r => r.numero_documento ? `${r.tipo_documento}: ${r.numero_documento}` : '—' },
    { key: 'email',    label: 'Correo',   render: r => r.email    || '—' },
    { key: 'telefono', label: 'Teléfono', render: r => r.telefono || '—' },
    { key: 'estado',   label: 'Estado',
      render: r => <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>{r.estado ? 'Activo' : 'Inactivo'}</span>
    },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Clientes</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarPDF('/reportes/clientes', 'reporte-clientes.pdf')} className="btn-outline">
            <Download size={14} /> Reporte
          </button>
          <button onClick={() => abrirModal()} className="btn-primary">
            <Plus size={14} /> Nuevo Cliente
          </button>
        </div>
      </div>
 
      <Tabla columnas={columnas} datos={clientes}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost" title="Ver detalle"><Eye size={14} /></button>
          <button onClick={() => setModalDir({ abierto: true, cliente: fila })} className="btn-ghost" title="Direcciones"><MapPin size={14} /></button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost" title="Editar"><Edit2 size={14} /></button>
          <button onClick={() => toggleEstado.mutate(fila.id)}
            className={`btn-ghost ${fila.estado ? 'hover:text-red-400' : 'hover:text-green-400'}`}>
            {fila.estado ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
        </>)}
      />
 
      <ClienteForm
        modal={modal} form={form} errores={errores}
        handleChange={handleChange} handleSubmit={handleSubmit}
        cerrarModal={cerrarModal} guardando={guardando}
      />
      <ClienteDetalle
        modalDetalle={modalDetalle} setModalDetalle={setModalDetalle}
        abrirModal={abrirModal} historial={historial}
      />
      <ClienteDirecciones
        modalDir={modalDir} setModalDir={setModalDir}
        direcciones={direcciones} formDir={formDir} setFormDir={setFormDir}
        handleSubmitDir={handleSubmitDir} guardandoDir={guardandoDir}
      />
    </div>
  )
}
