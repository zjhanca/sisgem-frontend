export default function CatalogoFiltros({
  mostrarFiltros,
  categorias, marcas,
  categoriaFiltro, setCategoria,
  marcaFiltro, setMarca,
  hayFiltros, limpiarFiltros,
}) {
  if (!mostrarFiltros) return null

  return (
    <div className="bg-light-card dark:bg-dark-card border-b border-gray-100 dark:border-dark-border px-4 py-4">
      <div className="max-w-6xl mx-auto flex flex-wrap gap-3 items-end">

        <div className="flex-1 min-w-[160px] max-w-xs">
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Categoría</label>
          <select value={categoriaFiltro} onChange={e => setCategoria(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-dark-border
              bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text
              focus:outline-none focus:border-primary/60 transition-all">
            <option value="">Todas las categorías</option>
            {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>

        <div className="flex-1 min-w-[160px] max-w-xs">
          <label className="block text-xs text-gray-400 mb-1.5 font-medium">Marca</label>
          <select value={marcaFiltro} onChange={e => setMarca(e.target.value)}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-dark-border
              bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text
              focus:outline-none focus:border-primary/60 transition-all">
            <option value="">Todas las marcas</option>
            {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
          </select>
        </div>

        {hayFiltros && (
          <button onClick={limpiarFiltros}
            className="px-4 py-2.5 text-sm rounded-xl border border-red-200 dark:border-red-400/30
              text-red-400 hover:bg-red-50 dark:hover:bg-red-400/10 transition-colors font-medium">
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  )
}