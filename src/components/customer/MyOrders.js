import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserOrders } from '../../services/firestore';
import { useAuth } from '../../services/auth';
import { ORDER_STATUS_LABELS } from '../../utils/constants';
import InvoiceGenerator from '../shared/InvoiceGenerator';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (currentUser) {
        const fetchedOrders = await getUserOrders(currentUser.uid);
        setOrders(fetchedOrders);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">My Orders</h1>
        </div>
      </div>

      <div className="px-4 py-6">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">You haven't placed any orders. Start by booking a service!</p>
            <Link
              to="/services"
              className="btn-primary inline-block"
            >
              Book Your First Order
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.id}
                className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Order #{order.id.slice(-6)}</h3>
                    <p className="text-sm text-gray-600">{order.service_type} Service</p>
                    {order.booking_type && (
                      <p className="text-xs text-blue-600 capitalize">{order.booking_type} Booking</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium status-${order.status}`}>
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p className="text-gray-600">Weight</p>
                    <p className="font-medium">{order.weight || 'TBD'} kg</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total</p>
                    <p className="font-medium text-blue-600">UGX {order.total_price_ugx?.toLocaleString()}</p>
                  </div>
                  {order.number_of_pieces && (
                    <div>
                      <p className="text-gray-600">Pieces</p>
                      <p className="font-medium">{order.number_of_pieces} items</p>
                    </div>
                  )}
                  {order.add_ons && order.add_ons.length > 0 && (
                    <div>
                      <p className="text-gray-600">Add-ons</p>
                      <p className="font-medium">{order.add_ons.length} items</p>
                    </div>
                  )}
                </div>

                {/* Scheduling Information */}
                {(order.pickup_time || order.delivery_time) && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="grid grid-cols-1 gap-2 text-xs">
                      {order.pickup_time && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">📦 Pickup:</span>
                          <span className="font-medium">{new Date(order.pickup_time).toLocaleDateString()} at {new Date(order.pickup_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      )}
                      {order.delivery_time && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">🚚 Delivery:</span>
                          <span className="font-medium">{new Date(order.delivery_time).toLocaleDateString()} at {new Date(order.delivery_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex space-x-3">
                  <Link
                    to={`/order-tracking?id=${order.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-center text-sm font-semibold"
                  >
                    📱 Track Order
                  </Link>
                  
                  {/* Show invoice button if order has been picked up and weighed */}
                  {order.status !== 'pending' && order.weight && (
                    <InvoiceGenerator 
                      order={{
                        ...order,
                        orderNumber: order.id,
                        customerName: currentUser?.displayName || currentUser?.email || 'Customer',
                        customerPhone: order.phone || '',
                        customerEmail: currentUser?.email || '',
                        totalAmount: order.total_price_ugx || 0,
                        services: [
                          {
                            name: `${order.service_type} Service`,
                            quantity: 1,
                            weight: order.weight,
                            price: order.total_price_ugx || 0
                          }
                        ]
                      }}
                      onDownload={(fileName) => {
                        console.log(`Invoice downloaded: ${fileName}`);
                      }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;