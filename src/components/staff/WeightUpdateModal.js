import React, { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { CURRENCIES } from '../../utils/constants';

const WeightUpdateModal = ({ 
  order, 
  isOpen, 
  onClose, 
  onWeightUpdated 
}) => {
  const [actualWeight, setActualWeight] = useState(order.actualWeight || '');
  const [loading, setLoading] = useState(false);

  const handleUpdateWeight = async () => {
    if (!actualWeight || actualWeight <= 0) {
      alert('Please enter a valid weight');
      return;
    }

    setLoading(true);
    try {
      const currency = order.currency || 'UGX';
      const currencyData = CURRENCIES[currency];
      
      // Recalculate totals with actual weight
      const serviceTotal = currencyData.services[order.service.id].pricePerKg * parseFloat(actualWeight);
      
      const addOnsTotal = order.addOns?.reduce((total, addOn) => {
        const addOnPricing = currencyData.addOns[addOn.id];
        const price = addOnPricing?.pricePerKg ? addOnPricing.pricePerKg * addOn.quantity : addOnPricing?.basePrice * addOn.quantity;
        return total + (price || 0);
      }, 0) || 0;

      const pickupDeliveryFee = order.pickupDeliveryFee || 0;
      const finalPrice = serviceTotal + addOnsTotal + pickupDeliveryFee;

      // Update the order in Firebase
      await updateDoc(doc(db, 'orders', order.id), {
        actualWeight: parseFloat(actualWeight),
        finalPrice: finalPrice,
        status: 'weight_confirmed',
        updatedAt: serverTimestamp(),
        notes: [
          ...(order.notes || []),
          {
            timestamp: new Date().toISOString(),
            note: `Weight updated from ${order.weight || 'estimated'} kg to ${actualWeight} kg. Final price: ${currencyData.formatPrice(finalPrice)}`,
            updatedBy: 'staff'
          }
        ]
      });

      onWeightUpdated({
        ...order,
        actualWeight: parseFloat(actualWeight),
        finalPrice: finalPrice
      });

      onClose();
    } catch (error) {
      console.error('Error updating weight:', error);
      alert('Failed to update weight. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currency = order.currency || 'UGX';
  const currencyData = CURRENCIES[currency];

  // Calculate estimated new total
  const newServiceTotal = actualWeight ? currencyData.services[order.service.id].pricePerKg * parseFloat(actualWeight) : 0;
  const addOnsTotal = order.addOns?.reduce((total, addOn) => {
    const addOnPricing = currencyData.addOns[addOn.id];
    const price = addOnPricing?.pricePerKg ? addOnPricing.pricePerKg * addOn.quantity : addOnPricing?.basePrice * addOn.quantity;
    return total + (price || 0);
  }, 0) || 0;
  const pickupDeliveryFee = order.pickupDeliveryFee || 0;
  const newTotal = newServiceTotal + addOnsTotal + pickupDeliveryFee;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Update Actual Weight</h2>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Order ID:</strong> {order.orderId}<br/>
              <strong>Customer:</strong> {order.customerName}<br/>
              <strong>Service:</strong> {order.service?.name}<br/>
              <strong>Estimated Weight:</strong> {order.weight ? `${order.weight} kg` : 'Not provided'}
            </p>
          </div>

          <div>
            <label htmlFor="actual-weight" className="block text-sm font-medium text-gray-700 mb-2">
              Actual Weight (kg) *
            </label>
            <input
              type="number"
              id="actual-weight"
              value={actualWeight}
              onChange={(e) => setActualWeight(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter actual weight"
              min="0.1"
              step="0.1"
              required
            />
          </div>

          {actualWeight && (
            <div className="bg-green-50 p-3 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">New Price Calculation:</h3>
              <div className="space-y-1 text-sm text-green-700">
                <div className="flex justify-between">
                  <span>Service ({actualWeight} kg):</span>
                  <span>{currencyData.formatPrice(newServiceTotal)}</span>
                </div>
                {addOnsTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Add-ons:</span>
                    <span>{currencyData.formatPrice(addOnsTotal)}</span>
                  </div>
                )}
                {pickupDeliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Pickup & Delivery:</span>
                    <span>{currencyData.formatPrice(pickupDeliveryFee)}</span>
                  </div>
                )}
                <div className="border-t pt-1 border-green-300">
                  <div className="flex justify-between font-bold">
                    <span>Final Total:</span>
                    <span>{currencyData.formatPrice(newTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateWeight}
              disabled={!actualWeight || loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Updating...' : 'Update Weight'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeightUpdateModal;
