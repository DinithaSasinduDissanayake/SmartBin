// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import muiTheme from './muiTheme';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import DashboardLayout from './components/layouts/DashboardLayout';
import ProfilePage from './pages/profile/ProfilePage';
import SubscriptionPlansPage from './pages/subscription/SubscriptionPlansPage';
import PaymentDemonstrationPage from './components/financial/PaymentDemonstrationPage';
import ShadcnExperimentPage from './pages/experimental/ShadcnExperimentPage';
import AceternityExperimentPage from './pages/experimental/AceternityExperimentPage';
import CustomerScheduleDisplay from './components/CustomerScheduleDisplay';
import EquipmentManagement from './components/EquipmentManagement';
import ResourceManagement from './components/ResourceManagement';
import ResourcesDisplay from './components/ResourcesDisplay';
import ScheduleDisplay from './components/ScheduleDisplay';
import ScheduleManagement from './components/ScheduleManagement';
import ToolManagement from './components/ToolManagement';
// Import landing pages from feature branch
import Pricing from './pages/Pricing';
import Team from './pages/Team';
import Contact from './pages/Contact';
// Import new pickup components from develop branch
import PickupForm from './components/PickupForm';
import MyBinDetails from './components/MyBinDetails';
import PickupDetails from './components/PickupDetails';
import PickupRequests from './components/PickupRequests';
import PickupRequestDetails from './components/PickupRequestDetails';
// Import recycling components
import RecycleForm from './components/recycling/RecycleForm';
import RequestList from './components/recycling/RequestList';
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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        
        {/* New landing pages */}
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/team" element={<Team />} />
        <Route path="/contact" element={<Contact />} />

        {/* Experimental UI pages - public for easy access */}
        <Route path="/shadcn-experiment" element={<ShadcnExperimentPage />} />
        <Route path="/aceternity-experiment" element={<AceternityExperimentPage />} />

        {/* Payment demonstration - made public for easy testing */}
        <Route path="/payment-demo" element={<PaymentDemonstrationPage />} />

        {/* --- TEMPORARY PREVIEW ROUTES --- */}
        <Route path="/preview/customer-schedule-display" element={<CustomerScheduleDisplay />} />
        <Route path="/preview/equipment-management" element={<EquipmentManagement />} />
        <Route path="/preview/resource-management" element={<ResourceManagement />} />
        <Route path="/preview/resources-display" element={<ResourcesDisplay />} />
        <Route path="/preview/schedule-display" element={<ScheduleDisplay />} />
        <Route path="/preview/schedule-management" element={<ScheduleManagement />} />
        <Route path="/preview/tool-management" element={<ToolManagement />} />
        
        {/* Pickup related routes */}
        <Route path="/preview/pickup-form" element={<PickupForm />} />
        <Route path="/preview/my-bin-details" element={<MyBinDetails />} />
        <Route path="/preview/pickup-details" element={<PickupDetails />} />
        <Route path="/preview/pickup-requests" element={<PickupRequests />} />
        <Route path="/preview/pickup-request-details" element={<PickupRequestDetails />} />
        {/* --- END TEMPORARY PREVIEW ROUTES --- */}

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
        {/* Recycling feature routes inside dashboard */}
        <Route path="/dashboard/recycle-request" element={
          <ProtectedRoute>
            <RecycleForm />
          </ProtectedRoute>
        } />
        <Route path="/dashboard/my-requests" element={
          <ProtectedRoute>
            <RequestList />
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
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
