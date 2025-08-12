import React, { useState } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../services/auth';

const RoleUpdateTool = () => {
  const [email, setEmail] = useState('');
  const [newRole, setNewRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { currentUser } = useAuth();

  const updateUserRole = async () => {
    if (!email) {
      setMessage('Please enter an email address');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // You'll need to implement a way to find user by email
      // For now, we'll assume you know the user ID
      const userQuery = await getDoc(doc(db, 'users', currentUser?.uid));
      
      if (userQuery.exists()) {
        await updateDoc(doc(db, 'users', currentUser.uid), {
          role: newRole,
          isActive: true,
          updatedAt: new Date()
        });
        setMessage(`✅ User role updated to ${newRole} successfully!`);
      } else {
        setMessage('❌ User not found');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Update User Role</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter email address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Role
          </label>
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="customer">Customer</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          onClick={updateUserRole}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Role'}
        </button>

        {message && (
          <p className={`text-sm ${message.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 rounded-md">
        <h3 className="font-medium text-yellow-800">Quick Fix for Current Issue:</h3>
        <p className="text-sm text-yellow-700 mt-1">
          Your email is currently registered as a 'customer'. To access admin features, 
          we need to update your role to 'admin' in the database.
        </p>
      </div>
    </div>
  );
};

export default RoleUpdateTool;
