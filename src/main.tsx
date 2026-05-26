import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './lib/AuthContext.tsx'
import { AppWithProviders } from './AppWithProviders.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppWithProviders />
    </AuthProvider>
  </StrictMode>,
)