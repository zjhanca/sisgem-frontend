import { useState } from 'react'
import { Plus, Edit2, ToggleLeft, ToggleRight, Eye, Trash2, Download } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import { formatPrecio } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
import { useProductos }    from '../hooks/useProductos'
import ProductoForm        from '../components/ProductoForm'
import ProductoDetalle     from '../components/ProductoDetalle'
import ProductoEliminar    from '../components/ProductoEliminar'
import ProductoStats       from '../components/ProductoStats'
import ProductoFiltros     from '../components/ProductoFiltros'
 
export default function Productos() {
  const {
    productos, categorias, proveedores, marcas,
    form, errores, modal, modalDetalle, modalEliminar,
    setForm, setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal, handleChange, handleSubmit,
    toggleEstado, eliminar, guardando, eliminando,
  } = useProductos()
 
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroEstado, setFiltroEstado]       = useState('')
  const [filtroStock, setFiltroStock]         = useState('')
 
  const productosFiltrados = productos.filter(p => {
    if (filtroCategoria && p.categoria_id !== +filtroCategoria) return false
    if (filtroEstado === 'activo'   && !p.estado)  return false
    if (filtroEstado === 'inactivo' &&  p.estado)  return false
    if (filtroStock  === 'bajo'     && !(p.stock <= 5 && p.stock > 0)) return false
    if (filtroStock  === 'sin'      && p.stock !== 0) return false
    return true
  })
 
  const columnas = [
    { key: 'imagen_url', label: 'Img',
      render: r => r.imagen_url
        ? <img src={r.imagen_url} alt="" className="w-8 h-8 object-cover rounded-lg" onError={e => e.target.style.display='none'} />
        : <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-xs text-primary/50">—</div>
    },
    { key: 'nombre',        label: 'Nombre' },
    { key: 'codigo_barras', label: 'Código',    render: r => <span className="font-mono text-xs">{r.codigo_barras || '—'}</span> },
    { key: 'categoria',     label: 'Categoría', render: r => r.categoria  || '—' },
    { key: 'marca',         label: 'Marca',     render: r => r.marca      || '—' },
    { key: 'precio',        label: 'Precio',    render: r => <span className="font-semibold text-primary">{formatPrecio(r.precio)}</span> },
    { key: 'stock', label: 'Stock',
      render: r => (
        <span className={`font-semibold ${r.stock === 0 ? 'text-red-500' : r.stock <= 5 ? 'text-orange-400' : ''}`}>
          {r.stock} {r.stock <= 5 && r.stock > 0 && <span className="text-xs ml-0.5">⚠</span>}
        </span>
      )
    },
    { key: 'estado', label: 'Estado',
      render: r => <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>{r.estado ? 'Activo' : 'Inactivo'}</span>
    },
  ]
 
  return (
    <div className="space-y-4">
 
      <div className="page-header">
        <h1 className="page-title">Productos</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarPDF('/reportes/productos', 'reporte-productos.pdf')} className="btn-outline">
            <Download size={14} /> Reporte
          </button>
          <button onClick={() => abrirModal()} className="btn-primary">
            <Plus size={14} /> Nuevo Producto
          </button>
        </div>
      </div>
 
      <ProductoStats
        productos={productos}
        filtroStock={filtroStock}
        setFiltroStock={setFiltroStock}
      />
 
      <ProductoFiltros
        categorias={categorias}
        filtroCategoria={filtroCategoria} setFiltroCategoria={setFiltroCategoria}
        filtroEstado={filtroEstado}       setFiltroEstado={setFiltroEstado}
        filtroStock={filtroStock}         setFiltroStock={setFiltroStock}
        totalFiltrados={productosFiltrados.length}
        total={productos.length}
      />
 
      <Tabla columnas={columnas} datos={productosFiltrados} sinBusqueda
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost" title="Ver detalle">
            <Eye size={14} />
          </button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost" title="Editar">
            <Edit2 size={14} />
          </button>
          <button onClick={() => toggleEstado.mutate(fila.id)}
            className={`btn-ghost ${fila.estado ? 'hover:text-red-400' : 'hover:text-green-400'}`}
            title={fila.estado ? 'Desactivar' : 'Activar'}>
            {fila.estado ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })}
            className="btn-ghost hover:text-red-400" title="Eliminar">
            <Trash2 size={14} />
          </button>
        </>)}
      />
 
      <ProductoForm
        modal={modal} form={form} setForm={setForm} errores={errores}
        handleChange={handleChange} handleSubmit={handleSubmit}
        cerrarModal={cerrarModal} guardando={guardando}
        categorias={categorias} proveedores={proveedores} marcas={marcas}
      />
      <ProductoDetalle
        modalDetalle={modalDetalle} setModalDetalle={setModalDetalle}
        abrirModal={abrirModal}
      />
      <ProductoEliminar
        modalEliminar={modalEliminar} setModalEliminar={setModalEliminar}
        eliminar={eliminar} eliminando={eliminando}
      />
    </div>
  )
}
 
 
