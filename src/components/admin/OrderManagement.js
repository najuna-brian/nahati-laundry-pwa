import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, orderBy, doc, updateDoc, where, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import LoadingSpinner from '../shared/LoadingSpinner';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, pickedUp, inProgress, completed, cancelled
    const [searchTerm, setSearchTerm] = useState('');
    const [customers, setCustomers] = useState({});

    useEffect(() => {
        fetchOrders();
        fetchCustomers();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const ordersQuery = query(
                collection(db, 'orders'),
                orderBy('createdAt', 'desc'),
                limit(100)
            );
            const snapshot = await getDocs(ordersQuery);
            const ordersList = snapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                scheduledDate: doc.data().scheduledDate?.toDate?.() || null
            }));
            setOrders(ordersList);
        } catch (error) {
            console.error("Error fetching orders:", error);
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

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const orderRef = doc(db, 'orders', orderId);
            await updateDoc(orderRef, { 
                status: newStatus,
                updatedAt: new Date()
            });
            
            setOrders(orders.map(order => 
                order.id === orderId 
                    ? { ...order, status: newStatus, updatedAt: new Date() } 
                    : order
            ));
        } catch (error) {
            console.error("Error updating order status:", error);
            alert('Error updating order status');
        }
    };

    const getStatusColor = (status) => {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            pickedUp: 'bg-blue-100 text-blue-800',
            inProgress: 'bg-purple-100 text-purple-800',
            completed: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return statusColors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusButtons = (order) => {
        const { status } = order;
        switch (status) {
            case 'pending':
                return (
                    <button
                        onClick={() => updateOrderStatus(order.id, 'pickedUp')}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs"
                    >
                        Mark Picked Up
                    </button>
                );
            case 'pickedUp':
                return (
                    <button
                        onClick={() => updateOrderStatus(order.id, 'inProgress')}
                        className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-xs"
                    >
                        Start Processing
                    </button>
                );
            case 'inProgress':
                return (
                    <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs"
                    >
                        Mark Complete
                    </button>
                );
            case 'completed':
                return (
                    <span className="text-green-600 text-xs font-medium">✓ Completed</span>
                );
            case 'cancelled':
                return (
                    <span className="text-red-600 text-xs font-medium">✗ Cancelled</span>
                );
            default:
                return null;
        }
    };

    const filteredOrders = orders.filter(order => {
        const customer = customers[order.userId] || {};
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            customer.phone?.includes(searchTerm);
        
        const matchesFilter = filter === 'all' || order.status === filter;
        
        return matchesSearch && matchesFilter;
    });

    const getOrderStats = () => {
        const stats = {
            total: orders.length,
            pending: orders.filter(o => o.status === 'pending').length,
            inProgress: orders.filter(o => o.status === 'inProgress' || o.status === 'pickedUp').length,
            completed: orders.filter(o => o.status === 'completed').length,
            cancelled: orders.filter(o => o.status === 'cancelled').length
        };
        return stats;
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const stats = getOrderStats();

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Order Management</h1>
                
                {/* Order Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <h3 className="text-sm font-medium text-blue-900">Total Orders</h3>
                        <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                        <h3 className="text-sm font-medium text-yellow-900">Pending</h3>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                        <h3 className="text-sm font-medium text-purple-900">In Progress</h3>
                        <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                        <h3 className="text-sm font-medium text-green-900">Completed</h3>
                        <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                        <h3 className="text-sm font-medium text-red-900">Cancelled</h3>
                        <p className="text-2xl font-bold text-red-600">{stats.cancelled}</p>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <input 
                            type="text" 
                            placeholder="Search by order ID or customer..." 
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
                            <option value="all">All Orders</option>
                            <option value="pending">Pending</option>
                            <option value="pickedUp">Picked Up</option>
                            <option value="inProgress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
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
                                    Services
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredOrders.map(order => {
                                const customer = customers[order.userId] || {};
                                return (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    #{order.id.slice(0, 8)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {order.createdAt?.toLocaleDateString()}
                                                </div>
                                                {order.scheduledDate && (
                                                    <div className="text-xs text-blue-600">
                                                        📅 {order.scheduledDate.toLocaleDateString()}
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
                                                {order.selectedServices?.map(service => (
                                                    <div key={service.id} className="mb-1">
                                                        {service.name} 
                                                        {service.quantity && ` (${service.quantity})`}
                                                    </div>
                                                )) || 'No services'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            ${order.totalPrice?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {getStatusButtons(order)}
                                            {order.status !== 'completed' && order.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
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

                {filteredOrders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <div className="mb-2">📋</div>
                        <p>No orders found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderManagement;