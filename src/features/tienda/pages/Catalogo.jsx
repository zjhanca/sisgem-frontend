import NavbarPublico    from '@shared/components/NavbarPublico'
import Footer           from '../components/Footer'
import CatalogoHeader   from '../components/CatalogoHeader'
import CatalogoFiltros  from '../components/CatalogoFiltros'
import CatalogoGrid     from '../components/CatalogoGrid'
import BotonFlotante    from '../components/BotonFlotante'
import { useCatalogo }  from '../hooks/useCatalogo'

export default function Catalogo() {
  const {
    productos, categorias, marcas, isLoading,
    busqueda, setBusqueda, mostrarFiltros, setMostrarFiltros,
    categoriaFiltro, marcaFiltro, hayFiltros,
    limpiarFiltros, setCategoria, setMarca,
  } = useCatalogo()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <NavbarPublico />

      {/* Banner catálogo */}
      <div className="relative bg-gradient-to-r from-primary to-green-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(4)].map((_, i) => (
            <div key={i}
              className="absolute rounded-full border-4 border-white"
              style={{
                width:  `${100 + i * 60}px`,
                height: `${100 + i * 60}px`,
                top:    `${(i * 30) % 80}%`,
                left:   `${(i * 25) % 90}%`,
              }} />
          ))}
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
          <p className="text-yellow-400 text-xs font-bold tracking-widest uppercase mb-1">
            Explora nuestra selección
          </p>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            Catálogo de Productos
          </h1>
          <p className="text-white/70 text-sm mt-1">
            Encuentra todo lo que necesitas en un solo lugar
          </p>
        </div>
        {/* Ola inferior */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,16 C360,32 1080,0 1440,16 L1440,32 L0,32 Z" fill="#ffffff" />
          </svg>
        </div>
      </div>

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
          <p className="text-xs text-gray-400">
            {isLoading ? 'Cargando...' : (
              <>
                <span className="font-semibold text-gray-700">{productos.length}</span> productos encontrados
              </>
            )}
          </p>
          {hayFiltros && (
            <div className="flex gap-1.5 flex-wrap">
              {categoriaFiltro && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                  bg-primary/10 text-primary text-xs font-medium">
                  {categorias.find(c => c.id === +categoriaFiltro)?.nombre}
                  <button onClick={() => setCategoria('')}
                    className="hover:opacity-60 ml-0.5">✕</button>
                </span>
              )}
              {marcaFiltro && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                  bg-primary/10 text-primary text-xs font-medium">
                  {marcas.find(m => m.id === +marcaFiltro)?.nombre}
                  <button onClick={() => setMarca('')}
                    className="hover:opacity-60 ml-0.5">✕</button>
                </span>
              )}
              {busqueda && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
                  bg-primary/10 text-primary text-xs font-medium">
                  "{busqueda}"
                  <button onClick={() => setBusqueda('')}
                    className="hover:opacity-60 ml-0.5">✕</button>
                </span>
              )}
            </div>
          )}
        </div>

        <CatalogoGrid
          productos={productos}
          isLoading={isLoading}
          limpiarFiltros={limpiarFiltros}
        />
      </div>

      <Footer />
      <BotonFlotante />
    </div>
  )
}