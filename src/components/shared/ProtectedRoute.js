import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../services/auth';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, adminOnly = false, staffOnly = false }) => {
  const { currentUser, loading, getUserData } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (currentUser) {
        try {
          const userData = await getUserData(currentUser.uid);
          setUserRole(userData?.role || 'customer');
        } catch (error) {
          console.error('Error fetching user role:', error);
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

  // Redirect to appropriate login if not authenticated
  if (!currentUser) {
    if (adminOnly) return <Navigate to="/admin/login" replace />;
    if (staffOnly) return <Navigate to="/staff/login" replace />;
    return <Navigate to="/login" replace />;
  }

  // Role-based access control
  if (adminOnly && userRole !== 'admin') {
    // Redirect based on actual role
    if (userRole === 'staff') return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  if (staffOnly && userRole !== 'staff') {
    // Redirect based on actual role
    if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  // Render the protected component
  return children;
};

export default ProtectedRoute;
