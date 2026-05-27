// componente toggle switch para estado activo/inactivo
// uso: <EstadoToggle activo={fila.estado} onChange={() => toggleEstado.mutate(fila.id)} />
 
export default function EstadoToggle({ activo, onChange, cargando = false }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={cargando}
      title={activo ? 'Desactivar' : 'Activar'}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${
        activo ? 'bg-primary' : 'bg-gray-300 dark:bg-dark-border'
      }`}>
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
        activo ? 'translate-x-4' : 'translate-x-1'
      }`} />
    </button>
  )
}
