import Modal from '@shared/components/Modal'

export default function ClienteConfirmEstado({ confirmToggle, setConfirmToggle, toggleEstado }) {
  const cerrar = () => setConfirmToggle(null)
  return (
    <Modal abierto={!!confirmToggle} onCerrar={cerrar} bloquearCierre
      titulo={confirmToggle?.estadoActual ? 'Desactivar Cliente' : 'Activar Cliente'} ancho="max-w-sm">
      {confirmToggle && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Estás seguro que deseas <span className="font-semibold text-light-text">{confirmToggle.estadoActual ? 'desactivar' : 'activar'}</span> al cliente{' '}
            <span className="font-semibold text-primary">{confirmToggle.nombre}</span>?
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <button onClick={() => { toggleEstado.mutate(confirmToggle.id); cerrar() }}
              className={`px-4 py-1.5 text-sm rounded-lg text-white ${confirmToggle.estadoActual ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary-mid'}`}>
              Sí, {confirmToggle.estadoActual ? 'desactivar' : 'activar'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}