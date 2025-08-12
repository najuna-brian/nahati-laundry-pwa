import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, where, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import LoadingSpinner from '../shared/LoadingSpinner';

const DeliveryManagement = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [customers, setCustomers] = useState({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // pending, pickedUp, inTransit, delivered
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchDeliveries();
        fetchCustomers();
    }, []);

    const fetchDeliveries = async () => {
        try {
            setLoading(true);
            const deliveriesQuery = query(
                collection(db, 'orders'),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(deliveriesQuery);
            const deliveriesList = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                scheduledDate: doc.data().scheduledDate?.toDate?.() || null
            }));
            setDeliveries(deliveriesList);
        } catch (error) {
            console.error("Error fetching deliveries:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomers = async () => {
        try {
            const customersQuery = query(
                collection(db, 'users'),
                where('role', '==', 'customer')
            );
            const snapshot = await getDocs(customersQuery);
            const customersMap = {};
            snapshot.docs.forEach(doc => {
                customersMap[doc.id] = doc.data();
            });
            setCustomers(customersMap);
        } catch (error) {
            console.error("Error fetching customers:", error);
        }
    };

    const updateDeliveryStatus = async (orderId, newStatus) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { 
                status: newStatus,
                updatedAt: new Date()
            });
            
            setDeliveries(deliveries.map(delivery => 
                delivery.id === orderId 
                    ? { ...delivery, status: newStatus, updatedAt: new Date() } 
                    : delivery
            ));
        } catch (error) {
            console.error("Error updating delivery status:", error);
            alert('Error updating delivery status');
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            pickedUp: 'bg-blue-100 text-blue-800',
            inTransit: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityLevel = (delivery) => {
        if (!delivery.scheduledDate) return 'normal';
        
        const now = new Date();
        const scheduled = delivery.scheduledDate;
        const diffHours = (scheduled - now) / (1000 * 60 * 60);
        
        if (diffHours < 2) return 'urgent';
        if (diffHours < 24) return 'high';
        return 'normal';
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 bg-red-50';
            case 'high': return 'text-orange-600 bg-orange-50';
            case 'normal': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    const getActionButtons = (delivery) => {
        const { status } = delivery;
        switch (status) {
            case 'pending':
                return (
                    <button
                        onClick={() => updateDeliveryStatus(delivery.id, 'pickedUp')}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs"
                    >
                        Mark Picked Up
                    </button>
                );
            case 'pickedUp':
                return (
                    <button
                        onClick={() => updateDeliveryStatus(delivery.id, 'inTransit')}
                        className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-xs"
                    >
                        In Transit
                    </button>
                );
            case 'inTransit':
                return (
                    <button
                        onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs"
                    >
                        Mark Delivered
                    </button>
                );
            case 'delivered':
                return (
                    <span className="text-green-600 text-xs font-medium">✓ Delivered</span>
                );
            case 'cancelled':
                return (
                    <span className="text-red-600 text-xs font-medium">✗ Cancelled</span>
                );
            default:
                return null;
        }
    };

    const filteredDeliveries = deliveries.filter(delivery => {
        const customer = customers[delivery.userId] || {};
        const matchesSearch = delivery.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            delivery.pickupLocation?.address?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filter === 'all' || delivery.status === filter;
        
        return matchesSearch && matchesFilter;
    });

    const getDeliveryStats = () => {
        const stats = {
            total: deliveries.length,
            pending: deliveries.filter(d => d.status === 'pending').length,
            pickedUp: deliveries.filter(d => d.status === 'pickedUp').length,
            inTransit: deliveries.filter(d => d.status === 'inTransit').length,
            delivered: deliveries.filter(d => d.status === 'delivered').length
        };
        return stats;
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const stats = getDeliveryStats();

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Delivery Management</h1>
                
                {/* Delivery Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <h3 className="text-sm font-medium text-blue-900">Total Orders</h3>
                        <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                        <h3 className="text-sm font-medium text-yellow-900">Pending Pickup</h3>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <h3 className="text-sm font-medium text-blue-900">Picked Up</h3>
                        <p className="text-2xl font-bold text-blue-600">{stats.pickedUp}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <h3 className="text-sm font-medium text-purple-900">In Transit</h3>
                        <p className="text-2xl font-bold text-purple-600">{stats.inTransit}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                        <h3 className="text-sm font-medium text-green-900">Delivered</h3>
                        <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <input 
                            type="text" 
                            placeholder="Search by order ID, customer, or address..." 
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
                            <option value="all">All Deliveries</option>
                            <option value="pending">Pending Pickup</option>
                            <option value="pickedUp">Picked Up</option>
                            <option value="inTransit">In Transit</option>
                            <option value="delivered">Delivered</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Deliveries Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Order Details
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Pickup Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Priority
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredDeliveries.map(delivery => {
                                const customer = customers[delivery.userId] || {};
                                const priority = getPriorityLevel(delivery);
                                return (
                                    <tr key={delivery.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    #{delivery.id.slice(0, 8)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Created: {delivery.createdAt?.toLocaleDateString()}
                                                </div>
                                                {delivery.scheduledDate && (
                                                    <div className="text-xs text-blue-600">
                                                        📅 {delivery.scheduledDate.toLocaleString()}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {customer.name || 'Unknown Customer'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {customer.phone || 'No phone'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                <div className="flex items-start">
                                                    <span className="mr-2">📍</span>
                                                    <div>
                                                        <div>{delivery.pickupLocation?.address || 'No address'}</div>
                                                        {delivery.pickupLocation?.apartment && (
                                                            <div className="text-xs text-gray-500">
                                                                Apt: {delivery.pickupLocation.apartment}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(priority)}`}>
                                                {priority === 'urgent' ? '🔴 Urgent' :
                                                 priority === 'high' ? '🟡 High' : '🟢 Normal'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(delivery.status)}`}>
                                                {delivery.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {getActionButtons(delivery)}
                                            {delivery.status !== 'delivered' && delivery.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => updateDeliveryStatus(delivery.id, 'cancelled')}
                                                    className="ml-2 px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredDeliveries.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <div className="mb-2">🚚</div>
                        <p>No deliveries found matching your criteria.</p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
                <div className="flex gap-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
                        📍 View on Map
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200">
                        📄 Export Route List
                    </button>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200">
                        📲 Send Driver Updates
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeliveryManagement;