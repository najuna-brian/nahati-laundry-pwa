import React, { useEffect, useState } from 'react';
import { getOrders, getMetrics } from '../../services/firestore';
import LoadingSpinner from '../shared/LoadingSpinner';

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [metrics, setMetrics] = useState(null);
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
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="admin-dashboard">
            {/* Admin Header with Logo */}
            <div className="bg-white shadow-sm mb-6">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-center mb-4">
                        <img 
                            src="/icons/default.svg" 
                            alt="Nahati Anytime Laundry" 
                            className="h-16 w-auto"
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