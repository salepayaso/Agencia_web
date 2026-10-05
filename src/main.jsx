import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LazyMotion } from 'framer-motion'
import './index.css'
import './styles/taller.css'
import App from './App.jsx'

// Tras un deploy, una pestaña abierta de antes pide páginas (chunks) que ya no
// existen y queda en blanco. Recargamos una vez para traer la versión nueva;
// la marca evita un bucle si el problema fuera otro.
window.addEventListener('vite:preloadError', (event) => {
  try {
    const last = Number(sessionStorage.getItem('i360-reload') || 0)
    if (Date.now() - last < 10000) return
    sessionStorage.setItem('i360-reload', String(Date.now()))
  } catch { /* sin sessionStorage: recargar igual */ }
  event.preventDefault()
  window.location.reload()
})

const loadFeatures =() => import('framer-motion').then(mod => mod.domAnimation)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LazyMotion features={loadFeatures} strict={false}>
      <App />
    </LazyMotion>
  </StrictMode>,
)
