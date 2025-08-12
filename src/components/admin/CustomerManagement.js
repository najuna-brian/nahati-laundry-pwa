import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import LoadingSpinner from '../shared/LoadingSpinner';

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, active, inactive

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const customersQuery = query(
                collection(db, 'users'),
                where('role', '==', 'customer'),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(customersQuery);
            const customerList = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));
            setCustomers(customerList);
        } catch (error) {
            console.error("Error fetching customers:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCustomerStatus = async (customerId, currentStatus) => {
        try {
            const customerRef = doc(db, 'users', customerId);
            await updateDoc(customerRef, {
                isActive: !currentStatus,
                updatedAt: new Date()
            });
            
            // Update local state
            setCustomers(customers.map(customer => 
                customer.id === customerId 
                    ? { ...customer, isActive: !currentStatus }
                    : customer
            ));
        } catch (error) {
            console.error("Error updating customer status:", error);
            alert('Error updating customer status');
        }
    };

    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            customer.phone?.includes(searchTerm);
        
        const matchesFilter = filter === 'all' || 
                            (filter === 'active' && customer.isActive !== false) ||
                            (filter === 'inactive' && customer.isActive === false);
                            
        return matchesSearch && matchesFilter;
    });

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer Management</h1>
                
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <input 
                            type="text" 
                            placeholder="Search by name, email, or phone..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Customers</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-blue-900">Total Customers</h3>
                        <p className="text-2xl font-bold text-blue-600">{customers.length}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-green-900">Active Customers</h3>
                        <p className="text-2xl font-bold text-green-600">
                            {customers.filter(c => c.isActive !== false).length}
                        </p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-orange-900">New This Month</h3>
                        <p className="text-2xl font-bold text-orange-600">
                            {customers.filter(c => {
                                const oneMonthAgo = new Date();
                                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                                return c.createdAt > oneMonthAgo;
                            }).length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Customer Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Joined
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
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
                                                ID: {customer.id.slice(0, 8)}...
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{customer.email}</div>
                                    <div className="text-sm text-gray-500">{customer.phone || 'No phone'}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        customer.isActive !== false 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {customer.isActive !== false ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {customer.createdAt?.toLocaleDateString() || 'Unknown'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <button
                                        onClick={() => toggleCustomerStatus(customer.id, customer.isActive !== false)}
                                        className={`${
                                            customer.isActive !== false 
                                                ? 'text-red-600 hover:text-red-900' 
                                                : 'text-green-600 hover:text-green-900'
                                        } transition duration-200`}
                                    >
                                        {customer.isActive !== false ? 'Deactivate' : 'Activate'}
                                    </button>
                                    <button className="ml-4 text-blue-600 hover:text-blue-900 transition duration-200">
                                        View Orders
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredCustomers.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <div className="mb-2">👥</div>
                        <p>No customers found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerManagement;