import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './services/auth';
import Layout from './components/shared/Layout';
import SplashScreen from './components/customer/SplashScreen';
import LoginSignup from './components/customer/LoginSignup';
import Dashboard from './components/customer/Dashboard';
import ServiceSelection from './components/customer/ServiceSelection';
import OrderDetails from './components/customer/OrderDetails';
import Scheduling from './components/customer/Scheduling';
import Payment from './components/customer/Payment';
import OrderConfirmation from './components/customer/OrderConfirmation';
import OrderTracking from './components/customer/OrderTracking';
import MyOrders from './components/customer/MyOrders';
import LocationContact from './components/customer/LocationContact';
import Profile from './components/customer/Profile';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import OrderManagement from './components/admin/OrderManagement';
import CustomerManagement from './components/admin/CustomerManagement';
import Inventory from './components/admin/Inventory';
import DeliveryManagement from './components/admin/DeliveryManagement';
import Reports from './components/admin/Reports';
import NotificationCenter from './components/admin/NotificationCenter';
import StaffCustomerRegistration from './components/admin/StaffCustomerRegistration';
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
      
      if (isStandalone) {
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
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/login" element={<LoginSignup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/services" element={<ServiceSelection />} />
            <Route path="/order-details" element={<OrderDetails />} />
            <Route path="/scheduling" element={<Scheduling />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/order-tracking" element={<OrderTracking />} />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/location-contact" element={<LocationContact />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/firebase-setup" element={<FirebaseSetup />} />
            <Route path="/firebase-demo" element={<FirebaseDataDemo />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<OrderManagement />} />
            <Route path="/admin/customers" element={<CustomerManagement />} />
            <Route path="/admin/inventory" element={<Inventory />} />
            <Route path="/admin/delivery" element={<DeliveryManagement />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/notifications" element={<NotificationCenter />} />
            <Route path="/admin/register-customer" element={<StaffCustomerRegistration />} />
            <Route path="/customer-invitation/:invitationCode" element={<CustomerInvitation />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;