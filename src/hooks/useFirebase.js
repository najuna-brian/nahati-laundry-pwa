import { useState, useEffect, useRef } from 'react';
import { 
  listenToCollection, 
  listenToDocument, 
  getCollectionData, 
  getDocumentById,
  getUserOrders,
  getOrdersByStatus,
  getDashboardStats
} from '../services/dataReader';

/**
 * Custom hook for real-time collection data
 * @param {string} collectionName - Name of the collection
 * @param {object} options - Query options
 * @returns {object} { data, loading, error }
 */
export const useFirestoreCollection = (collectionName, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const handleData = (documents, err) => {
      if (err) {
        setError(err.message);
        setData([]);
      } else {
        setData(documents || []);
        setError(null);
      }
      setLoading(false);
    };

    // Set up real-time listener
    unsubscribeRef.current = listenToCollection(collectionName, handleData, options);

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [collectionName, JSON.stringify(options)]);

  return { data, loading, error };
};

/**
 * Custom hook for real-time document data
 * @param {string} collectionName - Name of the collection
 * @param {string} documentId - ID of the document
 * @returns {object} { data, loading, error }
 */
export const useFirestoreDocument = (collectionName, documentId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!documentId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const handleData = (document, err) => {
      if (err) {
        setError(err.message);
        setData(null);
      } else {
        setData(document);
        setError(null);
      }
      setLoading(false);
    };

    // Set up real-time listener
    unsubscribeRef.current = listenToDocument(collectionName, documentId, handleData);

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [collectionName, documentId]);

  return { data, loading, error };
};

/**
 * Custom hook for user's orders
 * @param {string} userId - User ID
 * @returns {object} { orders, loading, error, refreshOrders }
 */
export const useUserOrders = (userId) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);

  const refreshOrders = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const result = await getUserOrders(userId);
      if (result.success) {
        setOrders(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const handleData = (documents, err) => {
      if (err) {
        setError(err.message);
        setOrders([]);
      } else {
        setOrders(documents || []);
        setError(null);
      }
      setLoading(false);
    };

    // Set up real-time listener for user orders
    unsubscribeRef.current = listenToCollection('orders', handleData, {
      where: [['user_id', '==', userId]],
      orderBy: ['created_at', 'desc']
    });

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [userId]);

  return { orders, loading, error, refreshOrders };
};

/**
 * Custom hook for orders by status
 * @param {string} status - Order status
 * @returns {object} { orders, loading, error, refreshOrders }
 */
export const useOrdersByStatus = (status) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshOrders = async () => {
    if (!status) return;
    
    setLoading(true);
    try {
      const result = await getOrdersByStatus(status);
      if (result.success) {
        setOrders(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshOrders();
  }, [status]);

  return { orders, loading, error, refreshOrders };
};

/**
 * Custom hook for dashboard statistics
 * @returns {object} { stats, loading, error, refreshStats }
 */
export const useDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshStats = async () => {
    setLoading(true);
    try {
      const result = await getDashboardStats();
      if (result.success) {
        setStats(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshStats();
  }, []);

  return { stats, loading, error, refreshStats };
};

/**
 * Custom hook for one-time data fetching
 * @param {function} fetchFunction - Function that returns a promise
 * @param {array} dependencies - Dependencies array for useEffect
 * @returns {object} { data, loading, error, refetch }
 */
export const useAsyncData = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, dependencies);

  return { data, loading, error, refetch };
};

// Export all hooks
export default {
  useFirestoreCollection,
  useFirestoreDocument,
  useUserOrders,
  useOrdersByStatus,
  useDashboardStats,
  useAsyncData
};
