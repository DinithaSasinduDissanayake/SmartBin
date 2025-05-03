import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import './App.css'; // Corrected path if App.css is directly in src
// import './styles/custom.css'; // Removed or commented out if custom.css doesn't exist or isn't needed here
import App from './App.jsx'; // Keep .jsx if App hasn't been converted to .tsx

// React Router future flags (optional but recommended if used in index.tsx)
const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true };

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter future={routerFuture}> {/* Wrap with BrowserRouter */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
