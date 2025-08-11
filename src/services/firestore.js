import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Function to add a new user to Firestore
export const addUser = async (userData) => {
  try {
    const userRef = doc(db, 'users', userData.user_id);
    await setDoc(userRef, userData);
    return { success: true };
  } catch (error) {
    console.error("Error adding user: ", error);
    return { success: false, error };
  }
};

// Function to get user data by user ID
export const getUserById = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error("Error getting user: ", error);
    return { success: false, error };
  }
};

// Function to add a new order
export const addOrder = async (orderData) => {
  try {
    const ordersRef = collection(db, 'orders');
    const docRef = await addDoc(ordersRef, {
      ...orderData,
      created_at: serverTimestamp(),
      status: 'placed'
    });
    return { success: true, orderId: docRef.id };
  } catch (error) {
    console.error("Error adding order: ", error);
    return { success: false, error };
  }
};

// Function to get user orders
export const getUserOrders = async (userId) => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('user_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  } catch (error) {
    console.error("Error getting orders: ", error);
    return [];
  }
};

// Function to update order status
export const updateOrderStatus = async (orderId, status) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
    return { success: true };
  } catch (error) {
    console.error("Error updating order status: ", error);
    return { success: false, error };
  }
};

// Function to get all orders (for admin)
export const getAllOrders = async () => {
  try {
    const ordersRef = collection(db, 'orders');
    const q = query(ordersRef, orderBy('created_at', 'desc'));
    const querySnapshot = await getDocs(q);
    const orders = [];
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    return orders;
  } catch (error) {
    console.error("Error getting all orders: ", error);
    return [];
  }
};

// Function to get all users (for admin)
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    const users = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() });
    });
    return users;
  } catch (error) {
    console.error("Error getting all users: ", error);
    return [];
  }
};

// Additional functions needed by components

// Export firestore instance
export const firestore = db;

// Function to get orders (alias for getAllOrders)
export const getOrders = getAllOrders;

// Function to get order status
export const getOrderStatus = async (orderId) => {
  try {
    const orderRef = doc(db, 'orders', orderId);
    const docSnap = await getDoc(orderRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: 'Order not found' };
    }
  } catch (error) {
    console.error("Error getting order status: ", error);
    return { success: false, error };
  }
};

// Function to get user profile
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error("Error getting user profile: ", error);
    throw error;
  }
};

// Function to update user profile
export const updateUserProfile = async (userId, profileData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, profileData);
    return { success: true };
  } catch (error) {
    console.error("Error updating user profile: ", error);
    throw error;
  }
};

// Function to get metrics for admin dashboard
export const getMetrics = async () => {
  try {
    const ordersRef = collection(db, 'orders');
    const usersRef = collection(db, 'users');
    
    const [ordersSnapshot, usersSnapshot] = await Promise.all([
      getDocs(ordersRef),
      getDocs(usersRef)
    ]);
    
    const totalOrders = ordersSnapshot.size;
    const totalUsers = usersSnapshot.size;
    
    // Calculate revenue from orders
    let totalRevenue = 0;
    let pendingOrders = 0;
    let completedOrders = 0;
    
    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      if (order.total_price) {
        totalRevenue += order.total_price;
      }
      if (order.status === 'pending') {
        pendingOrders++;
      } else if (order.status === 'completed') {
        completedOrders++;
      }
    });
    
    return {
      totalOrders,
      totalUsers,
      totalRevenue,
      pendingOrders,
      completedOrders
    };
  } catch (error) {
    console.error("Error getting metrics: ", error);
    return {
      totalOrders: 0,
      totalUsers: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      completedOrders: 0
    };
  }
};