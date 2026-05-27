export default function EstadoToggle({ activo, onChange, cargando = false, disabled = false }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={cargando || disabled}
      title={disabled ? 'Sin stock — no se puede activar' : activo ? 'Desactivar' : 'Activar'}
      className={`toggle-track disabled:opacity-40 disabled:cursor-not-allowed ${
        activo ? 'bg-primary' : 'bg-gray-300 dark:bg-dark-border'
      }`}
    >
      <span className={`toggle-thumb ${activo ? 'translate-x-4' : 'translate-x-1'}`} />
    </button>
  )
}