import { Plus, Edit2, Eye, Trash2, ExternalLink } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import EstadoToggle from '@shared/components/EstadoToggle'
import { useMarcas, normalizarUrl } from '../hooks/useMarcas'
import MarcaForm    from '../components/MarcaForm'
import MarcaDetalle from '../components/MarcaDetalle'
import MarcaEliminar from '../components/MarcaEliminar'

export default function Marcas() {
  const {
    marcas, proveedores, form, errores,
    modal, modalDetalle, modalEliminar,
    setForm, setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal, handleSubmit, handleChange,
    toggleEstado, eliminar, guardando, eliminando, verificandoNombre,
  } = useMarcas()

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
    { key: 'estado', label: 'Estado', render: r => <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>{r.estado ? 'Activa' : 'Inactiva'}</span> },
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
          <EstadoToggle activo={fila.estado} onChange={() => toggleEstado.mutate(fila.id)} cargando={toggleEstado.isPending} />
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })} className="btn-ghost hover:text-red-400"><Trash2 size={14} /></button>
        </>)}
      />

      <MarcaForm modal={modal} form={form} setForm={setForm} errores={errores}
        handleChange={handleChange} handleSubmit={handleSubmit} cerrarModal={cerrarModal}
        guardando={guardando} proveedores={proveedores} verificandoNombre={verificandoNombre} />
      <MarcaDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle} abrirModal={abrirModal} />
      <MarcaEliminar modalEliminar={modalEliminar} setModalEliminar={setModalEliminar} eliminar={eliminar} eliminando={eliminando} />
    </div>
  )
}