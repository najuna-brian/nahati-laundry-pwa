import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SERVICE_TYPES, ADD_ONS, CURRENCY_CONFIG, CONTACT_INFO } from '../../utils/constants';

const ServiceSelection = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [weight, setWeight] = useState('');
  const [numberOfPieces, setNumberOfPieces] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [photos, setPhotos] = useState([]);
  const [bookingType, setBookingType] = useState('full-service'); // 'full-service', 'addons-only'
  const [customOtherService, setCustomOtherService] = useState('');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedType = searchParams.get('type');

  // Preselect service if coming from dashboard
  useEffect(() => {
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
    let total = 0;
    
    // Add service cost if full-service booking
    if (bookingType === 'full-service' && selectedService && weight) {
      total += selectedService.pricePerKg * parseFloat(weight);
    }
    
    // Add add-ons cost
    const addOnsTotal = selectedAddOns.reduce((sum, addOn) => {
      const price = addOn.pricePerKg ? addOn.pricePerKg * addOn.quantity : addOn.basePrice * addOn.quantity;
      return sum + price;
    }, 0);
    
    return total + addOnsTotal;
  };

  const handlePhotoUpload = (e) => {
    try {
      const files = Array.from(e.target.files);
      
      // Filter only image files
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      
      if (imageFiles.length !== files.length) {
        alert('Only image files are allowed');
      }
      
      // Check file size (max 5MB per file)
      const validFiles = imageFiles.filter(file => file.size <= 5 * 1024 * 1024);
      
      if (validFiles.length !== imageFiles.length) {
        alert('Some files are too large. Maximum size is 5MB per file.');
      }
      
      // Check total files limit (max 5 files)
      const totalFiles = photos.length + validFiles.length;
      if (totalFiles > 5) {
        alert('Maximum 5 photos allowed');
        return;
      }
      
      // Create preview URLs for the files
      const newPhotos = validFiles.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        uploaded: false
      }));
      
      setPhotos(prev => [...prev, ...newPhotos]);
      
    } catch (error) {
      console.error('Error handling photo upload:', error);
      alert('Error uploading photos. Please try again.');
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => {
      const newPhotos = [...prev];
      // Revoke the object URL to free memory
      if (newPhotos[index].preview) {
        URL.revokeObjectURL(newPhotos[index].preview);
      }
      newPhotos.splice(index, 1);
      return newPhotos;
    });
  };

  const canProceed = () => {
    if (bookingType === 'addons-only') {
      return selectedAddOns.length > 0;
    }
    return selectedService; // For full-service, just need a service selected
  };

  const handleContinue = () => {
    if (!canProceed()) return;

    const serviceData = {
      bookingType,
      service: bookingType === 'full-service' ? selectedService : null,
      addOns: selectedAddOns,
      weight: weight || null,
      numberOfPieces: numberOfPieces || null,
      specialInstructions,
      photos,
      totalPrice: calculateTotal(),
      currency: 'UGX',
      customOtherService: customOtherService || null
    };

    // Navigate to scheduling with the service data
    navigate('/scheduling', { state: { orderData: serviceData } });
  };

  const handleOtherServiceChange = (value) => {
    setCustomOtherService(value);
    // Auto-select "Other" add-on if user types something
    if (value && !selectedAddOns.find(item => item.id === 'other')) {
      handleAddOnToggle(ADD_ONS.OTHER);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Select Your Service</h1>
          <p className="text-gray-600">Choose the service that fits your needs</p>
        </div>

        {/* Currency Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-blue-600 mr-3">💰</div>
            <div>
              <p className="text-blue-800 font-medium">Pricing & Payment</p>
              <p className="text-blue-700 text-sm">{CURRENCY_CONFIG.paymentNote}</p>
            </div>
          </div>
        </div>

        {/* Booking Type Selection */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Booking Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setBookingType('full-service')}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                bookingType === 'full-service'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900">Full Laundry Service</h3>
              <p className="text-sm text-gray-600 mt-1">Complete wash, dry, and optional ironing service</p>
            </button>
            
            <button
              onClick={() => setBookingType('addons-only')}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                bookingType === 'addons-only'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <h3 className="font-semibold text-gray-900">Specialized Services Only</h3>
              <p className="text-sm text-gray-600 mt-1">Duvet cleaning, suits, sneakers, or custom services</p>
            </button>
          </div>
        </div>

        {/* Service Types - Only show for full-service */}
        {bookingType === 'full-service' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Service</h2>
            <div className="space-y-3">
              {Object.values(SERVICE_TYPES).map((service) => (
                <div
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className={`border rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                    selectedService?.id === service.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      <p className="text-lg font-semibold text-blue-600 mt-2">
                        {CURRENCY_CONFIG.formatPrice(service.pricePerKg)}/kg
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${service.color}`}>
                        {service.deliveryTime}
                      </span>
                    </div>
                    <div className="ml-4">
                      {selectedService?.id === service.id && (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weight Input - Only show for full-service */}
        {bookingType === 'full-service' && (
          <div>
            <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Weight (kg) <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              type="number"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter estimated weight or leave blank"
              min="0.5"
              step="0.1"
            />
            <div className="flex items-center mt-2">
              <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-gray-600">
                Don't know the weight? No problem! Our staff will weigh your clothes during pickup and confirm the final price.
              </p>
            </div>
          </div>
        )}

        {/* Add-ons Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {bookingType === 'addons-only' ? 'Select Services' : 'Add Extra Services'}
          </h2>
          <div className="space-y-3">
            {Object.values(ADD_ONS).map((addOn) => {
              const isSelected = selectedAddOns.find(item => item.id === addOn.id);
              return (
                <div
                  key={addOn.id}
                  className={`border rounded-xl p-4 transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <button
                          onClick={() => handleAddOnToggle(addOn)}
                          className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300 hover:border-blue-400'
                          }`}
                        >
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        <div>
                          <h3 className="font-semibold text-gray-900">{addOn.name}</h3>
                          <p className="text-sm text-gray-600">{addOn.description}</p>
                          <p className="text-sm font-medium text-blue-600 mt-1">
                            {addOn.pricePerKg 
                              ? `${CURRENCY_CONFIG.formatPrice(addOn.pricePerKg)}/${addOn.unit}`
                              : `${CURRENCY_CONFIG.formatPrice(addOn.basePrice)} - ${CURRENCY_CONFIG.formatPrice(addOn.maxPrice)}/${addOn.unit}`
                            }
                          </p>
                        </div>
                      </div>
                      
                      {/* Custom input for "Other" service */}
                      {addOn.id === 'other' && isSelected && (
                        <div className="mt-3 ml-8">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Please specify your service:
                          </label>
                          <input
                            type="text"
                            value={customOtherService}
                            onChange={(e) => handleOtherServiceChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Curtain cleaning, Carpet cleaning, etc."
                          />
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <div className="flex items-center ml-4">
                        <button
                          onClick={() => handleAddOnQuantityChange(addOn.id, isSelected.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="mx-3 font-medium">{isSelected.quantity}</span>
                        <button
                          onClick={() => handleAddOnQuantityChange(addOn.id, isSelected.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
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

        {/* Number of Pieces */}
        <div>
          <label htmlFor="pieces" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Pieces <span className="text-gray-400">(Optional)</span>
          </label>
          <input
            type="number"
            id="pieces"
            value={numberOfPieces}
            onChange={(e) => setNumberOfPieces(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., 10 shirts, 5 pants"
            min="1"
          />
        </div>

        {/* Special Instructions */}
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 mb-2">
            Special Instructions <span className="text-gray-400">(Optional)</span>
          </label>
          <textarea
            id="instructions"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Any specific instructions for handling your clothes..."
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Photos <span className="text-gray-400">(Optional, max 5)</span>
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="mt-4">
                <p className="text-sm text-gray-600">Click to upload photos or drag and drop</p>
                <p className="text-xs text-gray-500">PNG, JPG up to 5MB each</p>
              </div>
            </label>
          </div>
          
          {/* Photo Preview */}
          {photos.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={photo.preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dry Cleaning Option */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Need Dry Cleaning?</h3>
              <p className="text-sm text-gray-600 mt-1">Professional dry cleaning for delicate items</p>
            </div>
            <a
              href={CONTACT_INFO.dryCleaningWhatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.288"/>
              </svg>
              Contact via WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Fixed Bottom - Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        {(selectedService || selectedAddOns.length > 0) && (
          <div className="mb-4">
            {bookingType === 'full-service' && weight && selectedService ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Service Total:</span>
                  <span className="font-medium">{CURRENCY_CONFIG.formatPrice(selectedService.pricePerKg * parseFloat(weight))}</span>
                </div>
                {selectedAddOns.length > 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Add-ons Total:</span>
                    <span className="font-medium">
                      {CURRENCY_CONFIG.formatPrice(selectedAddOns.reduce((total, addOn) => {
                        const price = addOn.pricePerKg ? addOn.pricePerKg * addOn.quantity : addOn.basePrice * addOn.quantity;
                        return total + price;
                      }, 0))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-blue-600">{CURRENCY_CONFIG.formatPrice(calculateTotal())}</span>
                </div>
              </>
            ) : selectedAddOns.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Services Total:</span>
                  <span className="font-medium">
                    {CURRENCY_CONFIG.formatPrice(selectedAddOns.reduce((total, addOn) => {
                      const price = addOn.pricePerKg ? addOn.pricePerKg * addOn.quantity : addOn.basePrice * addOn.quantity;
                      return total + price;
                    }, 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-blue-600">{CURRENCY_CONFIG.formatPrice(calculateTotal())}</span>
                </div>
              </>
            ) : null}
          </div>
        )}
        <button
          onClick={handleContinue}
          disabled={!canProceed()}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 ${
            !canProceed()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105 active:scale-95'
          }`}
        >
          {canProceed() ? 'Continue to Scheduling' : 
           bookingType === 'addons-only' ? 'Select at least one service' : 'Select a service to continue'}
        </button>
      </div>
    </div>
  );
};

export default ServiceSelection;
