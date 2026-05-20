import Modal from '@shared/components/Modal'
 
export default function UsuarioEliminar({ modalEliminar, setModalEliminar, eliminar, eliminando }) {
  const item = modalEliminar.item
  const cerrar = () => setModalEliminar({ abierto: false, item: null })
  return (
    <Modal abierto={modalEliminar.abierto} onCerrar={cerrar} titulo="Confirmar Eliminación" ancho="max-w-sm">
      <div className="space-y-4">
        <p className="text-sm">¿Está seguro que desea eliminar al usuario
          <span className="font-medium text-primary"> {item?.nombre} {item?.apellido}</span>?
        </p>
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-dark-border">
          <button onClick={cerrar} className="px-4 py-1.5 text-sm border border-gray-200 dark:border-dark-border text-gray-500 rounded-lg">Cancelar</button>
          <button onClick={() => eliminar.mutate(item.id)} disabled={eliminando}
            className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50">
            {eliminando ? 'Eliminando...' : 'Aceptar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
 
