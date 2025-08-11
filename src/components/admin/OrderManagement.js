import React, { useEffect, useState } from 'react';
import { firestore } from '../../services/firestore';
import LoadingSpinner from '../shared/LoadingSpinner';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const ordersSnapshot = await firestore.collection('orders').get();
                const ordersData = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOrders(ordersData);
            } catch (error) {
                console.error("Error fetching orders: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await firestore.collection('orders').doc(orderId).update({ status: newStatus });
            setOrders(orders.map(order => (order.id === orderId ? { ...order, status: newStatus } : order)));
        } catch (error) {
            console.error("Error updating order status: ", error);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            <h1>Order Management</h1>
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>User</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {orders.map(order => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{order.user_id}</td>
                            <td>{order.status}</td>
                            <td>
                                <button onClick={() => updateOrderStatus(order.id, 'picked_up')}>Mark as Picked Up</button>
                                <button onClick={() => updateOrderStatus(order.id, 'delivered')}>Mark as Delivered</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrderManagement;