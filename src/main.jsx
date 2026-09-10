import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './stockSearch.js'
// Load the localStorage edit bridge BEFORE App.jsx evaluates its useState
// initializers. This prevents an edited Jobsheet from being overwritten by
// React's stale in-memory snapshot during the automatic reload.
import './pro-business-tools.js'
import './job-sheet-issues.js'
// Enhance the EXISTING Job Sheet History Action cell with View/Edit/Print/Delete.
// This runs after the React table is rendered and replaces the old Delete-only action area.
import './pro-history-tools.js'
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
