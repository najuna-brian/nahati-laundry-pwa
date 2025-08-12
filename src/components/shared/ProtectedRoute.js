import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../services/auth';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false, staffOnly = false }) => {
  const { currentUser, loading, getUserData } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (currentUser) {
        try {
          const userData = await getUserData(currentUser.uid);
          if (!userData) {
            console.error('User data not found in Firestore');
            setError('User data not found. Please contact support.');
            setUserRole('customer'); // Fallback
          } else {
            setUserRole(userData.role || 'customer');
            
            // Check if user is active
            if (userData.isActive === false) {
              setError('Your account has been deactivated. Please contact support.');
            }
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
          setError('Failed to verify user permissions.');
          setUserRole('customer'); // Default to customer on error
        }
      }
      setRoleLoading(false);
    };

    if (currentUser) {
      checkUserRole();
    } else {
      setRoleLoading(false);
    }
  }, [currentUser, getUserData]);

  // Show loading spinner while checking authentication and role
  if (loading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show error if there's an issue
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to appropriate login if not authenticated
  if (!currentUser) {
    if (adminOnly) return <Navigate to="/admin/login" replace />;
    if (staffOnly) return <Navigate to="/staff/login" replace />;
    return <Navigate to="/login" replace />;
  }

  // Role-based access control with detailed redirects
  if (adminOnly && userRole !== 'admin') {
    // Provide informative access denied page for wrong role
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-yellow-600 text-5xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
            <p className="text-gray-600 mb-4">
              You need administrator privileges to access this area.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.href = userRole === 'staff' ? '/staff/dashboard' : '/dashboard'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Go to {userRole === 'staff' ? 'Staff' : 'Customer'} Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/admin/login'}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (staffOnly && userRole !== 'staff') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-yellow-600 text-5xl mb-4">👥</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Staff Access Required</h2>
            <p className="text-gray-600 mb-4">
              You need staff privileges to access this area.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => window.location.href = userRole === 'admin' ? '/admin/dashboard' : '/dashboard'}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Go to {userRole === 'admin' ? 'Admin' : 'Customer'} Dashboard
              </button>
              <button
                onClick={() => window.location.href = '/staff/login'}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
              >
                Staff Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the protected component
  return children;
};

export default ProtectedRoute;
