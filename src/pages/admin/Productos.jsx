import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../services/api'
import Tabla from '../../components/Tabla'
import Modal from '../../components/Modal'
import toast from 'react-hot-toast'
import { Plus, Edit, ToggleLeft, ToggleRight, Download } from 'lucide-react'

export default function Productos() {
  const qc = useQueryClient()
  const [modal, setModal] = useState({ abierto: false, item: null })
  const [form, setForm] = useState({
    nombre: '', descripcion: '', precio: '', stock: '',
    categoria_id: '', proveedor_id: ''
  })

  const { data: productos = [] } = useQuery({
    queryKey: ['productos'],
    queryFn: () => api.get('/productos').then(r => r.data.datos)
  })
  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: () => api.get('/categorias').then(r => r.data.datos)
  })
  const { data: proveedores = [] } = useQuery({
    queryKey: ['proveedores'],
    queryFn: () => api.get('/proveedores').then(r => r.data.datos)
  })

  const guardar = useMutation({
    mutationFn: data => modal.item
      ? api.put(`/productos/${modal.item.id}`, data)
      : api.post('/productos', data),
    onSuccess: () => {
      qc.invalidateQueries(['productos'])
      setModal({ abierto: false, item: null })
      toast.success('producto guardado')
    },
    onError: err => toast.error(err.response?.data?.mensaje || 'error')
  })

  const toggleEstado = useMutation({
    mutationFn: id => api.patch(`/productos/${id}/estado`),
    onSuccess: () => qc.invalidateQueries(['productos'])
  })

  const abrirModal = (item = null) => {
    setForm(item ? { ...item } : {
      nombre: '', descripcion: '', precio: '', stock: '',
      categoria_id: '', proveedor_id: ''
    })
    setModal({ abierto: true, item })
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (!form.nombre.trim()) { toast.error('el nombre es obligatorio'); return }
    if (!form.precio || isNaN(form.precio)) { toast.error('precio invalido'); return }
    guardar.mutate(form)
  }

  const descargarReporte = () => {
    window.open(`${import.meta.env.VITE_API_URL}/reportes/productos`, '_blank')
  }

  const columnas = [
    { key: 'nombre', label: 'nombre' },
    { key: 'categoria', label: 'categoria' },
    { key: 'proveedor', label: 'proveedor' },
    { key: 'precio', label: 'precio',
      render: r => `$${parseFloat(r.precio).toLocaleString('es-CO')}` },
    { key: 'stock', label: 'stock' },
    { key: 'estado', label: 'estado',
      render: r => (
        <span className={`text-xs px-2 py-0.5 rounded-full ${r.estado
          ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-400'}`}>
          {r.estado ? 'activo' : 'inactivo'}
        </span>
      )
    },
  ]

  return (
    <div>
      <div className='flex items-center justify-between mb-4'>
        <h1 className='text-lg font-medium text-dark-text dark:text-dark-text text-light-text'>
          productos
        </h1>
        <div className='flex gap-2'>
          <button onClick={descargarReporte}
            className='flex items-center gap-1.5 px-3 py-1.5 text-sm
              border border-primary/40 text-primary rounded-lg hover:bg-primary/10'>
            <Download size={14}/> reporte
          </button>
          <button onClick={() => abrirModal()}
            className='flex items-center gap-1.5 px-3 py-1.5 text-sm
              bg-primary text-dark-bg rounded-lg hover:bg-primary-mid'>
            <Plus size={14}/> nuevo
          </button>
        </div>
      </div>

      <Tabla columnas={columnas} datos={productos}
        acciones={fila => (<>
          <button onClick={() => abrirModal(fila)}
            className='p-1.5 text-dark-text/60 hover:text-primary rounded'>
            <Edit size={14}/>
          </button>
          <button onClick={() => toggleEstado.mutate(fila.id)}
            className={`p-1.5 rounded ${fila.estado
              ? 'text-green-400 hover:text-red-400'
              : 'text-red-400 hover:text-green-400'}`}>
            {fila.estado ? <ToggleRight size={14}/> : <ToggleLeft size={14}/>}
          </button>
        </>)}
      />

      <Modal abierto={modal.abierto}
        onCerrar={() => setModal({ abierto: false, item: null })}
        titulo={modal.item ? 'editar producto' : 'nuevo producto'}>
        <form onSubmit={handleSubmit} className='space-y-3'>
          <div className='grid grid-cols-2 gap-3'>
            <div className='col-span-2'>
              <label className='block text-xs text-dark-text/70 mb-1'>nombre</label>
              <input value={form.nombre}
                onChange={e => setForm({...form, nombre: e.target.value})}
                className='campo-input' />
            </div>
            <div>
              <label className='block text-xs text-dark-text/70 mb-1'>precio</label>
              <input type='number' step='0.01' value={form.precio}
                onChange={e => setForm({...form, precio: e.target.value})}
                className='campo-input' />
            </div>
            <div>
              <label className='block text-xs text-dark-text/70 mb-1'>stock</label>
              <input type='number' value={form.stock}
                onChange={e => setForm({...form, stock: e.target.value})}
                className='campo-input' />
            </div>
            <div>
              <label className='block text-xs text-dark-text/70 mb-1'>categoria</label>
              <select value={form.categoria_id}
                onChange={e => setForm({...form, categoria_id: e.target.value})}
                className='campo-input'>
                <option value=''>seleccionar...</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-xs text-dark-text/70 mb-1'>proveedor</label>
              <select value={form.proveedor_id}
                onChange={e => setForm({...form, proveedor_id: e.target.value})}
                className='campo-input'>
                <option value=''>seleccionar...</option>
                {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
            <div className='col-span-2'>
              <label className='block text-xs text-dark-text/70 mb-1'>descripcion</label>
              <textarea value={form.descripcion}
                onChange={e => setForm({...form, descripcion: e.target.value})}
                rows={2} className='campo-input resize-none' />
            </div>
          </div>
          <div className='flex justify-end gap-2 pt-2'>
            <button type='button'
              onClick={() => setModal({ abierto: false, item: null })}
              className='px-4 py-1.5 text-sm border border-dark-border
                text-dark-text/70 rounded-lg hover:border-primary/40'>
              cancelar
            </button>
            <button type='submit' disabled={guardar.isPending}
              className='px-4 py-1.5 text-sm bg-primary text-dark-bg
                rounded-lg hover:bg-primary-mid disabled:opacity-50'>
              {guardar.isPending ? 'guardando...' : 'guardar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
