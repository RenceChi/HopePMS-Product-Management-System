import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { UserRightsProvider } from './context/UserRightsContext' // Import the new provider

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      {/* UserRightsProvider must be a child of AuthProvider to use its context */}
      <UserRightsProvider>
        <App />
      </UserRightsProvider>
    </AuthProvider>
  </StrictMode>,
)