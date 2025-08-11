import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../services/auth';

const OrderConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [orderData, setOrderData] = useState(null);
    const [schedulingData, setSchedulingData] = useState(null);
    const [orderId, setOrderId] = useState('');
    const [orderSaved, setOrderSaved] = useState(false);

    // Function to save order to Firebase
    const saveOrderToFirebase = async (orderId, orderData, schedulingData) => {
        if (!user || orderSaved) return;

        try {
            const orderRecord = {
                orderId: orderId,
                userId: user.uid,
                userEmail: user.email || 'guest@nahati.com',
                userName: user.displayName || 'Guest User',
                
                // Service details
                service: orderData.service,
                weight: orderData.weight,
                addOns: orderData.addOns || [],
                specialInstructions: orderData.specialInstructions || '',
                photos: [], // Photos would need special handling for Firebase Storage
                estimatedTotal: orderData.total || 0,
                
                // Scheduling details
                pickupDate: schedulingData.pickupDate,
                pickupTimeRange: schedulingData.pickupTimeRange,
                pickupPreferredTime: schedulingData.pickupPreferredTime || '',
                deliveryDate: schedulingData.deliveryDate,
                deliveryTimeRange: schedulingData.deliveryTimeRange,
                deliveryPreferredTime: schedulingData.deliveryPreferredTime || '',
                
                // Order status
                status: 'pending',
                paymentOnDelivery: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                
                // Additional fields
                actualWeight: null,
                finalPrice: null,
                paymentStatus: 'pending',
                notes: []
            };

            const docRef = await addDoc(collection(db, 'orders'), orderRecord);
            console.log('Order saved to Firebase with ID: ', docRef.id);
            setOrderSaved(true);
            
            // Also save to localStorage for immediate access
            const savedOrders = JSON.parse(localStorage.getItem('userOrders') || '[]');
            savedOrders.unshift({ ...orderRecord, id: docRef.id });
            localStorage.setItem('userOrders', JSON.stringify(savedOrders));
            
        } catch (error) {
            console.error('Error saving order to Firebase: ', error);
        }
    };

    useEffect(() => {
        // Try to get data from location.state first (for backward compatibility)
        if (location.state) {
            setOrderData(location.state);
        } else {
            // Get data from localStorage (new flow)
            const storedOrderData = localStorage.getItem('orderData');
            const storedSchedulingData = localStorage.getItem('schedulingData');
            
            if (storedOrderData) {
                setOrderData(JSON.parse(storedOrderData));
            }
            if (storedSchedulingData) {
                setSchedulingData(JSON.parse(storedSchedulingData));
            }
        }

        // Generate unique order ID only once
        if (!orderId) {
            const generatedOrderId = 'NH' + Date.now().toString().slice(-6);
            setOrderId(generatedOrderId);
        }
    }, [location.state, orderId]);

    // Separate useEffect for saving order to prevent loops
    useEffect(() => {
        if (orderData && schedulingData && user && orderId && !orderSaved) {
            saveOrderToFirebase(orderId, orderData, schedulingData);
        }
    }, [orderData, schedulingData, user, orderId, orderSaved]);

    if (!orderData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No Order Data Found</h2>
                    <p className="text-gray-600 mb-4">Please start a new order</p>
                    <button 
                        onClick={() => navigate('/services')}
                        className="btn-primary"
                    >
                        Start New Order
                    </button>
                </div>
            </div>
        );
    }

    const formatTimeRange = (timeRange, preferredTime) => {
        const ranges = {
            morning: 'Morning (8:00 AM - 12:00 PM)',
            afternoon: 'Afternoon (12:00 PM - 4:00 PM)', 
            evening: 'Evening (4:00 PM - 8:00 PM)'
        };
        const rangeText = ranges[timeRange] || timeRange;
        return preferredTime ? `${rangeText} - Preferred: ${preferredTime}` : rangeText;
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="px-4 py-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Confirmed!</h1>
                    <p className="text-gray-600 mt-2">Thank you for choosing Nahati Anytime Laundry</p>
                </div>
            </div>

            <div className="px-4 py-6 space-y-6">
                {/* Order Summary */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Order ID:</span>
                            <span className="font-semibold text-blue-600">{orderId}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                            <span className="text-gray-600">Service:</span>
                            <span className="font-medium">{orderData.service?.name}</span>
                        </div>
                        
                        {orderData.weight ? (
                            <>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Weight:</span>
                                    <span className="font-medium">{orderData.weight} kg</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-gray-600">Estimated Total:</span>
                                    <span className="font-semibold text-green-600">UGX {orderData.total?.toLocaleString()}</span>
                                </div>
                            </>
                        ) : (
                            <div className="py-2 border-b border-gray-100">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        💰 <strong>Payment on Delivery</strong><br/>
                                        Final price will be calculated based on actual weight during pickup
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {orderData.addOns?.length > 0 && (
                            <div className="py-2">
                                <span className="text-gray-600 text-sm">Add-ons:</span>
                                <div className="mt-1">
                                    {orderData.addOns.map((addOn, index) => (
                                        <div key={index} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{addOn.name} x{addOn.quantity}</span>
                                            <span>UGX {((addOn.pricePerKg || addOn.basePrice) * addOn.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Schedule Information */}
                {schedulingData && (
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Schedule Details</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                                    <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Pickup
                                </h3>
                                <p className="text-sm text-gray-600">Date: {schedulingData.pickupDate}</p>
                                <p className="text-sm text-gray-600">
                                    Time: {formatTimeRange(schedulingData.pickupTimeRange, schedulingData.pickupPreferredTime)}
                                </p>
                            </div>
                            
                            <div>
                                <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                                    <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    Delivery
                                </h3>
                                <p className="text-sm text-gray-600">Date: {schedulingData.deliveryDate}</p>
                                <p className="text-sm text-gray-600">
                                    Time: {formatTimeRange(schedulingData.deliveryTimeRange, schedulingData.deliveryPreferredTime)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">What's Next?</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            You'll receive a notification when our team is on the way for pickup
                        </li>
                        <li className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            {orderData.weight ? 'We\'ll confirm the weight during pickup' : 'We\'ll weigh your clothes and confirm pricing during pickup'}
                        </li>
                        <li className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Track your order status in real-time through the app
                        </li>
                        <li className="flex items-start">
                            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            Payment will be collected upon delivery
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button 
                        onClick={() => navigate('/my-orders')}
                        className="btn-primary w-full"
                    >
                        View My Orders
                    </button>
                    
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3 px-6 rounded-xl font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;