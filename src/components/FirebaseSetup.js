import React, { useState, useEffect } from 'react';
import { 
  testFirebaseConnection, 
  createAdminUser, 
  completeFirebaseSetup,
  checkFirebaseConfig,
  getFirebaseProjectInfo,
  sendAdminPasswordReset
} from '../services/firebaseSetup';
import LoadingSpinner from './shared/LoadingSpinner';

const FirebaseSetup = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [configStatus, setConfigStatus] = useState(null);
  const [projectInfo, setProjectInfo] = useState(null);
  
  // Admin user form
  const [adminForm, setAdminForm] = useState({
    email: 'admin@nahati.com',
    password: '',
    name: 'Nahati Admin'
  });

  useEffect(() => {
    // Check configuration on load
    const config = checkFirebaseConfig();
    setConfigStatus(config);
    
    const info = getFirebaseProjectInfo();
    setProjectInfo(info);
  }, []);

  const handleTestConnection = async () => {
    setLoading(true);
    setMessage('Testing Firebase connection...');
    
    try {
      const result = await testFirebaseConnection();
      setMessage(result.success ? 
        '✅ Firebase connected successfully!' : 
        `❌ Connection failed: ${result.message}`
      );
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (!adminForm.email || !adminForm.password || !adminForm.name) {
      setMessage('❌ Please fill in all admin user fields');
      return;
    }

    setLoading(true);
    setMessage('Creating admin user...');
    
    try {
      const result = await createAdminUser(adminForm.email, adminForm.password, adminForm.name);
      setMessage(result.success ? 
        '✅ Admin user created successfully!' : 
        `❌ Failed to create admin: ${result.message}`
      );
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSetup = async () => {
    if (!adminForm.email || !adminForm.password || !adminForm.name) {
      setMessage('❌ Please fill in admin user details first');
      return;
    }

    setLoading(true);
    setMessage('Running complete Firebase setup...');
    
    try {
      const result = await completeFirebaseSetup(adminForm.email, adminForm.password, adminForm.name);
      setMessage(result.success ? 
        '🎉 Complete setup successful! Your app is ready to use.' : 
        `❌ Setup failed: ${result.message}`
      );
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!adminForm.email) {
      setMessage('❌ Please enter an email address first');
      return;
    }

    setLoading(true);
    setMessage('Sending password reset email...');
    
    try {
      const result = await sendAdminPasswordReset(adminForm.email);
      setMessage(result.success ? 
        '📧 Password reset email sent! Check your inbox and spam folder.' : 
        `❌ Failed to send reset email: ${result.message}`
      );
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">🔥 Firebase Setup</h1>
          <p className="text-gray-600">Set up and test your Firebase connection for Nahati Laundry PWA</p>
        </div>

        {/* Configuration Status */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration Status</h2>
          
          {configStatus && (
            <div className={`p-4 rounded-md mb-4 ${configStatus.configured ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center">
                <span className={`inline-block w-3 h-3 rounded-full mr-3 ${configStatus.configured ? 'bg-green-500' : 'bg-red-500'}`}></span>
                <span className={configStatus.configured ? 'text-green-800' : 'text-red-800'}>
                  {configStatus.message}
                </span>
              </div>
              {!configStatus.configured && configStatus.missing && (
                <div className="mt-2 text-sm text-red-700">
                  <p>Missing configuration:</p>
                  <ul className="list-disc list-inside mt-1">
                    {configStatus.missing.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {projectInfo && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <label className="text-sm font-medium text-gray-600">Project ID</label>
                <p className="text-gray-900">{projectInfo.projectId}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <label className="text-sm font-medium text-gray-600">Auth Domain</label>
                <p className="text-gray-900">{projectInfo.authDomain}</p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Setup Actions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={handleTestConnection}
              disabled={loading || !configStatus?.configured}
              className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <div className="text-lg font-semibold">Test Connection</div>
                <div className="text-sm opacity-90">Verify Firebase works</div>
              </div>
            </button>

            <button
              onClick={handleCreateAdmin}
              disabled={loading || !configStatus?.configured}
              className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <div className="text-lg font-semibold">Create Admin</div>
                <div className="text-sm opacity-90">Set up admin user</div>
              </div>
            </button>

            <button
              onClick={handleCompleteSetup}
              disabled={loading || !configStatus?.configured}
              className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <div className="text-lg font-semibold">Complete Setup</div>
                <div className="text-sm opacity-90">Do everything</div>
              </div>
            </button>
          </div>

          {!configStatus?.configured && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <p className="text-yellow-800 text-sm">
                <strong>⚠️ Configuration Required:</strong> Please update your .env file with actual Firebase credentials before proceeding.
              </p>
            </div>
          )}
        </div>

        {/* Admin User Setup */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Admin User Setup</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
              <input
                type="email"
                value={adminForm.email}
                onChange={(e) => setAdminForm({...adminForm, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="admin@nahati.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={adminForm.password}
                onChange={(e) => setAdminForm({...adminForm, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter strong password"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name</label>
              <input
                type="text"
                value={adminForm.name}
                onChange={(e) => setAdminForm({...adminForm, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nahati Admin"
              />
            </div>
          </div>
          
          {/* Password Reset Helper */}
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Forgot password?</strong> If you already have an account but can't remember the password:
            </p>
            <button
              onClick={handlePasswordReset}
              disabled={loading || !adminForm.email}
              className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Password Reset Email
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {(loading || message) && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            
            {loading && (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
                <span className="ml-3 text-gray-600">Processing...</span>
              </div>
            )}
            
            {message && (
              <div className={`p-4 rounded-md ${
                message.includes('✅') || message.includes('🎉') ? 'bg-green-50 text-green-800' : 
                message.includes('❌') ? 'bg-red-50 text-red-800' : 
                'bg-blue-50 text-blue-800'
              }`}>
                <pre className="whitespace-pre-wrap font-sans">{message}</pre>
              </div>
            )}
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>
          
          <div className="space-y-4 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">1. Configure Firebase:</h3>
              <p>Update your <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file with your actual Firebase project credentials from the Firebase Console.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">2. Test Connection:</h3>
              <p>Click "Test Connection" to verify your Firebase configuration is working.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">3. Setup Admin:</h3>
              <p>Create an admin user account that can manage the laundry business.</p>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">4. Complete Setup:</h3>
              <p>Run the complete setup to initialize everything with sample data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseSetup;
