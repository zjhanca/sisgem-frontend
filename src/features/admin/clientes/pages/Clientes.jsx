import { Plus, Edit2, Eye, MapPin, Download } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import EstadoToggle from '@shared/components/EstadoToggle'
import { descargarPDF } from '@shared/utils/reportes'
import { useClientes } from '../hooks/useClientes'
import ClienteForm        from '../components/ClienteForm'
import ClienteDetalle     from '../components/ClienteDetalle'
import ClienteDirecciones from '../components/ClienteDirecciones'
 
export default function Clientes() {
  const {
    clientes, historial, direcciones,
    form, formDir, errores,
    modal, modalDetalle, modalDir,
    filtroEstado, setFiltroEstado,
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
    { key: 'permite_fiado', label: 'Fiado',
      render: r => r.permite_fiado
        ? <span className="badge-activo">Habilitado</span>
        : <span className="text-xs text-gray-400">—</span>
    },
    { key: 'estado', label: 'Estado',
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
 
      {/* filtro estado */}
      <div className="flex gap-2 mb-4 items-end">
        <div>
          <p className="campo-label mb-0.5">Estado</p>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="campo-input w-36 text-xs">
            <option value="">Todos</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
        {filtroEstado && (
          <button onClick={() => setFiltroEstado('')} className="btn-ghost text-xs text-red-400 self-end">
            Limpiar
          </button>
        )}
      </div>
 
      <Tabla columnas={columnas} datos={clientes}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost" title="Ver detalle">
            <Eye size={14} />
          </button>
          <button onClick={() => setModalDir({ abierto: true, cliente: fila })} className="btn-ghost" title="Direcciones">
            <MapPin size={14} />
          </button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost" title="Editar">
            <Edit2 size={14} />
          </button>
          <EstadoToggle
            activo={fila.estado}
            onChange={() => toggleEstado.mutate(fila.id)}
            cargando={toggleEstado.isPending}
          />
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
