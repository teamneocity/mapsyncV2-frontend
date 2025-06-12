import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Routes } from './routes'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from './hooks/auth'
import { ApiProvider } from './services/api-provider'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApiProvider>
      <AuthProvider>
        <Routes/>
        <Toaster />
      </AuthProvider>
    </ApiProvider>

  </StrictMode>,
)
