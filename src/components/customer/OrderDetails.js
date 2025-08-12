import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CURRENCY_CONFIG, SERVICE_TYPES, ADD_ONS, ORDER_STATUS_LABELS } from '../../utils/constants';

const OrderDetails = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [schedulingData, setSchedulingData] = useState(null);
  const [showTracking, setShowTracking] = useState(false);

  useEffect(() => {
    // Get order data from localStorage
    const data = localStorage.getItem('orderData');
    const scheduling = localStorage.getItem('schedulingData');
    
    if (data) {
      setOrderData(JSON.parse(data));
    } else {
      // Redirect back to services if no order data
      navigate('/services');
    }
    
    if (scheduling) {
      setSchedulingData(JSON.parse(scheduling));
    }
  }, [navigate]);

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Order Details</h1>
        </div>
      </div>
      
      <div className="px-4 py-6 space-y-6">
        {/* Order Summary */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Service Type:</span>
              <span className="font-medium">{orderData.service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service Category:</span>
              <span className="font-medium capitalize">{orderData.bookingType || 'Full Service'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Currency:</span>
              <span className="font-medium">{orderData.currency} ({CURRENCY_CONFIG.symbol})</span>
            </div>
            
            {/* Number of Pieces */}
            {orderData.numberOfPieces && (
              <div className="flex justify-between">
                <span className="text-gray-600">Number of Pieces:</span>
                <span className="font-medium">{orderData.numberOfPieces} items</span>
              </div>
            )}
            
            {orderData.weight ? (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Weight:</span>
                  <span className="font-medium">{orderData.weight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service Cost:</span>
                  <span className="font-medium">{CURRENCY_CONFIG.formatPrice(SERVICE_TYPES[orderData.service.id]?.pricePerKg * orderData.weight || orderData.service.pricePerKg * orderData.weight)}</span>
                </div>
              </>
            ) : (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  ⚖️ <strong>Weight to be confirmed during pickup</strong><br/>
                  Our staff will weigh your clothes and confirm the final price before processing.
                </p>
              </div>
            )}
            
            {orderData.addOns.length > 0 && (
              <>
                <div className="border-t pt-3 mt-3">
                  <h3 className="font-medium mb-2">Add-ons:</h3>
                  {orderData.addOns.map((addOn, index) => (
                    <div key={index} className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{addOn.name} x{addOn.quantity}</span>
                      <span>{CURRENCY_CONFIG.formatPrice(((ADD_ONS.find(a => a.id === addOn.id)?.pricePerKg || ADD_ONS.find(a => a.id === addOn.id)?.basePrice || addOn.pricePerKg || addOn.basePrice) * addOn.quantity))}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <div className="border-t pt-3 mt-3">
              {orderData.weight ? (
                <div className="flex justify-between text-lg font-semibold">
                  <span>Estimated Total:</span>
                  <span className="text-blue-600">{CURRENCY_CONFIG.formatPrice(orderData.total)}</span>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">💰 <strong>Payment on Delivery</strong></p>
                  <p className="text-xs text-gray-500">Final amount will be calculated after pickup and confirmed before processing</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Scheduling Information */}
        {schedulingData && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">📅 Schedule Information</h2>
            
            <div className="space-y-4">
              {/* Pickup Information */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">📦 Pickup Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{schedulingData.pickupDate || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Range:</span>
                    <span className="font-medium">{schedulingData.pickupTimeRange || 'Not set'}</span>
                  </div>
                  {schedulingData.pickupPreferredTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Preferred Time:</span>
                      <span className="font-medium">{schedulingData.pickupPreferredTime}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium text-right max-w-48">{schedulingData.pickupAddress || 'Address to be provided'}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Information */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-medium text-green-800 mb-2">🚚 Delivery Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{schedulingData.deliveryDate || 'Not set'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time Range:</span>
                    <span className="font-medium">{schedulingData.deliveryTimeRange || 'Not set'}</span>
                  </div>
                  {schedulingData.deliveryPreferredTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Preferred Time:</span>
                      <span className="font-medium">{schedulingData.deliveryPreferredTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Distance and Fee */}
              {schedulingData.distance && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Distance & Fee:</span>
                    <div className="text-right">
                      <div className="font-medium">{schedulingData.roundedDistance} km</div>
                      <div className="text-blue-600 font-semibold">{CURRENCY_CONFIG.formatPrice(schedulingData.pickupDeliveryFee)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Tracking Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">📱 Order Tracking</h2>
            <button
              onClick={() => setShowTracking(!showTracking)}
              className="btn-primary"
            >
              {showTracking ? 'Hide Tracking' : 'Track Order'}
            </button>
          </div>
          
          {showTracking && (
            <OrderTrackingComponent orderId={orderData.id || 'demo-order'} />
          )}
        </div>

        {/* Location & Scheduling Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Next Steps</h2>
          <p className="text-gray-600 mb-4">Now you need to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
            <li>Select pickup and delivery locations</li>
            <li>Schedule pickup and delivery times</li>
            <li>Confirm your order details</li>
            <li>Payment will be collected on delivery</li>
          </ul>
          
          <button 
            onClick={() => navigate('/scheduling')}
            className="btn-primary w-full"
          >
            Continue to Location & Scheduling
          </button>
        </div>

        {/* Special Instructions */}
        {orderData.specialInstructions && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-medium mb-2">Special Instructions</h3>
            <p className="text-gray-600 text-sm">{orderData.specialInstructions}</p>
          </div>
        )}

        {/* Photos */}
        {orderData.photos.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-medium mb-3">Uploaded Photos</h3>
            <div className="grid grid-cols-3 gap-2">
              {orderData.photos.map((photo, index) => (
                <img
                  key={index}
                  src={URL.createObjectURL(photo)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Order Tracking Component with Progress Buttons
const OrderTrackingComponent = ({ orderId }) => {
  const [currentStatus, setCurrentStatus] = useState('placed');
  const [orderDetails, setOrderDetails] = useState(null);

  // Mock order details - in real app, fetch from API
  useEffect(() => {
    // Simulate fetching order details
    const mockOrderDetails = {
      id: orderId,
      status: 'picked_up', // Current status
      createdAt: new Date().toISOString(),
      pickupTime: '2025-08-13T10:00:00Z',
      estimatedDelivery: '2025-08-15T14:00:00Z',
      customerName: 'John Doe',
      phone: '+256 700 123 456'
    };
    
    setOrderDetails(mockOrderDetails);
    setCurrentStatus(mockOrderDetails.status);
  }, [orderId]);

  const trackingSteps = [
    {
      status: 'placed',
      label: 'Order Placed',
      icon: '📝',
      description: 'Your order has been confirmed',
      color: 'blue'
    },
    {
      status: 'picked_up',
      label: 'Picked Up',
      icon: '📦',
      description: 'Items collected from your location',
      color: 'purple'
    },
    {
      status: 'in_progress',
      label: 'In Progress',
      icon: '🔄',
      description: 'Your laundry is being processed',
      color: 'orange'
    },
    {
      status: 'ready',
      label: 'Ready',
      icon: '✨',
      description: 'Clean and ready for delivery',
      color: 'green'
    },
    {
      status: 'delivered',
      label: 'Delivered',
      icon: '🎉',
      description: 'Successfully delivered to you',
      color: 'green'
    }
  ];

  const getStepStatus = (stepStatus) => {
    const currentIndex = trackingSteps.findIndex(step => step.status === currentStatus);
    const stepIndex = trackingSteps.findIndex(step => step.status === stepStatus);
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const getStatusColor = (status, stepColor) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'current':
        return `bg-${stepColor}-100 text-${stepColor}-800 border-${stepColor}-200 ring-2 ring-${stepColor}-300`;
      default:
        return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  };

  if (!orderDetails) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Order Info Header */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Order ID</p>
            <p className="font-medium">#{orderId.slice(-6)}</p>
          </div>
          <div>
            <p className="text-gray-600">Status</p>
            <p className="font-medium capitalize">{ORDER_STATUS_LABELS[currentStatus]}</p>
          </div>
          <div>
            <p className="text-gray-600">Pickup Time</p>
            <p className="font-medium">{orderDetails.pickupTime ? new Date(orderDetails.pickupTime).toLocaleString() : 'TBD'}</p>
          </div>
          <div>
            <p className="text-gray-600">Est. Delivery</p>
            <p className="font-medium">{orderDetails.estimatedDelivery ? new Date(orderDetails.estimatedDelivery).toLocaleString() : 'TBD'}</p>
          </div>
        </div>
      </div>

      {/* Progress Tracking Steps */}
      <div className="space-y-3">
        <h3 className="font-medium text-gray-900">Progress Tracking</h3>
        
        <div className="space-y-2">
          {trackingSteps.map((step, index) => {
            const status = getStepStatus(step.status);
            
            return (
              <div 
                key={step.status}
                className={`p-4 rounded-lg border-2 transition-all ${getStatusColor(status, step.color)}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{step.icon}</span>
                    <div>
                      <h4 className="font-medium">{step.label}</h4>
                      <p className="text-sm opacity-80">{step.description}</p>
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
                        <span className="text-xs font-medium">In Progress</span>
                      </div>
                    )}
                    
                    {status === 'pending' && (
                      <span className="text-gray-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Show timestamp for completed/current steps */}
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

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <button 
            className="btn-secondary"
            onClick={() => window.open(`tel:${orderDetails.phone}`, '_self')}
          >
            📞 Call Support
          </button>
          <button 
            className="btn-secondary"
            onClick={() => window.open(`https://wa.me/256200981445?text=Hi, I need help with order #${orderId.slice(-6)}`, '_blank')}
          >
            💬 WhatsApp
          </button>
        </div>
        
        {currentStatus === 'delivered' && (
          <button className="btn-primary w-full">
            ⭐ Rate Your Experience
          </button>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;