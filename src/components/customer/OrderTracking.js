import React, { useEffect, useState } from 'react';
import { getOrderStatus } from '../../services/firestore';
import LoadingSpinner from '../shared/LoadingSpinner';

const OrderTracking = ({ orderId }) => {
    const [orderStatus, setOrderStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderStatus = async () => {
            try {
                const status = await getOrderStatus(orderId);
                setOrderStatus(status);
            } catch (error) {
                console.error("Error fetching order status:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderStatus();
    }, [orderId]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="order-tracking">
            <h2>Order Tracking</h2>
            {orderStatus ? (
                <div>
                    <h3>Order ID: {orderId}</h3>
                    <p>Status: {orderStatus.status}</p>
                    <p>Pickup Time: {orderStatus.pickup_time}</p>
                    <p>Delivery Time: {orderStatus.delivery_time}</p>
                    <p>Special Instructions: {orderStatus.special_instructions}</p>
                </div>
            ) : (
                <p>No order found with this ID.</p>
            )}
        </div>
    );
};

export default OrderTracking;