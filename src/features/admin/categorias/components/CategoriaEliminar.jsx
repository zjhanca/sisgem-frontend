import Modal from '@shared/components/Modal'

export default function CategoriaEliminar({ modalEliminar, setModalEliminar, eliminar, eliminando }) {
  const item = modalEliminar.item
  const cerrar = () => setModalEliminar({ abierto: false, item: null })
  return (
    <Modal abierto={modalEliminar.abierto} onCerrar={cerrar} bloquearCierre
      titulo="Confirmar Eliminación" ancho="max-w-sm">
      <div className="space-y-4">
        <p className="text-sm text-light-text">
          ¿Está seguro que desea eliminar la categoría
          <span className="font-medium text-primary"> {item?.nombre}</span>?
          Los productos asociados quedarán sin categoría.
        </p>
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button onClick={() => eliminar.mutate(item.id)} disabled={eliminando}
            className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50">
            {eliminando ? 'Eliminando...' : 'Aceptar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}