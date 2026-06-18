import { useState } from 'react'
import { Plus, Edit2, Eye, Trash2, Download } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import { formatPrecio } from '@shared/utils/validaciones'
import { useProductos } from '../hooks/useProductos'
import ProductoForm            from '../components/ProductoForm'
import ProductoDetalle         from '../components/ProductoDetalle'
import ProductoEliminar        from '../components/ProductoEliminar'
import ProductoConfirmEstado   from '../components/Productoconfirmestado'
import ProductoConfirmDescarga from '../components/Productoconfirmdescarga'

function SwitchEstado({ activo, onClick, labelActivo = 'Activo', labelInactivo = 'Inactivo' }) {
  return (
    <button type="button" onClick={e => { e.stopPropagation(); onClick() }}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium transition-colors cursor-pointer w-24 justify-center ${
        activo ? 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20' : 'bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200'
      }`}>
      <span className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors shrink-0 ${activo ? 'bg-primary' : 'bg-gray-300'}`}>
        <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform ${activo ? 'translate-x-3.5' : 'translate-x-0.5'}`} />
      </span>
      {activo ? labelActivo : labelInactivo}
    </button>
  )
}

export default function Productos() {
  const {
    productos, categorias, proveedores, marcas,
    form, errores, modal, modalDetalle, modalEliminar,
    setForm, setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal, handleChange, handleSubmit,
    toggleEstado, eliminar, guardando, eliminando, verificandoCodigo,
  } = useProductos()

  const [confirmToggle, setConfirmToggle] = useState(null)
  const [confirmDescarga, setConfirmDescarga] = useState(false)

  const columnas = [
    { key: 'imagen_url', label: 'Img',
      render: r => r.imagen_url
        ? <img src={r.imagen_url} alt="" className="w-8 h-8 object-cover rounded" onError={e => e.target.style.display='none'} />
        : <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center text-xs text-primary/50">—</div>
    },
    { key: 'nombre',        label: 'Nombre' },
    { key: 'codigo_barras', label: 'Código', render: r => <span className="font-mono text-xs">{r.codigo_barras || '—'}</span> },
    { key: 'categoria',     label: 'Categoría', render: r => r.categoria || '—' },
    { key: 'marca',         label: 'Marca',     render: r => r.marca || '—' },
    { key: 'precio',        label: 'Precio',    render: r => formatPrecio(r.precio) },
    { key: 'stock',         label: 'Stock',     render: r => <span className={r.stock <= 5 ? 'text-red-400 font-semibold' : ''}>{r.stock}</span> },
    { key: 'estado', label: 'Estado',
      render: r => r.stock <= 0
        ? <span className="badge-anulado">Sin stock</span>
        : <SwitchEstado activo={r.estado} labelActivo="Activo" labelInactivo="Inactivo"
            onClick={() => setConfirmToggle({ id: r.id, nombre: r.nombre, estadoActual: r.estado })} />
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Productos</h1>
        <div className="flex gap-2">
          <button onClick={() => setConfirmDescarga(true)} className="btn-outline">
            <Download size={14} /> Reporte
          </button>
          <button onClick={() => abrirModal()} className="btn-primary"><Plus size={14} /> Nuevo Producto</button>
        </div>
      </div>

      <Tabla columnas={columnas} datos={productos}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost"><Edit2 size={14} /></button>
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })} className="btn-ghost hover:text-red-400"><Trash2 size={14} /></button>
        </>)}
      />

      <ProductoForm modal={modal} form={form} setForm={setForm} errores={errores}
        handleChange={handleChange} handleSubmit={handleSubmit} cerrarModal={cerrarModal}
        guardando={guardando} categorias={categorias} marcas={marcas} verificandoCodigo={verificandoCodigo} />
      <ProductoDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle} abrirModal={abrirModal} />
      <ProductoEliminar modalEliminar={modalEliminar} setModalEliminar={setModalEliminar} eliminar={eliminar} eliminando={eliminando} />
      <ProductoConfirmEstado confirmToggle={confirmToggle} setConfirmToggle={setConfirmToggle} toggleEstado={toggleEstado} />
      <ProductoConfirmDescarga abierto={confirmDescarga} setAbierto={setConfirmDescarga} />
    </div>
  )
}