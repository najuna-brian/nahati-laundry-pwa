import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  
  const isAdmin = location.pathname.startsWith('/admin');

  if (isAdmin) {
    return null; // Admin pages have their own navigation
  }

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navigationItems = [
    {
      name: 'Home',
      path: '/dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Services',
      path: '/services',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    {
      name: 'Orders',
      path: '/my-orders',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      name: 'Contact',
      path: '/location-contact',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  const isActive = (path) => location.pathname === path;

  if (!currentUser) {
    return null; // Hide navigation for non-authenticated users
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 transform relative ${
              isActive(item.path)
                ? 'text-blue-600 scale-105'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:scale-95'
            }`}
            style={{
              willChange: 'transform'
            }}
          >
            {/* Active indicator */}
            {isActive(item.path) && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-b-full"></div>
            )}
            
            <div className={`mb-1 transition-transform duration-200 ${
              isActive(item.path) ? 'transform -translate-y-0.5' : ''
            }`}>
              {item.icon}
            </div>
            <span className={`text-xs font-medium transition-all duration-200 ${
              isActive(item.path) ? 'font-semibold' : ''
            }`}>
              {item.name}
            </span>
            
            {/* Ripple effect */}
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <div className={`absolute inset-0 transition-opacity duration-300 ${
                isActive(item.path) ? 'opacity-10' : 'opacity-0 hover:opacity-5'
              } bg-blue-600`}></div>
            </div>
          </Link>
        ))}
        
        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center flex-1 h-full transition-all duration-300 transform relative text-gray-500 hover:text-red-600 hover:bg-gray-50 active:scale-95"
          style={{
            willChange: 'transform'
          }}
        >
          <div className="mb-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <span className="text-xs font-medium">
            Logout
          </span>
        </button>
      </div>
    </nav>
  );
};

export default Navigation;