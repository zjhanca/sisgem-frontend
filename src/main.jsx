import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0F1C22',
            color: '#EAF7EE',
            border: '1px solid #1A3040',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#A6E8B2', secondary: '#081217' } },
          error:   { iconTheme: { primary: '#f87171', secondary: '#081217' } },
        }}
      />
    </BrowserRouter>
  </QueryClientProvider>
)