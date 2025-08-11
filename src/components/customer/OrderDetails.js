import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderDetails = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    // Get order data from localStorage
    const data = localStorage.getItem('orderData');
    if (data) {
      setOrderData(JSON.parse(data));
    } else {
      // Redirect back to services if no order data
      navigate('/services');
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
              <span className="text-gray-600">Service:</span>
              <span className="font-medium">{orderData.service.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Weight:</span>
              <span className="font-medium">{orderData.weight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Service Cost:</span>
              <span className="font-medium">UGX {(orderData.service.pricePerKg * orderData.weight).toLocaleString()}</span>
            </div>
            
            {orderData.addOns.length > 0 && (
              <>
                <div className="border-t pt-3 mt-3">
                  <h3 className="font-medium mb-2">Add-ons:</h3>
                  {orderData.addOns.map((addOn, index) => (
                    <div key={index} className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{addOn.name} x{addOn.quantity}</span>
                      <span>UGX {((addOn.pricePerKg || addOn.basePrice) * addOn.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            <div className="border-t pt-3 mt-3 flex justify-between text-lg font-semibold">
              <span>Subtotal:</span>
              <span className="text-blue-600">UGX {orderData.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Location & Scheduling Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Next Steps</h2>
          <p className="text-gray-600 mb-4">Now you need to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-600 mb-6">
            <li>Select pickup and delivery locations</li>
            <li>Schedule pickup and delivery times</li>
            <li>Review delivery fees</li>
            <li>Choose payment method</li>
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

export default OrderDetails;