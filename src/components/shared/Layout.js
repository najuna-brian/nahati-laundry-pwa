import React from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import AdminNavigation from './AdminNavigation';
import WhatsAppButton from './WhatsAppButton';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Check if current page is admin
  const isAdminPage = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';
  
  // Hide customer navigation on splash screen and admin pages
  const hideNavigation = location.pathname === '/splash' || location.pathname.startsWith('/admin');
  
  // Show WhatsApp button on customer pages only
  const showWhatsApp = !location.pathname.startsWith('/admin') && location.pathname !== '/splash';
  
  return (
    <div className="min-h-screen bg-gray-50 ios-inset">
      {isAdminPage && <AdminNavigation />}
      {!hideNavigation && <Navigation />}
      <main className={`${!hideNavigation ? 'pb-20' : ''} ${isAdminPage ? 'pt-16' : ''} transition-all duration-300`}>
        {children}
      </main>
      {showWhatsApp && <WhatsAppButton />}
    </div>
  );
};

export default Layout;