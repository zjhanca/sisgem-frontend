import { useState } from 'react'
import { Plus, Edit2, Eye, Trash2, Download } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
import { formatPrecio } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
import { useProductos } from '../hooks/useProductos'
import ProductoForm     from '../components/ProductoForm'
import ProductoDetalle  from '../components/ProductoDetalle'
import ProductoEliminar from '../components/ProductoEliminar'

export default function Productos() {
  const {
    productos, categorias, proveedores, marcas,
    form, errores, modal, modalDetalle, modalEliminar,
    setForm, setModalDetalle, setModalEliminar,
    abrirModal, cerrarModal, handleChange, handleSubmit,
    toggleEstado, eliminar, guardando, eliminando, verificandoCodigo,
  } = useProductos()

  const [confirmToggle, setConfirmToggle] = useState(null)

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
      render: r => (
        <span className="inline-block w-16 text-center">
          {r.stock <= 0
            ? <span className="badge-anulado">Sin stock</span>
            : <span className={r.estado ? 'badge-activo' : 'badge-inactivo'}>{r.estado ? 'Activo' : 'Inactivo'}</span>
          }
        </span>
      )
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Productos</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarPDF('/reportes/productos', 'reporte-productos.pdf')} className="btn-outline">
            <Download size={14} /> Reporte
          </button>
          <button onClick={() => abrirModal()} className="btn-primary"><Plus size={14} /> Nuevo Producto</button>
        </div>
      </div>

      <Tabla columnas={columnas} datos={productos}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, item: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => abrirModal(fila)} className="btn-ghost"><Edit2 size={14} /></button>
          {fila.stock > 0 && (
            <button
              onClick={() => setConfirmToggle({ id: fila.id, nombre: fila.nombre, estadoActual: fila.estado })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 shrink-0 ${fila.estado ? 'bg-primary' : 'bg-gray-300'}`}
              title={fila.estado ? 'Desactivar' : 'Activar'}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${fila.estado ? 'translate-x-4' : 'translate-x-1'}`} />
            </button>
          )}
          <button onClick={() => setModalEliminar({ abierto: true, item: fila })} className="btn-ghost hover:text-red-400"><Trash2 size={14} /></button>
        </>)}
      />

      <ProductoForm modal={modal} form={form} setForm={setForm} errores={errores}
        handleChange={handleChange} handleSubmit={handleSubmit} cerrarModal={cerrarModal}
        guardando={guardando} categorias={categorias} marcas={marcas} verificandoCodigo={verificandoCodigo} />
      <ProductoDetalle modalDetalle={modalDetalle} setModalDetalle={setModalDetalle} abrirModal={abrirModal} />
      <ProductoEliminar modalEliminar={modalEliminar} setModalEliminar={setModalEliminar} eliminar={eliminar} eliminando={eliminando} />

      <Modal abierto={!!confirmToggle} onCerrar={() => setConfirmToggle(null)} bloquearCierre
        titulo={confirmToggle?.estadoActual ? 'Desactivar Producto' : 'Activar Producto'} ancho="max-w-sm">
        {confirmToggle && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              ¿Estás seguro que deseas <span className="font-semibold text-light-text">{confirmToggle.estadoActual ? 'desactivar' : 'activar'}</span> el producto{' '}
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