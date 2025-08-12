import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../services/auth';
import LoadingSpinner from '../shared/LoadingSpinner';

const StaffCustomerService = () => {
  const { currentUser } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const customersQuery = query(
        collection(db, 'users'),
        where('role', '==', 'customer')
      );
      const snapshot = await getDocs(customersQuery);
      const customersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date()
      }));
      setCustomers(customersList);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomerStatus = async (customerId, currentStatus) => {
    try {
      const customerRef = doc(db, 'users', customerId);
      await updateDoc(customerRef, {
        isActive: !currentStatus,
        updatedAt: new Date(),
        updatedBy: currentUser.uid
      });
      
      setCustomers(customers.map(customer =>
        customer.id === customerId
          ? { ...customer, isActive: !currentStatus }
          : customer
      ));
    } catch (error) {
      console.error('Error updating customer status:', error);
      alert('Failed to update customer status');
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer Service</h1>
        
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCustomers.map(customer => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {customer.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {customer.name || 'No Name'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Joined: {customer.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{customer.email}</div>
                  <div className="text-sm text-gray-500">{customer.phone || 'No phone'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    customer.isActive !== false
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {customer.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                  <button
                    onClick={() => toggleCustomerStatus(customer.id, customer.isActive !== false)}
                    className={`${
                      customer.isActive !== false
                        ? 'text-red-600 hover:text-red-900'
                        : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {customer.isActive !== false ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="text-blue-600 hover:text-blue-900">
                    View Orders
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredCustomers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No customers found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffCustomerService;
