import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { LazyMotion } from 'framer-motion'
import './index.css'
import App from './App.jsx'

const loadFeatures = () => import('framer-motion').then(mod => mod.domAnimation)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LazyMotion features={loadFeatures} strict={false}>
      <App />
    </LazyMotion>
  </StrictMode>,
)
