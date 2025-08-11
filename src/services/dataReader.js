import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// ==================== BASIC DATA READING FUNCTIONS ====================

/**
 * Listen to real-time changes in a collection
 * @param {string} collectionName - Name of the collection
 * @param {function} callback - Callback function to handle data changes
 * @param {object} options - Query options (where, orderBy, limit)
 * @returns {function} Unsubscribe function
 */
export const listenToCollection = (collectionName, callback, options = {}) => {
  try {
    let q = collection(db, collectionName);
    
    // Apply filters
    if (options.where) {
      options.where.forEach(condition => {
        q = query(q, where(...condition));
      });
    }
    
    // Apply ordering
    if (options.orderBy) {
      q = query(q, orderBy(...options.orderBy));
    }
    
    // Apply limit
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    // Listen to real-time changes
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const documents = [];
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(documents);
    }, (error) => {
      console.error(`Error listening to ${collectionName}:`, error);
      callback(null, error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error(`Error setting up listener for ${collectionName}:`, error);
    return null;
  }
};

/**
 * Listen to real-time changes in a single document
 * @param {string} collectionName - Name of the collection
 * @param {string} documentId - ID of the document
 * @param {function} callback - Callback function to handle data changes
 * @returns {function} Unsubscribe function
 */
export const listenToDocument = (collectionName, documentId, callback) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback({
          id: doc.id,
          ...doc.data()
        });
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Error listening to document ${documentId}:`, error);
      callback(null, error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error(`Error setting up document listener:`, error);
    return null;
  }
};

// ==================== ONE-TIME DATA READING ====================

/**
 * Get all documents from a collection with optional filtering
 * @param {string} collectionName - Name of the collection
 * @param {object} options - Query options
 * @returns {Promise<Array>} Array of documents
 */
export const getCollectionData = async (collectionName, options = {}) => {
  try {
    let q = collection(db, collectionName);
    
    // Apply filters
    if (options.where) {
      options.where.forEach(condition => {
        q = query(q, where(...condition));
      });
    }
    
    // Apply ordering
    if (options.orderBy) {
      q = query(q, orderBy(...options.orderBy));
    }
    
    // Apply limit
    if (options.limit) {
      q = query(q, limit(options.limit));
    }
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return {
      success: true,
      data: documents,
      count: documents.length
    };
  } catch (error) {
    console.error(`Error getting ${collectionName} data:`, error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

/**
 * Get a single document by ID
 * @param {string} collectionName - Name of the collection
 * @param {string} documentId - ID of the document
 * @returns {Promise<Object>} Document data
 */
export const getDocumentById = async (collectionName, documentId) => {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        success: true,
        data: {
          id: docSnap.id,
          ...docSnap.data()
        }
      };
    } else {
      return {
        success: false,
        error: 'Document not found',
        data: null
      };
    }
  } catch (error) {
    console.error(`Error getting document ${documentId}:`, error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

// ==================== LAUNDRY-SPECIFIC DATA READERS ====================

/**
 * Get all orders for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} User's orders
 */
export const getUserOrders = async (userId) => {
  return await getCollectionData('orders', {
    where: [['userId', '==', userId]],
    orderBy: ['createdAt', 'desc']
  });
};

/**
 * Get orders by status
 * @param {string} status - Order status (pending, in-progress, completed, etc.)
 * @returns {Promise<Array>} Orders with specified status
 */
export const getOrdersByStatus = async (status) => {
  return await getCollectionData('orders', {
    where: [['status', '==', status]],
    orderBy: ['createdAt', 'desc']
  });
};

/**
 * Get recent orders (last 50)
 * @returns {Promise<Array>} Recent orders
 */
export const getRecentOrders = async () => {
  return await getCollectionData('orders', {
    orderBy: ['createdAt', 'desc'],
    limit: 50
  });
};

/**
 * Get active orders (not completed or cancelled)
 * @returns {Promise<Array>} Active orders
 */
export const getActiveOrders = async () => {
  return await getCollectionData('orders', {
    where: [['status', 'in', ['pending', 'confirmed', 'picked-up', 'in-progress', 'ready']]],
    orderBy: ['createdAt', 'desc']
  });
};

/**
 * Listen to user's orders in real-time
 * @param {string} userId - User ID
 * @param {function} callback - Callback function
 * @returns {function} Unsubscribe function
 */
export const listenToUserOrders = (userId, callback) => {
  return listenToCollection('orders', callback, {
    where: [['userId', '==', userId]],
    orderBy: ['createdAt', 'desc']
  });
};

/**
 * Listen to orders by status in real-time
 * @param {string} status - Order status
 * @param {function} callback - Callback function
 * @returns {function} Unsubscribe function
 */
export const listenToOrdersByStatus = (status, callback) => {
  return listenToCollection('orders', callback, {
    where: [['status', '==', status]],
    orderBy: ['createdAt', 'desc']
  });
};

/**
 * Get user profile data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (userId) => {
  return await getDocumentById('users', userId);
};

/**
 * Listen to user profile changes
 * @param {string} userId - User ID
 * @param {function} callback - Callback function
 * @returns {function} Unsubscribe function
 */
export const listenToUserProfile = (userId, callback) => {
  return listenToDocument('users', userId, callback);
};

// ==================== ADMIN DATA READERS ====================

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} Dashboard metrics
 */
export const getDashboardStats = async () => {
  try {
    const [ordersResult, usersResult] = await Promise.all([
      getCollectionData('orders'),
      getCollectionData('users')
    ]);
    
    if (!ordersResult.success || !usersResult.success) {
      throw new Error('Failed to fetch dashboard data');
    }
    
    const orders = ordersResult.data;
    const users = usersResult.data;
    
    // Calculate metrics
    const totalOrders = orders.length;
    const totalUsers = users.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const totalRevenue = orders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (order.total_price || 0), 0);
    
    return {
      success: true,
      data: {
        totalOrders,
        totalUsers,
        pendingOrders,
        completedOrders,
        totalRevenue,
        averageOrderValue: totalOrders > 0 ? totalRevenue / completedOrders : 0
      }
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Search orders by customer name or order ID
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Matching orders
 */
export const searchOrders = async (searchTerm) => {
  try {
    // Note: Firestore doesn't support full-text search natively
    // This is a basic implementation - for production, consider using Algolia or similar
    const ordersResult = await getCollectionData('orders');
    
    if (!ordersResult.success) {
      return ordersResult;
    }
    
    const filteredOrders = ordersResult.data.filter(order => 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return {
      success: true,
      data: filteredOrders,
      count: filteredOrders.length
    };
  } catch (error) {
    console.error('Error searching orders:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};

// Export specific functions - removing duplicate exports since functions are already exported individually above
const dataReaderService = {
  getCollectionData,
  getDocumentById,
  listenToCollection,
  listenToDocument,
  getUserOrders,
  getOrdersByStatus,
  getRecentOrders,
  getActiveOrders,
  getUserProfile,
  getDashboardStats,
  searchOrders
};

export default dataReaderService;
