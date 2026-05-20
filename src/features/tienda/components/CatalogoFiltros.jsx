export default function CatalogoFiltros({
  mostrarFiltros,
  categorias, marcas,
  categoriaFiltro, setCategoria,
  marcaFiltro, setMarca,
  hayFiltros, limpiarFiltros,
}) {
  if (!mostrarFiltros) return null
 
  return (
    <div className="bg-light-bg dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border px-4 py-4">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="campo-label">Categoría</label>
          <select
            value={categoriaFiltro}
            onChange={e => setCategoria(e.target.value)}
            className="campo-input text-sm">
            <option value="">Todas las categorías</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        <div>
          <label className="campo-label">Marca</label>
          <select
            value={marcaFiltro}
            onChange={e => setMarca(e.target.value)}
            className="campo-input text-sm">
            <option value="">Todas las marcas</option>
            {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>
        {hayFiltros && (
          <div className="flex items-end">
            <button
              onClick={limpiarFiltros}
              className="px-4 py-2 text-sm border border-red-300 text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors">
              Limpiar Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
