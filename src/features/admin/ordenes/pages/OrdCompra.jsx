import { useState } from 'react'
import { Plus, Eye, Download, XCircle, AlertTriangle, Edit2 } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
import { formatPrecio, formatFecha } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
import { useOrdenes } from '../hooks/useOrdenes'
import OrdenForm    from '../components/OrdenForm'
import OrdenDetalle from '../components/OrdenDetalle'
import ProductoForm from '../../productos/components/ProductoForm'
import { useProductos } from '../../productos/hooks/useProductos'

const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Crédito']

const getBadgeOrden = nombre => {
  if (!nombre) return { clase: 'badge-pendiente', label: 'Pendiente' }
  const l = nombre.toLowerCase()
  if (l.includes('anula'))   return { clase: 'badge-anulado',  label: 'Anulado' }
  if (l.includes('complet')) return { clase: 'badge-activo',   label: 'Completado' }
  return { clase: 'badge-pendiente', label: 'Pendiente' }
}

export default function OrdCompra() {
  const {
    ordenesFiltradas, proveedores, productos, ordenesVencidas,
    modalNuevo, modalDetalle, modalEditar, modalAnular,
    filtroEstado, filtroProveedor,
    setModalNuevo, setModalDetalle, setModalEditar, setModalAnular,
    setFiltroEstado, setFiltroProveedor,
    form, setForm, formEditar, setFormEditar, itemForm, setItemForm,
    facturaPreview, handleFacturaChange,
    prodBusqueda, prodsFiltrados, provBusqueda, provsFiltrados, provSeleccionado,
    buscarProveedor, buscarProducto, buscarPorCodigo, agregarItem, quitarItem,
    setProvSeleccionado, setProvBusqueda, setProdBusqueda, setProdsFiltrados,
    totalOrden, handleCrear, handleEditar, abrirEditar,
    cambiarEstado, anular,
    ESTADOS_ORDEN, getEstadoId, getKeyEstado,
    creando, editando, anulando,
  } = useOrdenes()

  // hook de productos para el modal de crear producto rápido
  const {
    modal: modalProd, form: formProd, setForm: setFormProd, errores: erroresProd,
    handleChange: handleChangeProd, handleSubmit: handleSubmitProd,
    cerrarModal: cerrarModalProd, guardando: guardandoProd,
    categorias, marcas, verificandoCodigo, abrirModal: abrirModalProd,
  } = useProductos()

  const [modalCrearProd, setModalCrearProd] = useState(false)

  const columnas = [
    { key: 'id',           label: '#' },
    { key: 'proveedor',    label: 'Proveedor' },
    { key: 'fecha_compra', label: 'Fecha', render: r => formatFecha(r.fecha_compra || r.created_at) },
    { key: 'metodo_pago',  label: 'Método', render: r => r.metodo_pago || '—' },
    { key: 'total',        label: 'Total',  render: r => formatPrecio(r.total) },
    { key: 'estado', label: 'Estado',
      render: r => {
        const esAnulada = r.estado?.toLowerCase().includes('anula')
        const esCompletada = r.estado?.toLowerCase().includes('complet')
        if (esAnulada) return <span className="badge-anulado">Anulado</span>
        return (
          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <button type="button"
              disabled={!esCompletada}
              onClick={() => {
                const id = getEstadoId('pendiente')
                if (id) cambiarEstado.mutate({ id: r.id, estado_id: id })
              }}
              className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-all ${
                !esCompletada
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-500 cursor-default'
                  : 'border-gray-200 dark:border-dark-border text-gray-400 hover:border-amber-400/40 hover:text-amber-500'
              }`}>
              Pendiente
            </button>
            <button type="button"
              disabled={esCompletada}
              onClick={() => {
                const id = getEstadoId('activo')
                if (id) cambiarEstado.mutate({ id: r.id, estado_id: id })
              }}
              className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-all ${
                esCompletada
                  ? 'bg-primary/20 border-primary/40 text-primary cursor-default'
                  : 'border-gray-200 dark:border-dark-border text-gray-400 hover:border-primary/40 hover:text-primary'
              }`}>
              Completado
            </button>
          </div>
        )
      }
    },
  ]

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Órdenes de Compra</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarPDF('/reportes/ordenes', 'reporte-ordenes.pdf')} className="btn-outline">
            <Download size={14} /> Reporte
          </button>
