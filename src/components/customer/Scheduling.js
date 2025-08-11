import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Scheduling = () => {
  const navigate = useNavigate();
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTimeRange, setPickupTimeRange] = useState('');
  const [pickupPreferredTime, setPickupPreferredTime] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTimeRange, setDeliveryTimeRange] = useState('');
  const [deliveryPreferredTime, setDeliveryPreferredTime] = useState('');

  const timeRanges = [
    { value: 'morning', label: 'Morning (8:00 AM - 12:00 PM)' },
    { value: 'afternoon', label: 'Afternoon (12:00 PM - 4:00 PM)' },
    { value: 'evening', label: 'Evening (4:00 PM - 8:00 PM)' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pickupDate || !pickupTimeRange || !deliveryDate || !deliveryTimeRange) {
      alert('Please fill in all required fields');
      return;
    }

    // Store scheduling data
    const schedulingData = {
      pickupDate,
      pickupTimeRange,
      pickupPreferredTime,
      deliveryDate,
      deliveryTimeRange,
      deliveryPreferredTime,
      paymentOnDelivery: true
    };

    localStorage.setItem('schedulingData', JSON.stringify(schedulingData));
    
    // Skip payment and go directly to confirmation
    navigate('/order-confirmation');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-4">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Schedule Pickup & Delivery</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-6">
        {/* Pickup Scheduling */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Pickup Schedule
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="pickup-date" className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Date *
              </label>
              <input
                type="date"
                id="pickup-date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Time Range *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {timeRanges.map((range) => (
                  <label
                    key={range.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition duration-200 ${pickupTimeRange === range.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <input
                      type="radio"
                      value={range.value}
                      checked={pickupTimeRange === range.value}
                      onChange={(e) => setPickupTimeRange(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${pickupTimeRange === range.value ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                      {pickupTimeRange === range.value && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <span className="text-gray-900">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {pickupTimeRange && (
              <div>
                <label htmlFor="pickup-preferred-time" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Exact Time <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="time"
                  id="pickup-preferred-time"
                  value={pickupPreferredTime}
                  onChange={(e) => setPickupPreferredTime(e.target.value)}
                  className="input-field"
                  placeholder="e.g., 10:30 AM"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll try our best to accommodate your preferred time within the selected range.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Delivery Scheduling */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Delivery Schedule
          </h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="delivery-date" className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Date *
              </label>
              <input
                type="date"
                id="delivery-date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                min={pickupDate || new Date().toISOString().split('T')[0]}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Time Range *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {timeRanges.map((range) => (
                  <label
                    key={range.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition duration-200 ${deliveryTimeRange === range.value
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <input
                      type="radio"
                      value={range.value}
                      checked={deliveryTimeRange === range.value}
                      onChange={(e) => setDeliveryTimeRange(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${deliveryTimeRange === range.value ? 'border-green-500 bg-green-500' : 'border-gray-300'
                      }`}>
                      {deliveryTimeRange === range.value && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <span className="text-gray-900">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {deliveryTimeRange && (
              <div>
                <label htmlFor="delivery-preferred-time" className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Exact Time <span className="text-gray-400">(Optional)</span>
                </label>
                <input
                  type="time"
                  id="delivery-preferred-time"
                  value={deliveryPreferredTime}
                  onChange={(e) => setDeliveryPreferredTime(e.target.value)}
                  className="input-field"
                  placeholder="e.g., 3:30 PM"
                />
                <p className="text-xs text-gray-500 mt-1">
                  We'll try our best to accommodate your preferred time within the selected range.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Location Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Enhanced Scheduling</h3>
              <p className="text-sm text-yellow-700 mt-1">
                💰 Payment on delivery • ⚖️ Weight confirmed during pickup • 📍 Flexible time ranges with preferred slots
              </p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          type="submit"
          className="btn-primary w-full"
        >
          Confirm Order Details
        </button>
      </form>
    </div>
  );
};

export default Scheduling;