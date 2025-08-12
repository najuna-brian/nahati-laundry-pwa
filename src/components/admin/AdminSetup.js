import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';

const AdminSetup = () => {
  const [setupStatus, setSetupStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const defaultAdminCredentials = {
    email: 'nahatico.ltd@gmail.com',
    password: 'Nahati2025!',
    name: 'System Administrator',
    phone: '+256200981445'
  };

  const createDefaultAdminAccount = async () => {
    try {
      console.log('Creating default admin account...');
      
      // Create authentication account
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        defaultAdminCredentials.email, 
        defaultAdminCredentials.password
      );
      
      const user = userCredential.user;
      console.log('Admin auth account created:', user.uid);
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: defaultAdminCredentials.email,
        name: defaultAdminCredentials.name,
        phone: defaultAdminCredentials.phone,
        role: 'admin',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        permissions: {
          manageUsers: true,
          manageOrders: true,
          manageInventory: true,
          viewReports: true,
          manageDeliveries: true,
          sendNotifications: true,
          manageStaff: true
        }
      });
      
      console.log('✅ Default admin account created successfully!');
      
      return {
        success: true,
        uid: user.uid,
        email: defaultAdminCredentials.email
      };
      
    } catch (error) {
      console.error('❌ Error creating admin account:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        return {
          success: true,
          message: 'Admin account already exists'
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }
  };

  const handleCreateAdmin = async () => {
    setLoading(true);
    setSetupStatus(null);
    
    try {
      const result = await createDefaultAdminAccount();
      setSetupStatus(result);
    } catch (error) {
      setSetupStatus({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">⚙️</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Nahati Admin Setup
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Create the default administrator account
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Default Admin Credentials</h3>
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <p className="text-sm text-gray-700">
              <strong>Email:</strong> {defaultAdminCredentials.email}<br/>
              <strong>Password:</strong> {defaultAdminCredentials.password}<br/>
              <strong>Name:</strong> {defaultAdminCredentials.name}<br/>
              <strong>Phone:</strong> {defaultAdminCredentials.phone}
            </p>
          </div>

          {setupStatus && (
            <div className={`p-4 rounded-md mb-4 ${
              setupStatus.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <p className={`text-sm ${
                setupStatus.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {setupStatus.success 
                  ? '✅ Admin account created successfully! You can now login.' 
                  : `❌ Error: ${setupStatus.error}`}
              </p>
              {setupStatus.message && (
                <p className="text-sm text-blue-800 mt-1">
                  ℹ️ {setupStatus.message}
                </p>
              )}
            </div>
          )}

          <button
            onClick={handleCreateAdmin}
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
          </button>

          <div className="mt-4 text-center">
            <a 
              href="/admin/login" 
              className="text-blue-600 hover:text-blue-500 text-sm"
            >
              Already have admin account? Login here
            </a>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Security Note</h4>
          <p className="text-xs text-yellow-700">
            This setup page creates a default admin account for initial system access. 
            After creating the account, you should change the password from the admin dashboard 
            for better security.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
