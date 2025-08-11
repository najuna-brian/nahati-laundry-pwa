import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Scheduling = () => {
  const navigate = useNavigate();
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  const timeSlots = [
    '8:00 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '12:00 PM - 2:00 PM',
    '2:00 PM - 4:00 PM',
    '4:00 PM - 6:00 PM'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pickupDate || !pickupTime || !deliveryDate || !deliveryTime) {
      alert('Please fill in all fields');
      return;
    }

    // Store scheduling data
    const schedulingData = {
      pickupDate,
      pickupTime,
      deliveryDate,
      deliveryTime
    };

    localStorage.setItem('schedulingData', JSON.stringify(schedulingData));
    navigate('/payment');
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
                Pickup Time *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {timeSlots.map((slot) => (
                  <label
                    key={slot}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition duration-200 ${pickupTime === slot
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <input
                      type="radio"
                      value={slot}
                      checked={pickupTime === slot}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${pickupTime === slot ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                      {pickupTime === slot && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <span className="text-gray-900">{slot}</span>
                  </label>
                ))}
              </div>
            </div>
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
                Delivery Time *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {timeSlots.map((slot) => (
                  <label
                    key={slot}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition duration-200 ${deliveryTime === slot
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <input
                      type="radio"
                      value={slot}
                      checked={deliveryTime === slot}
                      onChange={(e) => setDeliveryTime(e.target.value)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${deliveryTime === slot ? 'border-green-500 bg-green-500' : 'border-gray-300'
                      }`}>
                      {deliveryTime === slot && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                      )}
                    </div>
                    <span className="text-gray-900">{slot}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Location Note */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Location Setup</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You'll be able to set your pickup and delivery locations in the next step using our map interface.
              </p>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button
          type="submit"
          className="btn-primary w-full"
        >
          Continue to Payment
        </button>
      </form>
    </div>
  );
};

export default Scheduling;