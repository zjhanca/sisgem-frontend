import { Plus, Eye, Download, Clock, XCircle, AlertTriangle, Edit2, CheckCircle, Truck } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import Modal from '@shared/components/Modal'
import { formatPrecio, formatFecha } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
import { useOrdenes } from '../hooks/useOrdenes'
import OrdenForm    from '../components/OrdenForm'
import OrdenDetalle from '../components/OrdenDetalle'

const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Crédito']

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
    setProvSeleccionado, setProvBusqueda, setProdBusqueda,
    totalOrden, handleCrear, handleEditar, abrirEditar,
    cambiarEstado, anular,
    ESTADOS_ORDEN, getEstadoId, getKeyEstado,
    creando, editando, anulando,
  } = useOrdenes()

  const columnas = [
    { key: 'id',             label: '#' },
    { key: 'proveedor',      label: 'Proveedor' },
    { key: 'registrado_por', label: 'Registrado por', render: r => r.registrado_por || '—' },
    { key: 'fecha_compra',   label: 'Fecha Compra',   render: r => formatFecha(r.fecha_compra || r.created_at) },
    { key: 'metodo_pago',    label: 'Método Pago',    render: r => r.metodo_pago || '—' },
    { key: 'total',          label: 'Total',          render: r => formatPrecio(r.total) },
    { key: 'estado_id', label: 'Estado',
      render: r => (
        <select
          value={getEstadoId(getKeyEstado(r.estado)) || ''}
          onChange={e => {
            if (e.target.value) cambiarEstado.mutate({ id: r.id, estado_id: +e.target.value })
          }}
          onClick={e => e.stopPropagation()}
          disabled={getKeyEstado(r.estado) === 'anulado'}
          className="text-xs bg-transparent border border-gray-200 dark:border-dark-border rounded px-1 py-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
          {ESTADOS_ORDEN.map(e => {
            const id = getEstadoId(e.key)
            if (!id) return null
            return <option key={e.key} value={id}>{e.label}</option>
          })}
        </select>
      )
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

      {/* alerta vencidas */}
      {ordenesVencidas > 0 && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-400/20">
          <AlertTriangle size={16} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400">
            <span className="font-semibold">{ordenesVencidas}</span> orden{ordenesVencidas > 1 ? 'es' : ''} con factura vencida
          </p>
          <button onClick={() => setFiltroEstado('vencida')} className="ml-auto text-xs text-red-500 hover:underline">
            Ver vencidas →
          </button>
        </div>
      )}

      {/* filtros */}
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
          <button onClick={() => setModalDetalle({ abierto: true, orden: fila })}
            className="btn-ghost" title="Ver detalle"><Eye size={14} /></button>
          <button onClick={() => abrirEditar(fila)}
            className="btn-ghost" title="Editar"
            disabled={getKeyEstado(fila.estado) === 'anulado'}>
            <Edit2 size={14} />
          </button>
          <button onClick={() => descargarPDF(`/reportes/ordenes/${fila.id}`, `orden-${fila.id}.pdf`)}
            className="btn-ghost" title="Descargar PDF"><Download size={14} /></button>
          {getKeyEstado(fila.estado) !== 'anulado' && (
            <button onClick={() => setModalAnular({ abierto: true, orden: fila })}
              className="btn-ghost hover:text-red-400" title="Anular">
              <XCircle size={14} />
            </button>
          )}
        </>)}
      />

      {/* modal nueva orden */}
      <OrdenForm
        modalNuevo={modalNuevo} setModalNuevo={setModalNuevo}
        form={form} setForm={setForm} itemForm={itemForm} setItemForm={setItemForm}
        proveedores={proveedores} productos={productos}
        prodBusqueda={prodBusqueda} prodsFiltrados={prodsFiltrados}
        provBusqueda={provBusqueda} provsFiltrados={provsFiltrados} provSeleccionado={provSeleccionado}
        buscarProveedor={buscarProveedor} buscarProducto={buscarProducto} buscarPorCodigo={buscarPorCodigo}
        agregarItem={agregarItem} quitarItem={quitarItem}
        setProvSeleccionado={setProvSeleccionado} setProvBusqueda={setProvBusqueda} setProdBusqueda={setProdBusqueda}
        totalOrden={totalOrden} handleCrear={handleCrear} creando={creando}
        handleFacturaChange={handleFacturaChange} facturaPreview={facturaPreview}
      />

      {/* modal detalle */}
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
                <label className="campo-label">Fecha Límite de Pago</label>
                <input type="date" value={formEditar.fecha_limite_pago || ''}
                  onChange={e => setFormEditar(p => ({ ...p, fecha_limite_pago: e.target.value }))}
                  className="campo-input text-xs" />
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
              <button type="submit" disabled={editando} className="btn-primary">
                {editando ? 'Guardando...' : 'Aceptar'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* modal confirmar anular */}
      <Modal abierto={modalAnular.abierto} onCerrar={() => setModalAnular({ abierto: false, orden: null })}
        titulo="Anular Orden" ancho="max-w-sm">
        {modalAnular.orden && (
          <div className="space-y-4">
            <p className="text-sm">¿Anular la orden <span className="font-medium text-primary">#{modalAnular.orden.id}</span> de <span className="font-medium">{modalAnular.orden.proveedor}</span>?
              <br /><span className="text-xs text-gray-400 mt-1 block">Esta acción no se puede deshacer.</span>
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
              <button onClick={() => setModalAnular({ abierto: false, orden: null })}
                className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
              <button onClick={() => anular.mutate(modalAnular.orden.id)} disabled={anulando}
                className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50">
                {anulando ? 'Anulando...' : 'Anular'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}