import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../services/auth';
import { notificationService } from '../../services/notificationService';

const OrderDetails = ({ orderId, onClose, onStatusUpdate }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const orderDoc = await getDoc(doc(db, 'orders', orderId));
                if (orderDoc.exists()) {
                    const orderData = { id: orderDoc.id, ...orderDoc.data() };
                    setOrder(orderData);
                    
                    // Mark as viewed when order is opened
                    if (currentUser) {
                        await notificationService.markAsViewed(orderId, currentUser.uid);
                    }
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            fetchOrder();
        }
    }, [orderId, currentUser]);

    const updateOrderStatus = async (newStatus) => {
        if (!order || updating) return;
        
        setUpdating(true);
        try {
            const updateData = {
                status: newStatus,
                updatedAt: serverTimestamp(),
                updatedBy: currentUser.uid,
                [`${newStatus}At`]: serverTimestamp()
            };

            // Add staff assignment if not already assigned
            if (!order.assignedStaff) {
                updateData.assignedStaff = currentUser.uid;
                updateData.assignedAt = serverTimestamp();
            }

            await updateDoc(doc(db, 'orders', orderId), updateData);
            
            // Update local state
            setOrder(prev => ({ 
                ...prev, 
                status: newStatus,
                assignedStaff: currentUser.uid,
                ...updateData
            }));

            // Send notification to customer about status update
            await notificationService.sendNotification({
                type: 'order_status_update',
                title: 'Order Status Updated',
                message: `Your order #${order.orderId} is now ${newStatus.replace('_', ' ')}`,
                userId: order.userId,
                orderId: order.orderId,
                priority: 'normal',
                data: {
                    orderId: order.orderId,
                    newStatus: newStatus,
                    updatedBy: currentUser.displayName || currentUser.email
                }
            });

            // Stop reminders since order is now being handled
            notificationService.stopOrderReminder(orderId);

            if (onStatusUpdate) {
                onStatusUpdate(newStatus);
            }

        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status. Please try again.');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            picked_up: 'bg-blue-100 text-blue-800',
            washing: 'bg-purple-100 text-purple-800',
            drying: 'bg-orange-100 text-orange-800',
            pressing: 'bg-indigo-100 text-indigo-800',
            ready: 'bg-green-100 text-green-800',
            out_for_delivery: 'bg-teal-100 text-teal-800',
            delivered: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getNextStatusOptions = (currentStatus) => {
        const statusFlow = {
            pending: ['picked_up'],
            picked_up: ['washing'],
            washing: ['drying'],
            drying: ['pressing'],
            pressing: ['ready'],
            ready: ['out_for_delivery'],
            out_for_delivery: ['delivered']
        };
        return statusFlow[currentStatus] || [];
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-center">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Order Not Found</h3>
                    <p className="text-gray-600 mb-4">The requested order could not be found.</p>
                    <button 
                        onClick={onClose}
                        className="w-full bg-gray-600 text-white py-2 rounded hover:bg-gray-700"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
                {/* Header */}
                <div className="bg-blue-600 text-white p-6 rounded-t-lg">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold">Order #{order.orderId}</h2>
                            <div className="flex items-center mt-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                    {order.status.replace('_', ' ').toUpperCase()}
                                </span>
                                {order.assignedStaff && (
                                    <span className="ml-3 text-blue-100 text-sm">
                                        👤 Assigned to staff
                                    </span>
                                )}
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="text-white hover:text-gray-200 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>
                    <p className="text-blue-100 mt-2">
                        Created: {order.createdAt?.toDate?.()?.toLocaleDateString() || 'Just now'}
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Customer Information */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-3 flex items-center">
                            👤 Customer Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="font-medium">{order.userName || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Email</p>
                                <p className="font-medium">{order.userEmail || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Phone</p>
                                <p className="font-medium">{order.userPhone || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Service Details */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-3 flex items-center">
                            🧺 Service Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Service Type</p>
                                <p className="font-medium">{order.service?.name || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Price per KG</p>
                                <p className="font-medium">UGX {order.service?.price || 'TBD'}</p>
                            </div>
                            
                            {order.weight ? (
                                <div>
                                    <p className="text-sm text-gray-600">Weight</p>
                                    <p className="font-medium">{order.weight} kg</p>
                                </div>
                            ) : (
                                <div className="col-span-2">
                                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                                        <p className="text-sm text-yellow-800">
                                            ⚖️ Weight to be determined during pickup
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            {order.specialInstructions && (
                                <div className="col-span-2">
                                    <p className="text-sm text-gray-600">Special Instructions</p>
                                    <p className="font-medium bg-gray-50 p-2 rounded">{order.specialInstructions}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Schedule Information */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-3 flex items-center">
                            📅 Schedule
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="border-l-4 border-green-500 pl-4">
                                <h4 className="font-medium text-green-600 mb-2">📍 Pickup</h4>
                                <p className="text-sm"><strong>Date:</strong> {order.pickupDate || 'Not scheduled'}</p>
                                <p className="text-sm"><strong>Time:</strong> {order.pickupTimeRange || 'Not scheduled'}</p>
                                {order.pickupPreferredTime && (
                                    <p className="text-sm"><strong>Preferred:</strong> {order.pickupPreferredTime}</p>
                                )}
                            </div>
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h4 className="font-medium text-blue-600 mb-2">🚛 Delivery</h4>
                                <p className="text-sm"><strong>Date:</strong> {order.deliveryDate || 'Not scheduled'}</p>
                                <p className="text-sm"><strong>Time:</strong> {order.deliveryTimeRange || 'Not scheduled'}</p>
                                {order.deliveryPreferredTime && (
                                    <p className="text-sm"><strong>Preferred:</strong> {order.deliveryPreferredTime}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Update Actions */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-3 flex items-center">
                            🔄 Update Status
                        </h3>
                        
                        {getNextStatusOptions(order.status).length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {getNextStatusOptions(order.status).map(nextStatus => (
                                    <button 
                                        key={nextStatus}
                                        onClick={() => updateOrderStatus(nextStatus)}
                                        disabled={updating}
                                        className="bg-blue-600 text-white px-4 py-3 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {updating ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Updating...
                                            </div>
                                        ) : (
                                            <>
                                                {nextStatus === 'picked_up' && '📦 Mark as Picked Up'}
                                                {nextStatus === 'washing' && '🧼 Start Washing'}
                                                {nextStatus === 'drying' && '💨 Start Drying'}
                                                {nextStatus === 'pressing' && '👔 Start Pressing'}
                                                {nextStatus === 'ready' && '✅ Mark as Ready'}
                                                {nextStatus === 'out_for_delivery' && '🚛 Out for Delivery'}
                                                {nextStatus === 'delivered' && '📍 Mark as Delivered'}
                                            </>
                                        )}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                                <p className="text-green-800">
                                    ✅ This order has completed the workflow or no further actions are available.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Order Timeline */}
                    {order.status !== 'pending' && (
                        <div className="border rounded-lg p-4">
                            <h3 className="font-semibold text-lg mb-3 flex items-center">
                                📋 Order Timeline
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center text-sm">
                                    <span className="w-24 font-medium">Created:</span>
                                    <span>{order.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}</span>
                                </div>
                                {order.picked_upAt && (
                                    <div className="flex items-center text-sm">
                                        <span className="w-24 font-medium">Picked up:</span>
                                        <span>{order.picked_upAt?.toDate?.()?.toLocaleString()}</span>
                                    </div>
                                )}
                                {order.washingAt && (
                                    <div className="flex items-center text-sm">
                                        <span className="w-24 font-medium">Washing:</span>
                                        <span>{order.washingAt?.toDate?.()?.toLocaleString()}</span>
                                    </div>
                                )}
                                {order.dryingAt && (
                                    <div className="flex items-center text-sm">
                                        <span className="w-24 font-medium">Drying:</span>
                                        <span>{order.dryingAt?.toDate?.()?.toLocaleString()}</span>
                                    </div>
                                )}
                                {order.readyAt && (
                                    <div className="flex items-center text-sm">
                                        <span className="w-24 font-medium">Ready:</span>
                                        <span>{order.readyAt?.toDate?.()?.toLocaleString()}</span>
                                    </div>
                                )}
                                {order.deliveredAt && (
                                    <div className="flex items-center text-sm">
                                        <span className="w-24 font-medium">Delivered:</span>
                                        <span>{order.deliveredAt?.toDate?.()?.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 rounded-b-lg">
                    <button 
                        onClick={onClose}
                        className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Close Order Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
