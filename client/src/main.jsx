import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, LocaleProvider, createTheme } from '@mero-nepal/ui'
import './index.css'
import App from './App.jsx'

// Gunaso uses the `safa` theme — Mero's crisp, Apple-inspired light design tokens.
const theme = createTheme({ extends: 'safa' })

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <LocaleProvider>
        <App />
      </LocaleProvider>
    </ThemeProvider>
  </StrictMode>,
)
