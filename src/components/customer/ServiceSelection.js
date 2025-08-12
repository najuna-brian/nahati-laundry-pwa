import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SERVICE_TYPES, ADD_ONS } from '../../utils/constants';

const ServiceSelection = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [weight, setWeight] = useState('');
  const [numberOfPieces, setNumberOfPieces] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [photos, setPhotos] = useState([]);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedType = searchParams.get('type');

  // Preselect service if coming from dashboard
  React.useEffect(() => {
    if (preselectedType && SERVICE_TYPES[preselectedType.toUpperCase()]) {
      setSelectedService(SERVICE_TYPES[preselectedType.toUpperCase()]);
    }
  }, [preselectedType]);

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleAddOnToggle = (addOn) => {
    setSelectedAddOns(prev => {
      const exists = prev.find(item => item.id === addOn.id);
      if (exists) {
        return prev.filter(item => item.id !== addOn.id);
      } else {
        return [...prev, { ...addOn, quantity: 1 }];
      }
    });
  };

  const handleAddOnQuantityChange = (addOnId, quantity) => {
    setSelectedAddOns(prev =>
      prev.map(item =>
        item.id === addOnId ? { ...item, quantity: Math.max(1, quantity) } : item
      )
    );
  };

  const calculateTotal = () => {
    if (!selectedService) return 0;
    
    // If no weight provided, return 0 but allow order to proceed
    const serviceTotal = weight ? selectedService.pricePerKg * parseFloat(weight) : 0;
    const addOnsTotal = selectedAddOns.reduce((total, addOn) => {
      const price = addOn.pricePerKg ? addOn.pricePerKg * addOn.quantity : addOn.basePrice * addOn.quantity;
      return total + price;
    }, 0);
    
    return serviceTotal + addOnsTotal;
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(prev => [...prev, ...files]);
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (!selectedService) {
      alert('Please select a service');
      return;
    }

    const orderData = {
      service: selectedService,
      weight: weight ? parseFloat(weight) : null, // Allow null weight
      numberOfPieces: numberOfPieces ? parseInt(numberOfPieces) : null,
      addOns: selectedAddOns,
      specialInstructions,
      photos,
      total: calculateTotal(),
      paymentOnDelivery: true // Add payment on delivery flag
    };

    // Store order data in localStorage for next step
    localStorage.setItem('orderData', JSON.stringify(orderData));
    navigate('/order-details');
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
          <h1 className="text-xl font-semibold text-gray-900">Select Service</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Service Types */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Service</h2>
          <div className="space-y-3">
            {Object.values(SERVICE_TYPES).map((service) => (
              <div
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                className={`p-4 rounded-xl border-2 cursor-pointer transform transition-all duration-300 hover:scale-102 active:scale-98 ${
                  selectedService?.id === service.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 mr-3 transition-all duration-200 ${
                        selectedService?.id === service.id 
                          ? 'border-blue-500 bg-blue-500 scale-110' 
                          : 'border-gray-300'
                      }`}>
                        {selectedService?.id === service.id && (
                          <svg className="w-3 h-3 text-white mx-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <h3 className={`font-semibold transition-colors duration-200 ${
                        selectedService?.id === service.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>{service.name}</h3>
                    </div>
                    <p className={`text-sm mt-1 ml-8 transition-colors duration-200 ${
                      selectedService?.id === service.id ? 'text-blue-700' : 'text-gray-600'
                    }`}>{service.description}</p>
                    <div className="flex items-center justify-between mt-2 ml-7">
                      <p className="text-lg font-semibold text-blue-600">
                        UGX {service.pricePerKg.toLocaleString()}/kg
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.color}`}>
                        {service.deliveryTime}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weight Input */}
        <div>
          <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Weight (kg) <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="number"
            id="weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="input-field"
            placeholder="Enter estimated weight or leave blank"
            min="0.5"
            step="0.1"
          />
          <div className="flex items-center mt-2">
            <div className="text-xs text-gray-500">
              💡 Not sure about weight? Leave blank - we'll weigh during pickup and confirm pricing before processing.
            </div>
          </div>
        </div>

        {/* Number of Pieces Input */}
        <div>
          <label htmlFor="numberOfPieces" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Pieces <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="number"
            id="numberOfPieces"
            value={numberOfPieces}
            onChange={(e) => setNumberOfPieces(e.target.value)}
            className="input-field"
            placeholder="Enter number of clothing pieces"
            min="1"
          />
          <div className="flex items-center mt-2">
            <div className="text-xs text-gray-500">
              💡 Helps us prepare for pickup and provide better service estimates.
            </div>
          </div>
        </div>

        {/* Add-ons */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add-On Services</h2>
          <div className="space-y-3">
            {Object.values(ADD_ONS).map((addOn) => {
              const isSelected = selectedAddOns.find(item => item.id === addOn.id);
              return (
                <div
                  key={addOn.id}
                  className={`p-4 rounded-xl border-2 transition duration-200 ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      <input
                        type="checkbox"
                        checked={!!isSelected}
                        onChange={() => handleAddOnToggle(addOn)}
                        className="w-4 h-4 text-blue-600 rounded mr-3"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{addOn.name}</h3>
                        <p className="text-sm text-gray-600">{addOn.description}</p>
                        <p className="text-sm font-medium text-blue-600 mt-1">
                          {addOn.pricePerKg 
                            ? `UGX ${addOn.pricePerKg.toLocaleString()}/${addOn.unit}`
                            : `UGX ${addOn.basePrice.toLocaleString()} - ${addOn.maxPrice.toLocaleString()}/${addOn.unit}`
                          }
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex items-center ml-4">
                        <button
                          onClick={() => handleAddOnQuantityChange(addOn.id, isSelected.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="mx-3 font-medium">{isSelected.quantity}</span>
                        <button
                          onClick={() => handleAddOnQuantityChange(addOn.id, isSelected.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Special Instructions */}
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
            Special Instructions (Optional)
          </label>
          <textarea
            id="instructions"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            rows={3}
            className="input-field"
            placeholder="Any special care instructions..."
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Photos (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-600">Tap to upload photos of stains or special items</p>
            </label>
          </div>
          {photos.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Section */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-24">
        {selectedService && (
          <div className="mb-4">
            {weight ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Service Total:</span>
                  <span className="font-medium">UGX {(selectedService.pricePerKg * parseFloat(weight)).toLocaleString()}</span>
                </div>
                {selectedAddOns.length > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Add-ons Total:</span>
                    <span className="font-medium">
                      UGX {selectedAddOns.reduce((total, addOn) => {
                        const price = addOn.pricePerKg ? addOn.pricePerKg * addOn.quantity : addOn.basePrice * addOn.quantity;
                        return total + price;
                      }, 0).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-blue-600">UGX {calculateTotal().toLocaleString()}</span>
                </div>
              </>
            ) : null}
          </div>
        )}
        <button
          onClick={handleContinue}
          disabled={!selectedService}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
            !selectedService
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:scale-105 active:scale-95 hover:shadow-xl'
          }`}
        >
          <div className="flex items-center justify-center">
            Continue to Location & Scheduling
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </button>
      </div>
    </div>
  );
};

export default ServiceSelection;