import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { addAllSampleData } from './testData';

/**
 * Firebase Setup and Connection Helper
 * Use this to test your Firebase connection and set up initial data
 */

/**
 * Test Firebase connection
 */
export const testFirebaseConnection = async () => {
  try {
    console.log('🔥 Testing Firebase connection...');
    
    // Test Firestore connection
    const testDoc = doc(db, 'connection-test', 'test');
    await setDoc(testDoc, { 
      timestamp: new Date(),
      message: 'Firebase is connected successfully!' 
    });
    
    console.log('✅ Firestore connection successful!');
    
    // Test Auth connection
    const currentUser = auth.currentUser;
    console.log('🔐 Auth status:', currentUser ? 'User logged in' : 'No user logged in');
    
    return {
      success: true,
      message: 'Firebase connection successful!',
      firestore: true,
      auth: true
    };
  } catch (error) {
    console.error('❌ Firebase connection failed:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};

/**
 * Create admin user for initial setup (handles existing users)
 */
export const createAdminUser = async (email, password, name) => {
  try {
    console.log('👤 Setting up admin user...');
    
    let user;
    let isExistingUser = false;
    
    try {
      // Try to create new user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user = userCredential.user;
      console.log('✅ New admin user created!');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('👤 User already exists, signing in...');
        // User exists, try to sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        user = userCredential.user;
        isExistingUser = true;
        console.log('✅ Signed in to existing user account!');
      } else {
        throw error; // Re-throw other errors
      }
    }
    
    // Update profile if needed
    if (!user.displayName || user.displayName !== name) {
      await updateProfile(user, { displayName: name });
    }
    
    // Save/update admin data to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name: name,
      email: email,
      phone: '',
      addresses: [],
      role: 'admin', // Important: Set as admin
      created_at: isExistingUser ? new Date() : new Date(), // Keep original if exists
      fcm_token: '',
      is_admin: true
    }, { merge: true }); // Use merge to not overwrite existing data
    
    const message = isExistingUser ? 
      'Admin user already exists and has been updated!' : 
      'Admin user created successfully!';
    
    console.log(`✅ ${message}`);
    return {
      success: true,
      message: message,
      user: user,
      isExisting: isExistingUser
    };
  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};

/**
 * Complete Firebase setup (connection test + sample data + admin user)
 */
export const completeFirebaseSetup = async (adminEmail, adminPassword, adminName) => {
  console.log('🚀 Starting complete Firebase setup...');
  
  try {
    // Step 1: Test connection
    const connectionTest = await testFirebaseConnection();
    if (!connectionTest.success) {
      throw new Error(`Connection failed: ${connectionTest.message}`);
    }
    
    // Step 2: Create/update admin user
    const adminResult = await createAdminUser(adminEmail, adminPassword, adminName);
    if (!adminResult.success) {
      throw new Error(`Admin setup failed: ${adminResult.message}`);
    }
    
    // Step 3: Add sample data
    const dataResult = await addAllSampleData();
    if (!dataResult.success) {
      console.warn('⚠️ Sample data failed, but setup continues:', dataResult.error);
    }
    
    console.log('🎉 Firebase setup completed successfully!');
    return {
      success: true,
      message: `Firebase setup completed successfully! ${adminResult.isExisting ? 'Admin user already existed and was updated.' : 'New admin user created.'} You can now use your app.`,
      details: {
        connection: connectionTest.success,
        admin: adminResult.success,
        adminExisted: adminResult.isExisting,
        sampleData: dataResult.success
      }
    };
  } catch (error) {
    console.error('❌ Firebase setup failed:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};

/**
 * Check if Firebase is properly configured
 */
export const checkFirebaseConfig = () => {
  const requiredEnvVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID'
  ];
  
  const missing = requiredEnvVars.filter(envVar => 
    !process.env[envVar] || process.env[envVar].includes('your_') || process.env[envVar].includes('Example')
  );
  
  if (missing.length > 0) {
    return {
      configured: false,
      missing: missing,
      message: `Missing or placeholder Firebase configuration: ${missing.join(', ')}`
    };
  }
  
  return {
    configured: true,
    message: 'Firebase configuration looks good!'
  };
};

/**
 * Get Firebase project info
 */
export const getFirebaseProjectInfo = () => {
  return {
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    environment: process.env.REACT_APP_ENVIRONMENT || 'development',
    configured: checkFirebaseConfig().configured
  };
};

/**
 * Send password reset email
 */
export const sendAdminPasswordReset = async (email) => {
  try {
    console.log('📧 Sending password reset email...');
    
    await sendPasswordResetEmail(auth, email);
    
    console.log('✅ Password reset email sent!');
    return {
      success: true,
      message: 'Password reset email sent! Check your inbox.'
    };
  } catch (error) {
    console.error('❌ Error sending password reset:', error);
    return {
      success: false,
      message: error.message,
      error: error
    };
  }
};

export default {
  testFirebaseConnection,
  createAdminUser,
  completeFirebaseSetup,
  checkFirebaseConfig,
  getFirebaseProjectInfo,
  sendAdminPasswordReset
};
