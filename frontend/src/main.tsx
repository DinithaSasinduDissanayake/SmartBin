import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import './styles/App.css'; // Import new CSS
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
