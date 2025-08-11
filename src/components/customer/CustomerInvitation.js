import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';

const CustomerInvitation = () => {
  const { invitationCode } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState('verify'); // verify, register, complete
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    verifyInvitationCode();
  }, [invitationCode]);

  const verifyInvitationCode = async () => {
    try {
      // Check for orders with this invitation code
      const orderQuery = query(
        collection(db, 'orders'),
        where('invitationCode', '==', invitationCode)
      );
      const orderSnapshot = await getDocs(orderQuery);
      
      if (orderSnapshot.empty) {
        setError('Invalid invitation code. Please check the link and try again.');
        setLoading(false);
        return;
      }

      const orderDoc = orderSnapshot.docs[0];
      const order = { id: orderDoc.id, ...orderDoc.data() };
      setOrderData(order);

      // Check for customer data
      const customerQuery = query(
        collection(db, 'users'),
        where('invitationCode', '==', invitationCode)
      );
      const customerSnapshot = await getDocs(customerQuery);
      
      if (!customerSnapshot.empty) {
        const customerDoc = customerSnapshot.docs[0];
        const customer = { id: customerDoc.id, ...customerDoc.data() };
        setCustomerData(customer);
        
        if (customer.accountActivated) {
          setError('This invitation has already been used. Please log in with your account.');
          setLoading(false);
          return;
        }
        
        setFormData(prev => ({
          ...prev,
          email: customer.email || ''
        }));
      }

      setStep('register');
      setLoading(false);
    } catch (error) {
      console.error('Error verifying invitation:', error);
      setError('Failed to verify invitation. Please try again.');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegistration = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      // Create Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      // Update customer document
      if (customerData) {
        await updateDoc(doc(db, 'users', customerData.id), {
          email: formData.email,
          accountActivated: true,
          activatedAt: new Date(),
          authUid: userCredential.user.uid
        });
      }

      setStep('complete');
    } catch (error) {
      console.error('Error creating account:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please use a different email or contact support.');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToApp = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">🎉 Welcome to Nahati!</h2>
          <p className="text-gray-600 mb-6">
            Your account has been created successfully! You can now track your order and enjoy all our digital services.
          </p>
          
          {orderData && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
              <h3 className="font-semibold text-blue-800 mb-2">📋 Your Order Details</h3>
              <div className="text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">Order #:</span> {orderData.orderNumber}</p>
                <p><span className="font-medium">Status:</span> {orderData.status}</p>
                <p><span className="font-medium">Pickup Date:</span> {orderData.pickupDate || 'TBD'}</p>
                <p><span className="font-medium">Estimated Total:</span> UGX {orderData.estimatedTotal}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={handleContinueToApp}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold"
          >
            🧺 Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome to Nahati! 🧺</h1>
          <p className="text-gray-600">Create your account to track your laundry order</p>
        </div>

        {orderData && (
          <div className="bg-green-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-green-800 mb-2">📋 Your Order</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p><span className="font-medium">Order #:</span> {orderData.orderNumber}</p>
              <p><span className="font-medium">Customer:</span> {orderData.customerName}</p>
              <p><span className="font-medium">Services:</span> {orderData.services?.length || 0} items</p>
              <p><span className="font-medium">Estimated Total:</span> UGX {orderData.estimatedTotal}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleRegistration} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              minLength="6"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="At least 6 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-semibold ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? '⏳ Creating Account...' : '✅ Create Account & Access Order'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            After creating your account, you'll be able to:
          </p>
          <ul className="text-sm text-gray-500 mt-2 space-y-1">
            <li>📱 Track your order in real-time</li>
            <li>📄 Download invoices</li>
            <li>🔔 Receive status notifications</li>
            <li>🧺 Book future laundry services</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CustomerInvitation;
