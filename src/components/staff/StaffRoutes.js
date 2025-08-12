import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StaffDashboard from './StaffDashboard';
import StaffOrderManagement from './StaffOrderManagement';
import StaffCustomerService from './StaffCustomerService';

const StaffRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/staff/dashboard" replace />} />
      <Route path="/dashboard" element={<StaffDashboard />} />
      <Route path="/orders" element={<StaffOrderManagement />} />
      <Route path="/customers" element={<StaffCustomerService />} />
    </Routes>
  );
};

export default StaffRoutes;
