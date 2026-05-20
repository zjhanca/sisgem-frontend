export default function ProductoFiltros({
  categorias, filtroCategoria, setFiltroCategoria,
  filtroEstado, setFiltroEstado,
  filtroStock, setFiltroStock,
  totalFiltrados, total,
}) {
  const hayFiltros = filtroCategoria || filtroEstado || filtroStock
 
  const limpiar = () => {
    setFiltroCategoria('')
    setFiltroEstado('')
    setFiltroStock('')
  }
 
  return (
    <div className="flex gap-2 flex-wrap items-end">
      <div>
        <p className="campo-label mb-0.5">Categoría</p>
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} className="campo-input w-44 text-xs">
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>
 
      <div>
        <p className="campo-label mb-0.5">Estado</p>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="campo-input w-36 text-xs">
          <option value="">Todos</option>
          <option value="activo">Activos</option>
          <option value="inactivo">Inactivos</option>
        </select>
      </div>
 
      <div>
        <p className="campo-label mb-0.5">Stock</p>
        <select value={filtroStock} onChange={e => setFiltroStock(e.target.value)} className="campo-input w-36 text-xs">
          <option value="">Todos</option>
          <option value="bajo">Stock Bajo</option>
          <option value="sin">Sin Stock</option>
        </select>
      </div>
 
      {hayFiltros && (
        <button onClick={limpiar} className="btn-ghost text-xs text-red-400 self-end">
          Limpiar
        </button>
      )}
 
      <p className="text-xs text-gray-400 self-end ml-auto">
        {totalFiltrados} de {total} productos
      </p>
    </div>
  )
}
