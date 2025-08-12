import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from '../admin/AdminDashboard';
import OrderManagement from '../admin/OrderManagement';
import CustomerManagement from '../admin/CustomerManagement';
import Inventory from '../admin/Inventory';
import DeliveryManagement from '../admin/DeliveryManagement';
import Reports from '../admin/Reports';
import NotificationCenter from '../admin/NotificationCenter';
import StaffCustomerRegistration from '../admin/StaffCustomerRegistration';
import StaffManagement from '../admin/StaffManagement';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route path="/orders" element={<OrderManagement />} />
      <Route path="/customers" element={<CustomerManagement />} />
      <Route path="/staff" element={<StaffManagement />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/delivery" element={<DeliveryManagement />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/notifications" element={<NotificationCenter />} />
      <Route path="/register-customer" element={<StaffCustomerRegistration />} />
    </Routes>
  );
};

export default AdminRoutes;