<button onClick={() => setModalNuevo(true)} className="btn-primary">
            <Plus size={14} /> Nueva Orden
          </button>
        </div>
      </div>

      {ordenesVencidas > 0 && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">
            <span className="font-semibold">{ordenesVencidas}</span> orden{ordenesVencidas > 1 ? 'es' : ''} con factura vencida
          </p>
          <button onClick={() => setFiltroEstado('vencida')} className="ml-auto text-xs text-red-500 hover:underline">Ver vencidas →</button>
        </div>
      )}

      <div className="flex gap-2 mb-4 flex-wrap items-end">
        <div>
          <p className="campo-label mb-0.5">Estado</p>
          <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="campo-input w-44 text-xs">
            <option value="">Todos los estados</option>
            {ESTADOS_ORDEN.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
          </select>
        </div>
        <div>
          <p className="campo-label mb-0.5">Proveedor</p>
          <select value={filtroProveedor} onChange={e => setFiltroProveedor(e.target.value)} className="campo-input w-44 text-xs">
            <option value="">Todos los proveedores</option>
            {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </div>
        {(filtroEstado || filtroProveedor) && (
          <button onClick={() => { setFiltroEstado(''); setFiltroProveedor('') }}
            className="btn-ghost text-xs text-red-400 self-end">Limpiar</button>
        )}
      </div>

      <Tabla columnas={columnas} datos={ordenesFiltradas}
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, orden: fila })} className="btn-ghost" title="Ver detalle"><Eye size={14} /></button>
          <button onClick={() => abrirEditar(fila)} className="btn-ghost" title="Editar" disabled={getKeyEstado(fila.estado) === 'anulado'}><Edit2 size={14} /></button>
          <button onClick={() => descargarPDF(`/reportes/ordenes/${fila.id}`, `orden-${fila.id}.pdf`)} className="btn-ghost"><Download size={14} /></button>
          {getKeyEstado(fila.estado) !== 'anulado' && (
            <button onClick={() => setModalAnular({ abierto: true, orden: fila })} className="btn-ghost hover:text-red-400" title="Anular"><XCircle size={14} /></button>
          )}
        </>)}
      />

      <OrdenForm
        modalNuevo={modalNuevo} setModalNuevo={setModalNuevo}
        form={form} setForm={setForm} itemForm={itemForm} setItemForm={setItemForm}
        proveedores={proveedores} productos={productos}
        prodBusqueda={prodBusqueda} prodsFiltrados={prodsFiltrados}
        provBusqueda={provBusqueda} provsFiltrados={provsFiltrados} provSeleccionado={provSeleccionado}
        buscarProveedor={buscarProveedor} buscarProducto={buscarProducto} buscarPorCodigo={buscarPorCodigo}
        agregarItem={agregarItem} quitarItem={quitarItem}
        setProvSeleccionado={setProvSeleccionado} setProvBusqueda={setProvBusqueda}
        setProdBusqueda={setProdBusqueda} setProdsFiltrados={setProdsFiltrados}
        totalOrden={totalOrden} handleCrear={handleCrear} creando={creando}
        handleFacturaChange={handleFacturaChange} facturaPreview={facturaPreview}
        onCrearProducto={() => { abrirModalProd(); setModalCrearProd(true) }}
      />

      <OrdenDetalle
        modalDetalle={modalDetalle} setModalDetalle={setModalDetalle}
        cambiarEstado={cambiarEstado} ESTADOS_ORDEN={ESTADOS_ORDEN}
        getEstadoId={getEstadoId} getKeyEstado={getKeyEstado}
        abrirEditar={abrirEditar} setModalAnular={setModalAnular}
      />

      {/* modal editar */}
      <Modal abierto={modalEditar.abierto} onCerrar={() => setModalEditar({ abierto: false, orden: null })}
        titulo={`Editar Orden #${modalEditar.orden?.id}`} ancho="max-w-lg">
        {modalEditar.orden && (
          <form onSubmit={handleEditar} className="space-y-3">
            <div className="p-3 rounded-lg bg-light-bg dark:bg-dark-bg text-xs">
              <span className="text-gray-400">Proveedor: </span>
              <span className="font-medium">{modalEditar.orden.proveedor}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="campo-label">Fecha de Compra *</label>
                <input type="date" value={formEditar.fecha_compra || ''}
                  onChange={e => setFormEditar(p => ({ ...p, fecha_compra: e.target.value }))}
                  className="campo-input text-xs" />
              </div>
              <div>
                <label className="campo-label">Método de Pago</label>
                <select value={formEditar.metodo_pago || 'Efectivo'}
                  onChange={e => setFormEditar(p => ({ ...p, metodo_pago: e.target.value }))}
                  className="campo-input text-xs">
                  {METODOS_PAGO.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="campo-label">Notas</label>
                <textarea value={formEditar.notas || ''} rows={2}
                  onChange={e => setFormEditar(p => ({ ...p, notas: e.target.value }))}
                  className="campo-input resize-none" placeholder="Observaciones..." />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
              <button type="button" onClick={() => setModalEditar({ abierto: false, orden: null })}
                className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
              <button type="submit" disabled={editando} className="btn-primary">{editando ? 'Guardando...' : 'Aceptar'}</button>
            </div>
          </form>
        )}
      </Modal>

      {/* modal anular — mismo estilo que pagos */}
      <Modal abierto={modalAnular.abierto} onCerrar={() => setModalAnular({ abierto: false, orden: null })}
        titulo="Confirmar Anulación" ancho="max-w-sm">
        {modalAnular.orden && (
          <div className="space-y-4">
            <p className="text-sm">¿Anular la orden
              <span className="font-medium text-primary"> #{modalAnular.orden.id}</span> de
              <span className="text-primary"> {modalAnular.orden.proveedor}</span>?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
              <button onClick={() => setModalAnular({ abierto: false, orden: null })}
                className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
              <button onClick={() => anular.mutate(modalAnular.orden.id)} disabled={anulando}
                className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50">
                {anulando ? 'Anulando...' : 'Aceptar'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* modal crear producto rápido */}
      {modalCrearProd && (
        <ProductoForm
          modal={{ ...modalProd, abierto: true }}
          form={formProd} setForm={setFormProd} errores={erroresProd}
          handleChange={handleChangeProd}
          handleSubmit={e => { handleSubmitProd(e); setModalCrearProd(false) }}
          cerrarModal={() => { cerrarModalProd(); setModalCrearProd(false) }}
          guardando={guardandoProd} categorias={categorias} marcas={marcas}
          verificandoCodigo={verificandoCodigo}
        />
      )}
    </div>
  )
}