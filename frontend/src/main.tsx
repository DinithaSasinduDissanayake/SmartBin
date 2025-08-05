import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';
import './App.css';
import './styles/App.css';
import App from './App.jsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  const appRouter = (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  );

  createRoot(rootElement).render(
    <StrictMode>
      {appRouter}
    </StrictMode>
  );
} else {
  console.error("Failed to find the root element with ID 'root'. React app could not be mounted.");
}
