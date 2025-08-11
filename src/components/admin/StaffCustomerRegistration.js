import React, { useState } from 'react';
import { db } from '../../services/firebase';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';

const StaffCustomerRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    services: [],
    pickupDate: '',
    pickupTime: '',
    notes: ''
  });
  
  const [availableServices] = useState([
    { id: 'wash-fold', name: 'Wash & Fold', pricePerKg: 3000 },
    { id: 'dry-cleaning', name: 'Dry Cleaning', pricePerKg: 8000 },
    { id: 'ironing', name: 'Ironing Only', pricePerKg: 2000 },
    { id: 'wash-iron', name: 'Wash & Iron', pricePerKg: 4000 },
    { id: 'bedding', name: 'Bedding & Curtains', pricePerKg: 5000 },
    { id: 'shoes', name: 'Shoe Cleaning', pricePerKg: 10000 }
  ]);

  const [selectedServices, setSelectedServices] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceToggle = (service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, { ...service, quantity: 1, estimatedWeight: 1 }];
      }
    });
  };

  const updateServiceQuantity = (serviceId, field, value) => {
    setSelectedServices(prev =>
      prev.map(service =>
        service.id === serviceId
          ? { ...service, [field]: Math.max(1, parseInt(value) || 1) }
          : service
      )
    );
  };

  const calculateEstimatedTotal = () => {
    return selectedServices.reduce((total, service) => {
      return total + (service.pricePerKg * service.estimatedWeight * service.quantity);
    }, 0);
  };

  const generateInvitationCode = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      alert('Name and phone number are required');
      return;
    }

    if (selectedServices.length === 0) {
      alert('Please select at least one service');
      return;
    }

    setSubmitting(true);
    try {
      const invitationCode = generateInvitationCode();
      const orderNumber = 'NH' + Date.now().toString().slice(-6);
      
      // Create customer document
      const customerId = `customer_${Date.now()}`;
      await setDoc(doc(db, 'users', customerId), {
        id: customerId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email || '',
        address: formData.address || '',
        role: 'customer',
        registeredBy: 'staff',
        invitationCode: invitationCode,
        invitationSent: false,
        accountActivated: false,
        createdAt: new Date(),
        createdBy: 'staff' // In real app, this would be the staff member's ID
      });

      // Create order document
      const orderData = {
        id: orderNumber,
        orderNumber: orderNumber,
        customerId: customerId,
        customerName: formData.name,
        customerPhone: formData.phone,
        customerEmail: formData.email,
        address: formData.address,
        services: selectedServices,
        pickupDate: formData.pickupDate,
        pickupTime: formData.pickupTime,
        notes: formData.notes,
        status: 'pending_pickup',
        estimatedTotal: calculateEstimatedTotal(),
        actualWeight: null,
        finalAmount: null,
        paymentStatus: 'pending',
        paymentMethod: 'cash_on_delivery',
        createdAt: new Date(),
        createdBy: 'staff',
        invitationCode: invitationCode
      };

      await addDoc(collection(db, 'orders'), orderData);

      // Generate invitation link
      const invitationLink = `${window.location.origin}/customer-invitation/${invitationCode}`;
      
      setSuccess({
        customerName: formData.name,
        orderNumber: orderNumber,
        invitationLink: invitationLink,
        invitationCode: invitationCode
      });

      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        services: [],
        pickupDate: '',
        pickupTime: '',
        notes: ''
      });
      setSelectedServices([]);

    } catch (error) {
      console.error('Error creating customer and order:', error);
      alert('Failed to register customer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyInvitationLink = (link) => {
    navigator.clipboard.writeText(link);
    alert('Invitation link copied to clipboard!');
  };

  const sendWhatsAppInvitation = (phone, link, customerName) => {
    const message = `Hello ${customerName}! 👋\n\nWelcome to Nahati Anytime Laundry! 🧺\n\nYour laundry order has been registered. Click the link below to create your account and track your order:\n\n${link}\n\nWith your account, you can:\n✅ Track your order status\n✅ Download invoices\n✅ Book future services\n✅ Get instant notifications\n\nThank you for choosing Nahati! 🌟`;
    
    const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">✅ Customer Registered Successfully!</h2>
          <p className="text-gray-600">Order created and invitation link generated</p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg mb-6">
          <h3 className="font-semibold text-green-800 mb-4">📋 Order Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Customer:</span> {success.customerName}
            </div>
            <div>
              <span className="font-medium">Order #:</span> {success.orderNumber}
            </div>
            <div>
              <span className="font-medium">Invitation Code:</span> {success.invitationCode}
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg mb-6">
          <h3 className="font-semibold text-blue-800 mb-4">🔗 Customer Invitation</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Invitation Link
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={success.invitationLink}
                readOnly
                className="flex-1 p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
              />
              <button
                onClick={() => copyInvitationLink(success.invitationLink)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                📋 Copy
              </button>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => sendWhatsAppInvitation(formData.phone, success.invitationLink, success.customerName)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold"
            >
              📱 Send via WhatsApp
            </button>
            <button
              onClick={() => setSuccess(null)}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold"
            >
              ➕ Register Another Customer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">👥 Register Walk-in Customer</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter customer's full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+256 700 000 000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="customer@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Customer's address"
              />
            </div>
          </div>
        </div>

        {/* Service Selection */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800 mb-4">Select Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableServices.map((service) => {
              const isSelected = selectedServices.find(s => s.id === service.id);
              return (
                <div
                  key={service.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-green-500 bg-green-100'
                      : 'border-gray-300 hover:border-green-300'
                  }`}
                  onClick={() => handleServiceToggle(service)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-800">{service.name}</h4>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                    }`}>
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">UGX {service.pricePerKg}/kg</p>
                  
                  {isSelected && (
                    <div className="mt-3 space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600">Estimated Weight (kg)</label>
                        <input
                          type="number"
                          min="1"
                          value={isSelected.estimatedWeight}
                          onChange={(e) => updateServiceQuantity(service.id, 'estimatedWeight', e.target.value)}
                          className="w-full p-1 text-sm border border-gray-300 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={isSelected.quantity}
                          onChange={(e) => updateServiceQuantity(service.id, 'quantity', e.target.value)}
                          className="w-full p-1 text-sm border border-gray-300 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {selectedServices.length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-lg border">
              <h4 className="font-semibold text-gray-800 mb-2">Order Summary</h4>
              <div className="space-y-1 text-sm">
                {selectedServices.map((service) => (
                  <div key={service.id} className="flex justify-between">
                    <span>{service.name} ({service.estimatedWeight}kg × {service.quantity})</span>
                    <span>UGX {service.pricePerKg * service.estimatedWeight * service.quantity}</span>
                  </div>
                ))}
                <div className="border-t pt-1 font-semibold flex justify-between">
                  <span>Estimated Total:</span>
                  <span>UGX {calculateEstimatedTotal()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pickup Schedule */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-800 mb-4">Pickup Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Date
              </label>
              <input
                type="date"
                name="pickupDate"
                value={formData.pickupDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Time
              </label>
              <select
                name="pickupTime"
                value={formData.pickupTime}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select time...</option>
                <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
                <option value="afternoon">Afternoon (12:00 PM - 5:00 PM)</option>
                <option value="evening">Evening (5:00 PM - 8:00 PM)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Any special instructions for pickup or handling..."
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || selectedServices.length === 0}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-lg ${
            submitting || selectedServices.length === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {submitting ? '⏳ Creating Order...' : '✅ Register Customer & Create Order'}
        </button>
      </form>
    </div>
  );
};

export default StaffCustomerRegistration;
