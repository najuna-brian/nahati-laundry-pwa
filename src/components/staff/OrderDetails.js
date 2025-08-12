import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../services/auth';
import { notificationService } from '../../services/notificationService';
import WeightUpdateModal from './WeightUpdateModal';
import InvoiceOrderSummary from '../shared/InvoiceOrderSummary';

const OrderDetails = ({ orderId, onClose, onStatusUpdate }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showWeightModal, setShowWeightModal] = useState(false);
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

    const handleWeightUpdated = (updatedOrder) => {
        setOrder(updatedOrder);
        if (onStatusUpdate) {
            onStatusUpdate(updatedOrder);
        }
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
                        Created: {order.created_at?.toDate?.()?.toLocaleDateString() || 'Just now'}
                    </p>
                </div>

                <div className="p-6 space-y-6">
                    {/* Invoice-Style Order Summary with Status Update */}
                    <InvoiceOrderSummary 
                        orderData={order}
                        schedulingData={order}
                        status={order.status}
                        onStatusChange={updateOrderStatus}
                    />

                    {/* Weight Update Section */}
                    {!order.actualWeight && (order.status === 'picked_up' || order.status === 'pending') && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-yellow-800">⚖️ Weight Not Confirmed</h3>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Update the actual weight to calculate final pricing
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowWeightModal(true)}
                                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                                >
                                    Update Weight
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Status Update Actions */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-semibold text-lg mb-3 flex items-center">
                            � Status Actions
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {getNextStatusOptions(order.status).map(status => (
                                <button
                                    key={status}
                                    onClick={() => updateOrderStatus(status)}
                                    disabled={updating}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                                >
                                    {updating ? 'Updating...' : `Mark as ${status.replace('_', ' ')}`}
                                </button>
                            ))}
                        </div>
                        {getNextStatusOptions(order.status).length === 0 && (
                            <p className="text-gray-600 text-sm">No status updates available for current status.</p>
                        )}
                    </div>
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

            {/* Weight Update Modal */}
            <WeightUpdateModal
                order={order}
                isOpen={showWeightModal}
                onClose={() => setShowWeightModal(false)}
                onWeightUpdated={handleWeightUpdated}
            />
        </div>
    );
};

export default OrderDetails;
