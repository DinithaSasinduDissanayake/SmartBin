import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import './App.css'; // Importing App.css from src folder
import './styles/App.css'; // Also importing new CSS from develop branch
import App from './App.jsx'; // Keep .jsx if App hasn't been converted to .tsx

// React Router future flags (optional but recommended if used in index.tsx)
const router = (
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(router);
