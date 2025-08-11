import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, getMetrics } from '../../services/firestore';
import { notificationService } from '../../services/notificationService';
import { useAuth } from '../../services/auth';
import LoadingSpinner from '../shared/LoadingSpinner';
import NotificationBell from '../shared/NotificationBell';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const ordersData = await getOrders();
                const metricsData = await getMetrics();
                setOrders(ordersData);
                setMetrics(metricsData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        
        // Listen to admin notifications
        if (user) {
            const unsubscribeNotifications = notificationService.listenToNotifications(
                user.uid,
                (notifications) => {
                    setNotifications(notifications);
                }
            );

            return () => {
                if (unsubscribeNotifications) {
                    unsubscribeNotifications();
                }
            };
        }
    }, [user]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="admin-dashboard">
            {/* Admin Header with Logo */}
            <div className="bg-white shadow-sm mb-6">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <img 
                            src="/icons/default.svg" 
                            alt="Nahati Anytime Laundry" 
                            className="h-16 w-auto"
                        />
                        <NotificationBell 
                            notifications={notifications}
                            onNotificationClick={(notification) => {
                                // Handle notification click - could navigate to relevant section
                                console.log('Admin notification clicked:', notification);
                            }}
                        />
                    </div>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600 text-lg">Nahati Anytime Laundry Management</p>
                    </div>
                </div>
            </div>
            <div className="metrics">
                <h2>Key Metrics</h2>
                
                {/* Admin Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">📋 Order Management</h3>
                                <p className="text-blue-100 text-sm">View and manage all orders</p>
                            </div>
                            <Link to="/admin/orders" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50">
                                View
                            </Link>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">👥 Customer Management</h3>
                                <p className="text-green-100 text-sm">Manage customer accounts</p>
                            </div>
                            <Link to="/admin/customers" className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50">
                                View
                            </Link>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">📱 Notifications</h3>
                                <p className="text-purple-100 text-sm">Send customer notifications</p>
                            </div>
                            <Link to="/admin/notifications" className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50">
                                Send
                            </Link>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">➕ Register Customer</h3>
                                <p className="text-orange-100 text-sm">Add walk-in customers</p>
                            </div>
                            <Link to="/admin/register-customer" className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50">
                                Register
                            </Link>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">📊 Reports</h3>
                                <p className="text-red-100 text-sm">View business analytics</p>
                            </div>
                            <Link to="/admin/reports" className="bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50">
                                View
                            </Link>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">🚚 Delivery</h3>
                                <p className="text-teal-100 text-sm">Manage deliveries</p>
                            </div>
                            <Link to="/admin/delivery" className="bg-white text-teal-600 px-4 py-2 rounded-lg font-semibold hover:bg-teal-50">
                                Manage
                            </Link>
                        </div>
                    </div>
                </div>
                {metrics && (
                    <ul>
                        <li>Total Orders: {metrics.totalOrders}</li>
                        <li>Total Revenue: UGX {metrics.totalRevenue}</li>
                        <li>Orders in Progress: {metrics.ordersInProgress}</li>
                    </ul>
                )}
            </div>
            <div className="orders">
                <h2>Recent Orders</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>User</th>
                            <th>Status</th>
                            <th>Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map(order => (
                            <tr key={order.order_id}>
                                <td>{order.order_id}</td>
                                <td>{order.user_id}</td>
                                <td>{order.status}</td>
                                <td>UGX {order.total_price_ugx}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;