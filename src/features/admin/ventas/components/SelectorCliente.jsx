import { useRef, useState } from 'react'
import { Search, UserPlus } from 'lucide-react'

export default function SelectorCliente({
  form, setForm, clientesFiltrados, clienteBusqueda, setClienteBusqueda,
  clienteSeleccionado, abrirNuevoCliente,
}) {
  const dropdownRef = useRef(null)
  const [clienteDropdown, setClienteDropdown] = useState(false)

  const seleccionarCliente = c => {
    setForm(f => ({ ...f, cliente_id: c.id, tipo_pago: 'total' }))
    setClienteBusqueda('')
    setClienteDropdown(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="campo-label">Cliente</label>
        <button type="button" onClick={abrirNuevoCliente}
          className="flex items-center gap-1 text-xs text-primary hover:underline">
          <UserPlus size={12} /> Nuevo cliente
        </button>
      </div>

      <div className="flex gap-2 mb-2">
        {[
          { val: 'registrado', label: 'Cliente Registrado' },
          { val: 'manual',     label: 'Cliente Mostrador'  },
        ].map(t => (
          <button key={t.val} type="button"
            onClick={() => {
              setForm(f => ({
                ...f, tipo_cliente: t.val, cliente_id: '',
                cliente_nombre: t.val === 'manual' ? 'Mostrador' : '',
                tipo_pago: 'total',
              }))
              setClienteBusqueda('')
              setClienteDropdown(false)
            }}
            className={`px-3 py-1 text-xs rounded-full border transition-all ${
              form.tipo_cliente === t.val
                ? 'bg-primary text-white border-primary'
                : 'border-gray-200 text-gray-500 hover:border-primary/40'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {form.tipo_cliente === 'manual' ? (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-500">
          <span className="text-base">🛒</span>
          <span>Venta registrada como <strong className="text-gray-700">Cliente Mostrador</strong></span>
        </div>
      ) : (
        <div className="space-y-1" ref={dropdownRef}>
          {clienteSeleccionado && !clienteBusqueda ? (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg border border-primary/40 bg-primary/5 text-xs">
              <span className="font-medium text-primary">
                {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
              </span>
              <button type="button"
                onClick={() => { setForm(f => ({ ...f, cliente_id: '', tipo_pago: 'total' })); setClienteBusqueda('') }}
                className="text-gray-400 hover:text-red-400 ml-2">✕</button>
            </div>
          ) : (
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
              <input value={clienteBusqueda}
                onChange={e => { setClienteBusqueda(e.target.value); setForm(f => ({ ...f, cliente_id: '', tipo_pago: 'total' })) }}
                onFocus={() => setClienteDropdown(true)}
                className="campo-input pl-8 text-xs"
                placeholder="Buscar o seleccionar cliente..." />
              {clienteDropdown && clientesFiltrados.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-30 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                  {clientesFiltrados.map(c => (
                    <button key={c.id} type="button"
                      onMouseDown={e => { e.preventDefault(); seleccionarCliente(c) }}
                      className="w-full text-left px-3 py-2 text-xs hover:bg-primary/10 flex justify-between text-light-text">
                      <span>{c.nombre} {c.apellido}</span>
                      {c.telefono && <span className="text-gray-400">{c.telefono}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}