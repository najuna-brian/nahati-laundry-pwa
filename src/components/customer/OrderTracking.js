import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getOrderStatus } from '../../services/firestore';
import { ORDER_STATUS_LABELS, CURRENCY_CONFIG } from '../../utils/constants';
import LoadingSpinner from '../shared/LoadingSpinner';

const OrderTracking = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('id');
    const [orderStatus, setOrderStatus] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderStatus = async () => {
            try {
                if (orderId) {
                    const status = await getOrderStatus(orderId);
                    setOrderStatus(status);
                } else {
                    // Mock data for demo
                    setOrderStatus({
                        id: 'demo-order-123',
                        status: 'in_progress',
                        service_type: 'Standard',
                        booking_type: 'full_service',
                        weight: 3.5,
                        number_of_pieces: 12,
                        total_price_ugx: 17500,
                        pickup_time: '2025-08-13T10:00:00Z',
                        delivery_time: '2025-08-15T14:00:00Z',
                        pickup_address: '123 Kampala Road, Nakawa',
                        customer_name: 'John Doe',
                        customer_phone: '+256 700 123 456',
                        special_instructions: 'Handle with care - delicate fabrics',
                        add_ons: [
                            { name: 'Suit Cleaning', quantity: 1 },
                            { name: 'Express Service', quantity: 1 }
                        ]
                    });
                }
            } catch (error) {
                console.error("Error fetching order status:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderStatus();
    }, [orderId]);

    const trackingSteps = [
        {
            status: 'placed',
            label: 'Order Placed',
            icon: '📝',
            description: 'Your order has been confirmed and is being prepared for pickup',
            color: 'blue'
        },
        {
            status: 'picked_up',
            label: 'Picked Up',
            icon: '📦',
            description: 'Items collected from your location and brought to our facility',
            color: 'purple'
        },
        {
            status: 'in_progress',
            label: 'In Progress',
            icon: '🔄',
            description: 'Your laundry is being processed with care',
            color: 'orange'
        },
        {
            status: 'ready',
            label: 'Ready for Delivery',
            icon: '✨',
            description: 'Clean, fresh, and ready for delivery',
            color: 'green'
        },
        {
            status: 'delivered',
            label: 'Delivered',
            icon: '🎉',
            description: 'Successfully delivered to your location',
            color: 'green'
        }
    ];

    const getStepStatus = (stepStatus) => {
        const currentIndex = trackingSteps.findIndex(step => step.status === orderStatus?.status);
        const stepIndex = trackingSteps.findIndex(step => step.status === stepStatus);
        
        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'pending';
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!orderStatus) {
        return (
            <div className="min-h-screen bg-gray-50 pb-20">
                <div className="bg-white shadow-sm sticky top-0 z-10">
                    <div className="px-4 py-4">
                        <h1 className="text-xl font-semibold text-gray-900">Order Tracking</h1>
                    </div>
                </div>
                <div className="px-4 py-6 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Order Not Found</h3>
                    <p className="text-gray-600">No order found with the provided ID.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="px-4 py-4">
                    <h1 className="text-xl font-semibold text-gray-900">Order Tracking</h1>
                    <p className="text-sm text-gray-600">Order #{(orderId || orderStatus.id).slice(-6)}</p>
                </div>
            </div>

            <div className="px-4 py-6 space-y-6">
                {/* Order Summary Card */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600">Service Type</p>
                            <p className="font-medium">{orderStatus.service_type}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Status</p>
                            <p className="font-medium capitalize">{ORDER_STATUS_LABELS[orderStatus.status]}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Weight</p>
                            <p className="font-medium">{orderStatus.weight || 'TBD'} kg</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Total</p>
                            <p className="font-medium text-blue-600">{CURRENCY_CONFIG.formatPrice(orderStatus.total_price_ugx)}</p>
                        </div>
                        {orderStatus.number_of_pieces && (
                            <div>
                                <p className="text-gray-600">Pieces</p>
                                <p className="font-medium">{orderStatus.number_of_pieces} items</p>
                            </div>
                        )}
                        <div>
                            <p className="text-gray-600">Booking Type</p>
                            <p className="font-medium capitalize">{orderStatus.booking_type?.replace('_', ' ') || 'Full Service'}</p>
                        </div>
                    </div>
                </div>

                {/* Scheduling Information */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">📅 Schedule</h2>
                    
                    <div className="space-y-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="font-medium text-blue-800 mb-2">📦 Pickup</h3>
                            <div className="space-y-1 text-sm">
                                <p><span className="text-gray-600">Time:</span> {orderStatus.pickup_time ? new Date(orderStatus.pickup_time).toLocaleString() : 'TBD'}</p>
                                <p><span className="text-gray-600">Location:</span> {orderStatus.pickup_address || 'Address to be confirmed'}</p>
                            </div>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="font-medium text-green-800 mb-2">🚚 Delivery</h3>
                            <div className="space-y-1 text-sm">
                                <p><span className="text-gray-600">Est. Time:</span> {orderStatus.delivery_time ? new Date(orderStatus.delivery_time).toLocaleString() : 'TBD'}</p>
                                <p><span className="text-gray-600">Location:</span> {orderStatus.pickup_address || 'Same as pickup'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Tracking */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">📍 Progress Tracking</h2>
                    
                    <div className="space-y-3">
                        {trackingSteps.map((step, index) => {
                            const status = getStepStatus(step.status);
                            
                            return (
                                <div 
                                    key={step.status}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        status === 'completed' ? 'bg-green-50 border-green-200 text-green-800' :
                                        status === 'current' ? `bg-${step.color}-50 border-${step.color}-200 text-${step.color}-800 ring-2 ring-${step.color}-300` :
                                        'bg-gray-50 border-gray-200 text-gray-500'
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3">
                                            <span className="text-2xl">{step.icon}</span>
                                            <div>
                                                <h4 className="font-medium">{step.label}</h4>
                                                <p className="text-sm opacity-80 mt-1">{step.description}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center space-x-2">
                                            {status === 'completed' && (
                                                <span className="text-green-600">
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </span>
                                            )}
                                            
                                            {status === 'current' && (
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                                                    <span className="text-xs font-medium">Active</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {(status === 'completed' || status === 'current') && (
                                        <div className="mt-2 text-xs opacity-70">
                                            Updated: {new Date().toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Add-ons */}
                {orderStatus.add_ons && orderStatus.add_ons.length > 0 && (
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">➕ Add-on Services</h2>
                        <div className="space-y-2">
                            {orderStatus.add_ons.map((addon, index) => (
                                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                    <span className="text-gray-700">{addon.name}</span>
                                    <span className="text-sm text-gray-600">x{addon.quantity}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Special Instructions */}
                {orderStatus.special_instructions && (
                    <div className="bg-white rounded-xl p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">📝 Special Instructions</h2>
                        <p className="text-gray-700 text-sm">{orderStatus.special_instructions}</p>
                    </div>
                )}

                {/* Contact Actions */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">🤝 Need Help?</h2>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            className="btn-secondary"
                            onClick={() => window.open(`tel:${orderStatus.customer_phone || '+256200981445'}`, '_self')}
                        >
                            📞 Call Support
                        </button>
                        <button 
                            className="btn-secondary"
                            onClick={() => window.open(`https://wa.me/256200981445?text=Hi, I need help with order #${(orderId || orderStatus.id).slice(-6)}`, '_blank')}
                        >
                            💬 WhatsApp
                        </button>
                    </div>
                    
                    {orderStatus.status === 'delivered' && (
                        <button className="btn-primary w-full mt-3">
                            ⭐ Rate Your Experience
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;