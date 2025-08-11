import React from 'react';
import { useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import WhatsAppButton from './WhatsAppButton';

const Layout = ({ children }) => {
  const location = useLocation();
  
  // Hide navigation on splash screen and admin pages
  const hideNavigation = location.pathname === '/splash' || location.pathname.startsWith('/admin');
  
  // Show WhatsApp button on customer pages only
  const showWhatsApp = !location.pathname.startsWith('/admin') && location.pathname !== '/splash';
  
  return (
    <div className="min-h-screen bg-gray-50 ios-inset">
      {!hideNavigation && <Navigation />}
      <main className={`${!hideNavigation ? 'pb-20' : ''} transition-all duration-300`}>
        {children}
      </main>
      {showWhatsApp && <WhatsAppButton />}
    </div>
  );
};

export default Layout;