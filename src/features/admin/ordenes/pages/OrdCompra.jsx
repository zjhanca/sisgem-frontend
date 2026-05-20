import { useState } from 'react'
import { Plus, Eye, Download, CheckCircle, Clock, XCircle } from 'lucide-react'
import Tabla from '@shared/components/Tabla'
import { formatPrecio, formatFecha } from '@shared/utils/validaciones'
import { descargarPDF } from '@shared/utils/reportes'
import { useOrdenes } from '../hooks/useOrdenes'
import OrdenForm   from '../components/OrdenForm'
import OrdenDetalle from '../components/OrdenDetalle'
 
const ICONOS = { pendiente: Clock, recibido: CheckCircle, anulado: XCircle }
const COLORES = { pendiente: 'text-yellow-500', recibido: 'text-green-500', anulado: 'text-red-400' }
 
export default function OrdCompra() {
  const {
    ordenesFiltradas, proveedores, productos,
    modalNuevo, modalDetalle, filtroEstado,
    setModalNuevo, setModalDetalle, setFiltroEstado,
    form, setForm, itemForm, setItemForm,
    prodBusqueda, prodsFiltrados, provBusqueda, provsFiltrados, provSeleccionado,
    buscarProveedor, buscarProducto, buscarPorCodigo, agregarItem, quitarItem,
    setProvSeleccionado, setProvBusqueda, setProdBusqueda,
    totalOrden, handleCrear, cambiarEstado,
    ESTADOS_ORDEN, getEstadoId, getKeyEstado, creando,
  } = useOrdenes()
 
  const columnas = [
    { key: 'id',         label: '#' },
    { key: 'proveedor',  label: 'Proveedor' },
    { key: 'total',      label: 'Total', render: r => formatPrecio(r.total) },
    { key: 'estado', label: 'Estado',
      render: r => {
        const key = getKeyEstado(r.estado)
        const Ico = ICONOS[key] || Clock
        const label = ESTADOS_ORDEN.find(e => e.key === key)?.label || 'Pendiente'
        return (
          <div className={`flex items-center gap-1.5 ${COLORES[key]}`}>
            <Ico size={13} /> <span className="text-xs">{label}</span>
          </div>
        )
      }
    },
    { key: 'created_at', label: 'Fecha', render: r => formatFecha(r.created_at) },
  ]
 
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Órdenes de Compra</h1>
        <div className="flex gap-2">
          <button onClick={() => descargarPDF('/reportes/ordenes', 'reporte-ordenes.pdf')} className="btn-outline"><Download size={14} /> Reporte</button>
          <button onClick={() => setModalNuevo(true)} className="btn-primary"><Plus size={14} /> Nueva Orden</button>
        </div>
      </div>
 
      <div className="flex gap-2 mb-4">
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="campo-input w-44 text-xs">
          <option value="">Todos los estados</option>
          {ESTADOS_ORDEN.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
        </select>
        {filtroEstado && <button onClick={() => setFiltroEstado('')} className="btn-ghost text-xs text-red-400">Limpiar</button>}
      </div>
 
      <Tabla columnas={columnas} datos={ordenesFiltradas} sinBusqueda
        acciones={fila => (<>
          <button onClick={() => setModalDetalle({ abierto: true, orden: fila })} className="btn-ghost"><Eye size={14} /></button>
          <button onClick={() => descargarPDF(`/reportes/ordenes/${fila.id}`, `orden-${fila.id}.pdf`)} className="btn-ghost"><Download size={14} /></button>
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
        setProvSeleccionado={setProvSeleccionado} setProvBusqueda={setProvBusqueda} setProdBusqueda={setProdBusqueda}
        totalOrden={totalOrden} handleCrear={handleCrear} creando={creando}
      />
      <OrdenDetalle
        modalDetalle={modalDetalle} setModalDetalle={setModalDetalle}
        cambiarEstado={cambiarEstado} ESTADOS_ORDEN={ESTADOS_ORDEN}
        getEstadoId={getEstadoId} getKeyEstado={getKeyEstado}
      />
    </div>
  )
}
