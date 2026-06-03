import NavbarPublico    from '@shared/components/NavbarPublico'
import Footer           from '../components/Footer'
import CatalogoHeader   from '../components/CatalogoHeader'
import CatalogoFiltros  from '../components/CatalogoFiltros'
import CatalogoGrid     from '../components/CatalogoGrid'
import { useCatalogo }  from '../hooks/useCatalogo'

export default function Catalogo() {
  const {
    productos, categorias, marcas, isLoading,
    busqueda, setBusqueda, mostrarFiltros, setMostrarFiltros,
    categoriaFiltro, marcaFiltro, hayFiltros,
    limpiarFiltros, setCategoria, setMarca,
  } = useCatalogo()

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col">

      <NavbarPublico />

      <CatalogoHeader
        busqueda={busqueda} setBusqueda={setBusqueda}
        mostrarFiltros={mostrarFiltros} setMostrarFiltros={setMostrarFiltros}
        hayFiltros={hayFiltros} limpiarFiltros={limpiarFiltros}
        categorias={categorias} marcas={marcas}
        categoriaFiltro={categoriaFiltro} marcaFiltro={marcaFiltro}
      />

      <CatalogoFiltros
        mostrarFiltros={mostrarFiltros}
        categorias={categorias} marcas={marcas}
        categoriaFiltro={categoriaFiltro} setCategoria={setCategoria}
        marcaFiltro={marcaFiltro} setMarca={setMarca}
        hayFiltros={hayFiltros} limpiarFiltros={limpiarFiltros}
      />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <p className="text-xs text-gray-400 dark:text-dark-text/40">
            {isLoading ? 'Cargando...' : (
              <><span className="font-semibold text-light-text dark:text-dark-text">{productos.length}</span> productos encontrados</>
            )}
          </p>
          {hayFiltros && (
            <div className="flex gap-1.5 flex-wrap">
              {categoriaFiltro && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {categorias.find(c => c.id === +categoriaFiltro)?.nombre}
                  <button onClick={() => setCategoria('')} className="hover:opacity-60 ml-0.5">✕</button>
                </span>
              )}
              {marcaFiltro && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {marcas.find(m => m.id === +marcaFiltro)?.nombre}
                  <button onClick={() => setMarca('')} className="hover:opacity-60 ml-0.5">✕</button>
                </span>
              )}
              {busqueda && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  "{busqueda}"
                  <button onClick={() => setBusqueda('')} className="hover:opacity-60 ml-0.5">✕</button>
                </span>
              )}
            </div>
          )}
        </div>

        <CatalogoGrid
          productos={productos}
          isLoading={isLoading}
          agregarAlCarrito={() => {}}
          limpiarFiltros={limpiarFiltros}
        />
      </div>

      <Footer />
    </div>
  )
}