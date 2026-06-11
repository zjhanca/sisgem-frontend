import Modal from '@shared/components/Modal'

export default function MarcaEliminar({ modalEliminar, setModalEliminar, eliminar, eliminando }) {
  const item = modalEliminar.item
  const cerrar = () => setModalEliminar({ abierto: false, item: null })
  return (
    <Modal abierto={modalEliminar.abierto} onCerrar={cerrar} bloquearCierre
      titulo="Confirmar Eliminación" ancho="max-w-sm">
      <div className="space-y-4">
        <p className="text-sm">¿Está seguro de eliminar la marca
          <span className="font-medium text-primary"> {item?.nombre}</span>?
          No se puede eliminar si tiene productos asociados.
        </p>
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button onClick={() => eliminar.mutate(item.id)} disabled={eliminando}
            className="px-4 py-1.5 text-sm bg-red-500 text-white rounded-lg disabled:opacity-50">
            {eliminando ? 'Eliminando...' : 'Aceptar'}
          </button>
        </div>
      </div>
    </Modal>
  )
}