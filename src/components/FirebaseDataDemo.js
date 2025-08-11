import React, { useState } from 'react';
import { 
  useFirestoreCollection, 
  useDashboardStats 
} from '../hooks/useFirebase';
import { 
  searchOrders 
} from '../services/dataReader';
import { addAllSampleData, addRandomOrders } from '../services/testData';
import LoadingSpinner from '../components/shared/LoadingSpinner';

const FirebaseDataDemo = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [testDataLoading, setTestDataLoading] = useState(false);
  const [testDataMessage, setTestDataMessage] = useState('');

  // Real-time data using hooks
  const { data: allOrders, loading: ordersLoading, error: ordersError } = useFirestoreCollection('orders', {
    orderBy: ['createdAt', 'desc'],
    limit: 10
  });

  const { data: allUsers, loading: usersLoading } = useFirestoreCollection('users');
  
  const { stats, loading: statsLoading } = useDashboardStats();

  // Manual search function
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearchLoading(true);
    try {
      const results = await searchOrders(searchTerm);
      setSearchResults(results.data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Add test data function
  const handleAddTestData = async () => {
    setTestDataLoading(true);
    setTestDataMessage('');
    
    try {
      const result = await addAllSampleData();
      setTestDataMessage(result.success ? result.message : `Error: ${result.error}`);
    } catch (error) {
      setTestDataMessage(`Error: ${error.message}`);
    } finally {
      setTestDataLoading(false);
    }
  };

  // Add random orders function
  const handleAddRandomOrders = async () => {
    setTestDataLoading(true);
    setTestDataMessage('');
    
    try {
      const result = await addRandomOrders(5);
      setTestDataMessage(result.success ? result.message : `Error: ${result.error}`);
    } catch (error) {
      setTestDataMessage(`Error: ${error.message}`);
    } finally {
      setTestDataLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Firebase Data Reading Demo</h1>
        
        {/* Test Data Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Data Controls</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            <button
              onClick={handleAddTestData}
              disabled={testDataLoading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {testDataLoading ? 'Adding...' : 'Add Sample Data'}
            </button>
            <button
              onClick={handleAddRandomOrders}
              disabled={testDataLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {testDataLoading ? 'Adding...' : 'Add 5 Random Orders'}
            </button>
          </div>
          {testDataMessage && (
            <div className={`p-3 rounded-md ${testDataMessage.includes('Error') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
              {testDataMessage}
            </div>
          )}
          <p className="text-sm text-gray-600 mt-2">
            Add test data to see the Firebase reading functionality in action. Make sure your Firebase is properly configured.
          </p>
        </div>
        
        {/* Dashboard Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Dashboard Statistics</h2>
          {statsLoading ? (
            <LoadingSpinner />
          ) : stats ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.totalOrders}</p>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.totalUsers}</p>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
                <p className="text-sm text-gray-600">Pending Orders</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.completedOrders}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">UGX {stats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Revenue</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">No statistics available</p>
          )}
        </div>

        {/* Search Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Search Orders</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by customer name or order ID..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={searchLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {searchLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">{searchResults.length} results found</p>
              {searchResults.map((order) => (
                <div key={order.id} className="p-3 border border-gray-200 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Order #{order.order_id || order.id}</p>
                      <p className="text-sm text-gray-600">Customer: {order.customer_name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Status: {order.status || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">UGX {(order.total_price || 0).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">
                        {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Orders (Real-time)</h2>
            {ordersLoading ? (
              <LoadingSpinner />
            ) : ordersError ? (
              <p className="text-red-600">Error: {ordersError}</p>
            ) : allOrders.length > 0 ? (
              <div className="space-y-3">
                {allOrders.slice(0, 5).map((order) => (
                  <div key={order.id} className="p-3 border border-gray-200 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">Order #{order.order_id || order.id.slice(-6)}</p>
                        <p className="text-sm text-gray-600">
                          Customer: {order.customer_name || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Status: <span className="capitalize">{order.status || 'pending'}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">UGX {(order.total_price || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-500">
                          {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No orders found</p>
                <p className="text-sm text-gray-400 mt-2">Orders will appear here when customers place them</p>
              </div>
            )}
          </div>

          {/* All Users */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">All Users (Real-time)</h2>
            {usersLoading ? (
              <LoadingSpinner />
            ) : allUsers.length > 0 ? (
              <div className="space-y-3">
                {allUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="p-3 border border-gray-200 rounded-md">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{user.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{user.email || 'N/A'}</p>
                        <p className="text-sm text-gray-600">Role: {user.role || 'customer'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {allUsers.length > 5 && (
                  <p className="text-sm text-gray-500 text-center">
                    ... and {allUsers.length - 5} more users
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found</p>
                <p className="text-sm text-gray-400 mt-2">Users will appear here when they register</p>
              </div>
            )}
          </div>
        </div>

        {/* Code Examples */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">How to Use Firebase Data Reading</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">1. Real-time Collection Data:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { useFirestoreCollection } from '../hooks/useFirebase';

const { data, loading, error } = useFirestoreCollection('orders', {
  where: [['status', '==', 'pending']],
  orderBy: ['createdAt', 'desc'],
  limit: 10
});`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">2. Real-time Document Data:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { useFirestoreDocument } from '../hooks/useFirebase';

const { data, loading, error } = useFirestoreDocument('users', userId);`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">3. One-time Data Fetching:</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
{`import { getCollectionData } from '../services/dataReader';

const fetchOrders = async () => {
  const result = await getCollectionData('orders', {
    where: [['userId', '==', currentUser.uid]],
    orderBy: ['createdAt', 'desc']
  });
  
  if (result.success) {
    console.log(result.data);
  }
};`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseDataDemo;
