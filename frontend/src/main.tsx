import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import UdyamRegistrationWizard from './components/UdyamRegistrationWizard'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UdyamRegistrationWizard />
  </StrictMode>,
)
