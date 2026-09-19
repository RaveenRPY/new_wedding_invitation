import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { isAdminPath } from './adminPath'
import App from './App.tsx'
import { AdminDashboard } from './components/AdminDashboard.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isAdminPath() ? <AdminDashboard /> : <App />}</StrictMode>,
)
