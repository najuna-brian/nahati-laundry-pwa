import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './services/auth';
import Layout from './components/shared/Layout';
import ProtectedRoute from './components/shared/ProtectedRoute';
import ErrorBoundary from './components/shared/ErrorBoundary';
import SplashScreen from './components/customer/SplashScreen';
import LoginSignup from './components/customer/LoginSignup';
import Dashboard from './components/customer/Dashboard';
import ServiceSelection from './components/customer/ServiceSelection';
import OrderDetails from './components/customer/OrderDetails';
import Scheduling from './components/customer/Scheduling';
import OrderConfirmation from './components/customer/OrderConfirmation';
import OrderTracking from './components/customer/OrderTracking';
import MyOrders from './components/customer/MyOrders';
import LocationContact from './components/customer/LocationContact';
import Profile from './components/customer/Profile';
import AdminLogin from './components/admin/AdminLogin';
import AdminSetup from './components/admin/AdminSetup';
import AdminRoutes from './components/admin/AdminRoutes';
import StaffLogin from './components/staff/StaffLogin';
import StaffDashboard from './components/staff/StaffDashboard';
import CustomerInvitation from './components/customer/CustomerInvitation';
import FirebaseDataDemo from './components/FirebaseDataDemo';
import FirebaseSetup from './components/FirebaseSetup';
import InstallPrompt from './components/shared/InstallPrompt';
import './styles/globals.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showInstallPrompt, setShowInstallPrompt] = useState(true);
  const [appInstalled, setAppInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed or running in standalone mode
    const checkInstallStatus = () => {
      const isStandalone = window.navigator.standalone || 
                          window.matchMedia('(display-mode: standalone)').matches ||
                          localStorage.getItem('pwa-installed') === 'true';
      
      const installSkipped = localStorage.getItem('pwa-install-skipped') === 'true';
      
      // Don't show install prompt for admin/staff routes
      const currentPath = window.location.pathname;
      const isAdminOrStaffRoute = currentPath.startsWith('/admin') || 
                                 currentPath.startsWith('/staff') ||
                                 currentPath.startsWith('/firebase-setup');
      
      if (isStandalone || installSkipped || isAdminOrStaffRoute) {
        setAppInstalled(true);
        setShowInstallPrompt(false);
      }
    };

    checkInstallStatus();

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleAppInstalled = () => {
    setAppInstalled(true);
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-installed', 'true');
  };

  const handleSkipInstall = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-skipped', 'true');
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  // Show install prompt before anything else (except splash)
  if (showInstallPrompt && !appInstalled) {
    return (
      <InstallPrompt 
        onInstall={handleAppInstalled}
        onDismiss={handleSkipInstall}
      />
    );
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginSignup />} />
              <Route path="/services" element={<ServiceSelection />} />
              <Route path="/firebase-setup" element={<FirebaseSetup />} />
              <Route path="/firebase-demo" element={<FirebaseDataDemo />} />
              <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
              <Route path="/admin/setup" element={<AdminSetup />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/staff/login" element={<StaffLogin />} />
              <Route path="/customer-invitation/:invitationCode" element={<CustomerInvitation />} />
              
              {/* Protected customer routes */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/order-details" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
              <Route path="/scheduling" element={<ProtectedRoute><Scheduling /></ProtectedRoute>} />
              <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
              <Route path="/order-tracking" element={<ProtectedRoute><OrderTracking /></ProtectedRoute>} />
              <Route path="/my-orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="/location-contact" element={<ProtectedRoute><LocationContact /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              
              {/* Protected staff routes */}
              <Route path="/staff/dashboard" element={<ProtectedRoute staffOnly><StaffDashboard /></ProtectedRoute>} />
              
              {/* Protected admin routes */}
              <Route path="/admin/*" element={<ProtectedRoute adminOnly><AdminRoutes /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;