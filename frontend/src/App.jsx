// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import muiTheme from './muiTheme';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import DashboardLayout from './components/layouts/DashboardLayout';
import ProfilePage from './pages/profile/ProfilePage';
import SubscriptionPlansPage from './pages/subscription/SubscriptionPlansPage';
import './App.css';

// Loading Indicator component
const LoadingSpinner = () => {
  return <div className="loading-indicator"></div>;
};

// Protected route component with enhanced loading state
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate a minimum loading time for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, []);

  // Show enhanced loading state
  if (loading || isLoading) return <LoadingSpinner />;

  // Redirect to login if not authenticated
  if (!user) return <Navigate to="/login" />;

  return children;
};

// Custom hook for animating page transitions
const usePageTransition = () => {
  const [displayLocation, setDisplayLocation] = useState(null);
  const [transitionStage, setTransitionStage] = useState("fadeIn");
  const location = useLocation();

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === "fadeOut") {
      const timeout = setTimeout(() => {
        setTransitionStage("fadeIn");
        setDisplayLocation(location);
      }, 50); // Reduced from 300ms to 50ms for snappier navigation
      
      return () => clearTimeout(timeout);
    }
  }, [transitionStage, location, displayLocation]);

  return { transitionStage, displayLocation: displayLocation || location };
};

function AppContent() {
  const { transitionStage, displayLocation } = usePageTransition();
  
  return (
    <div className={`page-transition ${transitionStage}`}>
      <Routes location={displayLocation}>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Subscription route */}
        <Route path="/subscription-plans" element={
          <ProtectedRoute>
            <SubscriptionPlansPage />
          </ProtectedRoute>
        } />
        
        {/* Protected routes - all dashboard routes should be nested here */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
