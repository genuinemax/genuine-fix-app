import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './stockSearch.js'
import './mobile-gui.js'
import App from './App.jsx'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Genuine Fix service worker registration failed:', error)
    })
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
