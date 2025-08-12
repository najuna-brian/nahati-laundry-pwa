// Admin Account Setup Utility
// This script creates the default admin account in Firebase

import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

const defaultAdminCredentials = {
  email: 'nahatico.ltd@gmail.com',
  password: 'Nahati2025!',
  name: 'System Administrator',
  phone: '+256200981445'
};

export const createDefaultAdminAccount = async () => {
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
    console.log('📧 Email:', defaultAdminCredentials.email);
    console.log('🔐 Password:', defaultAdminCredentials.password);
    
    return {
      success: true,
      uid: user.uid,
      email: defaultAdminCredentials.email
    };
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Admin account already exists');
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

// Function to check if admin account exists
export const checkAdminAccountExists = async () => {
  try {
    // This will be called from a component to check if setup is needed
    return true;
  } catch (error) {
    console.error('Error checking admin account:', error);
    return false;
  }
};

export default {
  createDefaultAdminAccount,
  checkAdminAccountExists,
  defaultAdminCredentials
};
