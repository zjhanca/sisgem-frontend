import { Plus, Edit2, ToggleLeft, ToggleRight, Eye, Trash2, Download } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import { formatPrecio } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
import { useProductos } from '../hooks/useProductos'
import ProductoForm    from '../components/ProductoForm'
import ProductoDetalle from '../components/ProductoDetalle'
import ProductoEliminar from '../components/ProductoEliminar'
 
export default function Productos() {
  const {
    productos, categorias, proveedores, marcas,
    form, errores, modal, modalDetalle, modalEliminar,
    setForm, setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal, handleChange, handleSubmit,
    toggleEstado, eliminar, guardando, eliminando,
  } = useProductos()
 
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
    { key: 'estado',        label: 'Estado',    render: r => <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>{r.estado ? 'Activo' : 'Inactivo'}</span> },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Productos</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarPDF('/reportes/productos', 'reporte-productos.pdf')} className="btn-outline"><Download size={14} /> Reporte</button>
          <button onClick={() => abrirModal()} className="btn-primary"><Plus size={14} /> Nuevo Producto</button>
        </div>
      </div>
 
      <Tabla columnas={columnas} datos={productos}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost"><Edit2 size={14} /></button>
          <button onClick={() => toggleEstado.mutate(fila.id)} className={`btn-ghost ${fila.estado ? 'hover:text-red-400' : 'hover:text-green-400'}`}>
            {fila.estado ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })} className="btn-ghost hover:text-red-400"><Trash2 size={14} /></button>
        </>)}
      />
 
      <ProductoForm modal={modal} form={form} setForm={setForm} errores={errores}
        handleChange={handleChange} handleSubmit={handleSubmit} cerrarModal={cerrarModal}
        guardando={guardando} categorias={categorias} proveedores={proveedores} marcas={marcas} />
      <ProductoDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle} abrirModal={abrirModal} />
      <ProductoEliminar modalEliminar={modalEliminar} setModalEliminar={setModalEliminar} eliminar={eliminar} eliminando={eliminando} />
    </div>
  )
}
