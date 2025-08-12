import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { timeSlotsFullDay } from '../../utils/constants';
import { calculatePickupDeliveryFee } from '../../utils/distance';

const Scheduling = () => {
  const navigate = useNavigate();
  
  // Location state variables
  const [pickupLocationMethod, setPickupLocationMethod] = useState(''); // 'current', 'maps', 'manual'
  const [pickupAddress, setPickupAddress] = useState('');
  const [manualAddressInput, setManualAddressInput] = useState(''); // Separate state for manual input
  const [pickupCoordinates, setPickupCoordinates] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Customer information (mandatory)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [detailedLocation, setDetailedLocation] = useState(''); // Optional apartment/room details
  
  // Existing scheduling state variables
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTimeRange, setPickupTimeRange] = useState('');
  const [pickupPreferredTime, setPickupPreferredTime] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTimeRange, setDeliveryTimeRange] = useState('');
  const [deliveryPreferredTime, setDeliveryPreferredTime] = useState('');

  const timeRanges = timeSlotsFullDay.map(slot => ({
    value: slot.toLowerCase().replace(/[^a-z0-9]/g, ''),
    label: slot
  }));

  // Location handling functions
  const getCurrentLocation = () => {
    setLocationLoading(true);
    setPickupLocationMethod('current');
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser. Please use manual entry.');
      setLocationLoading(false);
      setPickupLocationMethod('');
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    };
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setPickupCoordinates({ lat, lng });
          
          // Try to get address using reverse geocoding (simplified version)
          // In production, you'd use Google Geocoding API
          const addressString = `GPS Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          setPickupAddress(addressString);
          setLocationLoading(false);
          
          console.log('GPS location obtained:', { lat, lng });
        } catch (error) {
          console.error('Error processing location:', error);
          setLocationLoading(false);
          setPickupLocationMethod('');
          alert('Error processing your location. Please try manual entry.');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationLoading(false);
        setPickupLocationMethod('');
        
        let errorMessage = 'Unable to get your current location. ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access was denied. Please allow location access or use manual entry.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information is unavailable. Please try manual entry.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again or use manual entry.';
            break;
          default:
            errorMessage += 'Please try manual entry or search on maps.';
            break;
        }
        alert(errorMessage);
      },
      options
    );
  };

  const openGoogleMaps = () => {
    setPickupLocationMethod('maps');
    // For now, we'll use a simple Google Maps search URL
    const mapsUrl = `https://maps.google.com/?q=Kampala,Uganda`;
    window.open(mapsUrl, '_blank');
    alert('Please copy your selected location address and paste it in the manual entry field below.');
  };

  const handleManualAddress = (address) => {
    console.log('Manual address input:', address);
    setManualAddressInput(address);
    
    // Set the pickup address immediately without trimming until user finishes
    setPickupAddress(address);
    
    if (address.length > 3) { // Only set method after meaningful input
      setPickupLocationMethod('manual');
    } else if (address.length === 0) {
      setPickupLocationMethod('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent default form behavior and stop propagation
    e.stopPropagation();
    
    console.log('Form submitted', {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      pickupAddress,
      pickupDate,
      pickupTimeRange,
      deliveryDate,
      deliveryTimeRange
    });

    // Validation
    if (!customerName.trim()) {
      alert('Please enter your full name');
      document.getElementById('customer-name')?.focus();
      return;
    }

    if (!customerPhone.trim()) {
      alert('Please enter your phone number');
      document.getElementById('customer-phone')?.focus();
      return;
    }

    // Simple phone number validation
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(customerPhone.trim())) {
      alert('Please enter a valid phone number (at least 10 digits)');
      document.getElementById('customer-phone')?.focus();
      return;
    }

    if (!pickupAddress) {
      alert('Please select or enter your pickup location');
      return;
    }

    if (!pickupDate) {
      alert('Please select a pickup date');
      return;
    }

    if (!pickupTimeRange) {
      alert('Please select a pickup time range');
      return;
    }

    if (!deliveryDate) {
      alert('Please select a delivery date');
      return;
    }

    if (!deliveryTimeRange) {
      alert('Please select a delivery time range');
      return;
    }

    try {
      // Get order data to calculate pickup/delivery fee with correct currency
      const orderData = JSON.parse(localStorage.getItem('orderData') || '{}');
      const currency = orderData.currency || 'UGX';

      // Calculate pickup/delivery fee based on distance
      const distanceInfo = calculatePickupDeliveryFee(pickupCoordinates, currency);

      // Store scheduling data
      const schedulingData = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        detailedLocation: detailedLocation.trim(),
        pickupAddress,
        pickupCoordinates,
        pickupLocationMethod,
        pickupDate,
        pickupTimeRange,
        pickupPreferredTime,
        deliveryDate,
        deliveryTimeRange,
        deliveryPreferredTime,
        paymentOnDelivery: true,
        // Distance and fee information
        distance: distanceInfo.distance,
        roundedDistance: distanceInfo.roundedDistance,
        pickupDeliveryFee: distanceInfo.fee,
        currency: currency
      };

      localStorage.setItem('schedulingData', JSON.stringify(schedulingData));
      
      console.log('Navigating to order confirmation...');
      
      // Navigate to confirmation
      navigate('/order-confirmation');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    }
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
        {/* Customer Information Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Customer Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="customer-name" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="customer-name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="input-field"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label htmlFor="customer-phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="customer-phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="input-field"
                placeholder="e.g., +256 700 123 456 or 0700 123 456"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                We'll use this number to contact you about pickup and delivery
              </p>
            </div>
          </div>
        </div>

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
                  value={manualAddressInput}
                  onChange={(e) => handleManualAddress(e.target.value)}
                  onFocus={() => console.log('Manual address field focused')}
                />
              </div>
            </div>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg border border-green-300">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-800 mb-1">Selected Pickup Location:</div>
                  <div className="text-gray-700 mb-2 break-words">{pickupAddress || 'No address set'}</div>
                  <div className="text-sm text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Location confirmed - {pickupLocationMethod === 'current' ? 'GPS' : pickupLocationMethod === 'maps' ? 'Maps' : 'Manual'}
                  </div>
                  {/* Debug info - remove in production */}
                  <div className="text-xs text-gray-500 mt-1">
                    Debug: Address length = {pickupAddress?.length || 0}, Method = {pickupLocationMethod}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPickupAddress('');
                    setManualAddressInput('');
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

        {/* Detailed Location Section */}
        {pickupAddress && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Additional Location Details (Optional)
            </h3>
            
            <div>
              <label htmlFor="detailed-location" className="block text-sm font-medium text-gray-700 mb-2">
                Apartment, Room Number, or Special Instructions
              </label>
              <textarea
                id="detailed-location"
                value={detailedLocation}
                onChange={(e) => setDetailedLocation(e.target.value)}
                className="input-field"
                rows="3"
                placeholder="e.g., Apartment 3B, Room 205, Gate code: 1234, Ask for security guard, etc."
              />
              <p className="text-xs text-gray-500 mt-1">
                Help our delivery team find you easily with specific building details, room numbers, or access instructions
              </p>
            </div>
          </div>
        )}

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

            {/* Preferred Exact Time First */}
            <div>
              <label htmlFor="pickup-preferred-time" className="block text-sm font-medium text-gray-700 mb-2">
                🕐 Preferred Exact Pickup Time <span className="text-blue-600 font-medium">(Recommended)</span>
              </label>
              <input
                type="time"
                id="pickup-preferred-time"
                value={pickupPreferredTime}
                onChange={(e) => setPickupPreferredTime(e.target.value)}
                className="input-field"
                placeholder="Select your preferred time"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Specify your exact preferred time for better service scheduling
              </p>
            </div>

            <div>
              <label htmlFor="pickup-time-range" className="block text-sm font-medium text-gray-700 mb-2">
                Backup Time Range * <span className="text-gray-500">(If exact time unavailable)</span>
              </label>
              <select
                id="pickup-time-range"
                value={pickupTimeRange}
                onChange={(e) => setPickupTimeRange(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select a time range</option>
                {timeRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-blue-600 mt-2 font-medium">
                🌟 We operate 24/7 for your convenience!
              </p>
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

            {/* Preferred Exact Time First */}
            <div>
              <label htmlFor="delivery-preferred-time" className="block text-sm font-medium text-gray-700 mb-2">
                🕐 Preferred Exact Delivery Time <span className="text-green-600 font-medium">(Recommended)</span>
              </label>
              <input
                type="time"
                id="delivery-preferred-time"
                value={deliveryPreferredTime}
                onChange={(e) => setDeliveryPreferredTime(e.target.value)}
                className="input-field"
                placeholder="Select your preferred time"
              />
              <p className="text-xs text-gray-500 mt-1">
                💡 Specify your exact preferred time for better delivery scheduling
              </p>
            </div>

            <div>
              <label htmlFor="delivery-time-range" className="block text-sm font-medium text-gray-700 mb-2">
                Backup Time Range * <span className="text-gray-500">(If exact time unavailable)</span>
              </label>
              <select
                id="delivery-time-range"
                value={deliveryTimeRange}
                onChange={(e) => setDeliveryTimeRange(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select a time range</option>
                {timeRanges.map((range) => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-green-600 mt-2 font-medium">
                🌟 24/7 delivery service available!
              </p>
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
              <h3 className="text-sm font-medium text-yellow-800">Enhanced Scheduling</h3>
              <p className="text-sm text-yellow-700 mt-1">
                💰 Payment on delivery • ⚖️ Weight confirmed during pickup • 📍 Flexible time ranges with preferred slots
              </p>
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-4">
          <button
            type="submit"
            className="btn-primary w-full py-4 text-lg font-semibold"
            disabled={!customerName.trim() || !customerPhone.trim() || !pickupAddress || !pickupDate || !pickupTimeRange || !deliveryDate || !deliveryTimeRange}
          >
            {(!customerName.trim() || !customerPhone.trim() || !pickupAddress || !pickupDate || !pickupTimeRange || !deliveryDate || !deliveryTimeRange) 
              ? 'Please complete all required fields'
              : 'Confirm Order Details'
            }
          </button>
        </div>
      </>
      )}
      </form>
    </div>
  );
};

export default Scheduling;