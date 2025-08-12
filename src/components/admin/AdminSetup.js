import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';

const AdminSetup = () => {
  const [setupStatus, setSetupStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [convertEmail, setConvertEmail] = useState('');
  const [convertPassword, setConvertPassword] = useState('');

  const convertExistingUserToAdmin = async () => {
    if (!convertEmail || !convertPassword) {
      setSetupStatus({
        type: 'error',
        message: 'Please enter both email and password'
      });
      return;
    }

    setLoading(true);
    setSetupStatus(null);

    try {
      console.log('Converting existing user to admin...');
      
      // Sign in with the provided credentials to verify them
      const userCredential = await signInWithEmailAndPassword(auth, convertEmail, convertPassword);
      const user = userCredential.user;
      
      // Check if user document exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (userDoc.exists()) {
        // Update existing user to admin role
        await updateDoc(doc(db, 'users', user.uid), {
          role: 'admin',
          isActive: true,
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
        
        console.log('User converted to admin successfully');
        setSetupStatus({
          type: 'success',
          message: `✅ User ${convertEmail} has been successfully converted to admin! You can now login with these credentials at /admin/login.`
        });
      } else {
        // Create user document if it doesn't exist in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          email: convertEmail,
          name: user.displayName || 'Admin User',
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
        
        setSetupStatus({
          type: 'success',
          message: `✅ User ${convertEmail} has been created as admin in Firestore! You can now login with these credentials at /admin/login.`
        });
      }
    } catch (error) {
      console.error('Error converting user to admin:', error);
      let errorMessage = 'Failed to convert user to admin';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password for this email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      }
      
      setSetupStatus({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🛡️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Setup</h1>
          <p className="text-gray-600">Convert existing Firebase user to admin</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Email
            </label>
            <input
              type="email"
              value={convertEmail}
              onChange={(e) => setConvertEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter user email to convert to admin"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User Password
            </label>
            <input
              type="password"
              value={convertPassword}
              onChange={(e) => setConvertPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter user password"
              disabled={loading}
            />
          </div>

          <button
            onClick={convertExistingUserToAdmin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Converting to Admin...
              </div>
            ) : (
              'Convert User to Admin'
            )}
          </button>

          {setupStatus && (
            <div className={`p-4 rounded-lg ${
              setupStatus.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className={`text-sm ${
                setupStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {setupStatus.message}
              </div>
              {setupStatus.type === 'success' && (
                <div className="mt-3">
                  <a
                    href="/admin/login"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Go to Admin Login →
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="text-center">
            <a
              href="/"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to Home
            </a>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Instructions:</h3>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Enter the email and password of an existing Firebase user</li>
            <li>2. Click "Convert User to Admin" to upgrade their role</li>
            <li>3. They can then login at /admin/login with their credentials</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
