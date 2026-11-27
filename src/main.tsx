import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import AuthGate from './components/AuthGate.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthGate />
  </StrictMode>,
)
