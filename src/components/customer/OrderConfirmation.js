import React from 'react';
import { useLocation } from 'react-router-dom';

const OrderConfirmation = () => {
    const location = useLocation();
    const { orderId, totalPrice, services, pickupTime, deliveryTime } = location.state || {};

    return (
        <div className="order-confirmation">
            <h1>Order Confirmation</h1>
            <p>Thank you for your order!</p>
            <h2>Order Summary</h2>
            <p><strong>Order ID:</strong> {orderId}</p>
            <p><strong>Total Price:</strong> UGX {totalPrice}</p>
            <h3>Services Ordered:</h3>
            <ul>
                {services && services.map((service, index) => (
                    <li key={index}>{service}</li>
                ))}
            </ul>
            <h3>Pickup Time:</h3>
            <p>{pickupTime}</p>
            <h3>Delivery Time:</h3>
            <p>{deliveryTime}</p>
            <button onClick={() => window.location.href = '/my-orders'}>View My Orders</button>
        </div>
    );
};

export default OrderConfirmation;