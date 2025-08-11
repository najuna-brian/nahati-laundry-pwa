import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Scheduling = () => {
  const navigate = useNavigate();
  
  // Location state variables
  const [pickupLocationMethod, setPickupLocationMethod] = useState(''); // 'current', 'maps', 'manual'
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Existing scheduling state variables
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

  // Location handling functions
  const getCurrentLocation = () => {
    setLocationLoading(true);
    setPickupLocationMethod('current');
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setPickupCoordinates({ lat, lng });
          
          // For now, just set coordinates as address
          // In production, you'd use Google Geocoding API
          setPickupAddress(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          setLocationLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your current location. Please try manual entry or search.');
          setLocationLoading(false);
          setPickupLocationMethod('');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser. Please use manual entry.');
      setLocationLoading(false);
      setPickupLocationMethod('');
    }
  };

  const openGoogleMaps = () => {
    setPickupLocationMethod('maps');
    // For now, we'll use a simple Google Maps search URL
    const mapsUrl = `https://maps.google.com/?q=Kampala,Uganda`;
    window.open(mapsUrl, '_blank');
    alert('Please copy your selected location address and paste it in the manual entry field below.');
  };

  const handleManualAddress = (address) => {
    if (address.trim()) {
      setPickupLocationMethod('manual');
      setPickupAddress(address.trim());
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pickupAddress || !pickupDate || !pickupTimeRange || !deliveryDate || !deliveryTimeRange) {
      alert('Please fill in all required fields including pickup location');
      return;
    }

    // Store scheduling data
    const schedulingData = {
      pickupAddress,
      pickupCoordinates,
      pickupLocationMethod,
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
        {/* Location Selection Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Step 1: Pickup Location
          </h2>
          
          {!pickupAddress ? (
            <div className="space-y-4">
              <p className="text-gray-600 mb-4">Choose how you'd like to set your pickup location:</p>
              
              {/* GPS Current Location */}
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={locationLoading}
                className="w-full p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white">
                    📍
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-gray-800">
                      {locationLoading ? 'Getting your location...' : 'Use Current Location (GPS)'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {locationLoading ? 'Please wait...' : 'Get your current location automatically'}
                    </div>
                  </div>
                </div>
              </button>

              {/* Google Maps Search */}
              <button
                type="button"
                onClick={openGoogleMaps}
                className="w-full p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                    🗺️
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-gray-800">Search on Google Maps</div>
                    <div className="text-sm text-gray-600">
                      Search and select your location on the map
                    </div>
                  </div>
                </div>
              </button>

              {/* Manual Address Entry */}
              <div className="border-2 border-dashed border-orange-300 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white">
                    ✏️
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">Enter Address Manually</div>
                    <div className="text-sm text-gray-600">
                      Type your pickup address
                    </div>
                  </div>
                </div>
                <textarea
                  placeholder="Enter your pickup address (e.g., Plot 123, Kampala Road, Central Division, Kampala)"
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows="3"
                  onChange={(e) => handleManualAddress(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg border border-green-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-800 mb-1">Selected Pickup Location:</div>
                  <div className="text-gray-700 mb-2">{pickupAddress}</div>
                  <div className="text-sm text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Location confirmed - {pickupLocationMethod === 'current' ? 'GPS' : pickupLocationMethod === 'maps' ? 'Maps' : 'Manual'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPickupAddress('');
                    setPickupLocationMethod('');
                    setPickupCoordinates(null);
                  }}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Change
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Only show scheduling sections if location is selected */}
        {pickupAddress && (
          <>
        {/* Pickup Scheduling */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Step 2: Pickup Schedule
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
        </>
        )}

        {/* Submit button - only show if location is selected */}
        {pickupAddress && (
        <button
          type="submit"
          className="btn-primary w-full"
        >
          Confirm Order Details
        </button>
        )}
      </form>
    </div>
  );
};

export default Scheduling;