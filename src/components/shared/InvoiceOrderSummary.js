import React from 'react';
import { CURRENCIES } from '../../utils/constants';

const InvoiceOrderSummary = ({ 
  orderData, 
  schedulingData, 
  status = 'pending',
  onStatusChange 
}) => {
  const currency = orderData?.currency || 'UGX';
  const currencyFormatter = CURRENCIES[currency];

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: '✅' },
    { value: 'picked_up', label: 'Picked Up', color: 'bg-purple-100 text-purple-800', icon: '📦' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-orange-100 text-orange-800', icon: '🔄' },
    { value: 'ready', label: 'Ready', color: 'bg-green-100 text-green-800', icon: '✨' },
    { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-indigo-100 text-indigo-800', icon: '🚚' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800', icon: '🎉' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: '❌' }
  ];

  const currentStatus = statusOptions.find(s => s.value === status) || statusOptions[0];

  // Calculate totals
  const serviceTotal = orderData?.weight 
    ? currencyFormatter?.services[orderData.service?.id]?.pricePerKg * orderData.weight 
    : 0;

  const addOnsTotal = orderData?.addOns?.reduce((total, addOn) => {
    const addOnPricing = currencyFormatter?.addOns[addOn.id];
    const price = addOnPricing?.pricePerKg ? addOnPricing.pricePerKg * addOn.quantity : addOnPricing?.basePrice * addOn.quantity;
    return total + (price || 0);
  }, 0) || 0;

  const pickupDeliveryFee = schedulingData?.pickupDeliveryFee || 0;
  const grandTotal = serviceTotal + addOnsTotal + pickupDeliveryFee;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Invoice Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">INVOICE</h1>
            <p className="text-blue-100 mt-1">Nahati Anytime Laundry</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100">Order ID</p>
            <p className="text-xl font-bold">{orderData?.orderId || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-gray-700">Order Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentStatus.color}`}>
            {currentStatus.icon} {currentStatus.label}
          </span>
        </div>
        
        {onStatusChange && (
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((statusOption) => (
              <button
                key={statusOption.value}
                onClick={() => onStatusChange(statusOption.value)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                  status === statusOption.value
                    ? statusOption.color + ' ring-2 ring-blue-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {statusOption.icon} {statusOption.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Customer Information */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Customer Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Name:</span>
            <p className="font-medium">{schedulingData?.customerName || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-600">Phone:</span>
            <p className="font-medium">{schedulingData?.customerPhone || 'N/A'}</p>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Address:</span>
            <p className="font-medium">{schedulingData?.pickupAddress || 'N/A'}</p>
            {schedulingData?.detailedLocation && (
              <p className="text-sm text-gray-600 mt-1">
                Details: {schedulingData.detailedLocation}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Service Details</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="font-medium">{orderData?.service?.name}</span>
              {orderData?.weight && (
                <span className="text-gray-600 ml-2">({orderData.weight}kg)</span>
              )}
            </div>
            <span className="font-medium">
              {serviceTotal > 0 ? currencyFormatter?.formatPrice(serviceTotal) : 'TBD'}
            </span>
          </div>

          {orderData?.addOns?.map((addOn, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-gray-600">{addOn.name} x{addOn.quantity}</span>
              <span>{currencyFormatter?.formatPrice(
                (currencyFormatter?.addOns[addOn.id]?.pricePerKg || currencyFormatter?.addOns[addOn.id]?.basePrice || 0) * addOn.quantity
              )}</span>
            </div>
          ))}

          {schedulingData?.distance && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                Pickup & Delivery ({schedulingData.roundedDistance}km)
              </span>
              <span>{currencyFormatter?.formatPrice(pickupDeliveryFee)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Schedule Information */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">Schedule</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Pickup:</span>
            <p className="font-medium">{schedulingData?.pickupDate || 'N/A'}</p>
            {schedulingData?.pickupPreferredTime && (
              <p className="text-xs text-blue-600">Preferred: {schedulingData.pickupPreferredTime}</p>
            )}
            <p className="text-xs text-gray-600">{schedulingData?.pickupTimeRange || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-600">Delivery:</span>
            <p className="font-medium">{schedulingData?.deliveryDate || 'N/A'}</p>
            {schedulingData?.deliveryPreferredTime && (
              <p className="text-xs text-green-600">Preferred: {schedulingData.deliveryPreferredTime}</p>
            )}
            <p className="text-xs text-gray-600">{schedulingData?.deliveryTimeRange || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="p-6 bg-gray-50">
        <div className="space-y-2">
          {serviceTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span>Service Subtotal:</span>
              <span>{currencyFormatter?.formatPrice(serviceTotal)}</span>
            </div>
          )}
          {addOnsTotal > 0 && (
            <div className="flex justify-between text-sm">
              <span>Add-ons Subtotal:</span>
              <span>{currencyFormatter?.formatPrice(addOnsTotal)}</span>
            </div>
          )}
          {pickupDeliveryFee > 0 && (
            <div className="flex justify-between text-sm">
              <span>Pickup & Delivery Fee:</span>
              <span>{currencyFormatter?.formatPrice(pickupDeliveryFee)}</span>
            </div>
          )}
          <div className="border-t pt-2">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total Amount:</span>
              <span className="text-blue-600">
                {grandTotal > 0 ? currencyFormatter?.formatPrice(grandTotal) : 'To be calculated'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 font-medium">💰 Payment on Delivery</p>
          {!orderData?.weight && (
            <p className="text-xs text-blue-600 mt-1">
              Final amount will be calculated based on actual weight during pickup
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceOrderSummary;
