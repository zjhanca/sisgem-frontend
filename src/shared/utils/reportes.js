import api from '../services/api'
import toast from 'react-hot-toast'
 
export async function descargarPDF(url, nombreArchivo) {
  try {
    const response = await api.get(url, { responseType: 'blob' })
    const blob = new Blob([response.data], { type: 'application/pdf' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = nombreArchivo || 'reporte.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  } catch (err) {
    toast.error('error al generar el reporte')
  }
}
