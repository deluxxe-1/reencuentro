import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { PreferencesProvider } from './state/preferences'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreferencesProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PreferencesProvider>
  </StrictMode>,
)
