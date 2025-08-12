import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth';
import { useUserOrders } from '../../hooks/useFirebase';
import { SERVICE_TYPES, CURRENCY_CONFIG } from '../../utils/constants';
import LoadingSpinner from '../shared/LoadingSpinner';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();
  
  // Use the Firebase hook to get user orders in real-time
  const { orders, loading: ordersLoading, error: ordersError } = useUserOrders(currentUser?.uid);

  // Helper function to get status color classes
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'picked-up':
        return 'bg-purple-100 text-purple-800';
      case 'in-progress':
        return 'bg-orange-100 text-orange-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const promotions = [
    {
      id: 1,
      title: "Express Same-Day Service",
      description: "Need it today? Skip the queue with our express wash & delivery",
      image: "/api/placeholder/400/200",
      color: "bg-gradient-to-r from-blue-500 to-purple-600",
      link: "https://wa.me/256700000000?text=Hi, I'm interested in your Express Same-Day Service. Can you tell me more?",
      linkType: "whatsapp"
    },
    {
      id: 2,
      title: "Loyalty Rewards Program",
      description: "Earn points for every order and redeem them for discounts or free washes",
      image: "/api/placeholder/400/200",
      color: "bg-gradient-to-r from-green-500 to-teal-600",
      link: "https://wa.me/256700000000?text=Hi, I'd like to know more about your Loyalty Rewards Program.",
      linkType: "whatsapp"
    },
    {
      id: 3,
      title: "Donate & Impact Lives",
      description: "Give clothes or funds to support hospitalized patients and families in slums. Every gift restores hope.",
      image: "/api/placeholder/400/200",
      color: "bg-gradient-to-r from-orange-500 to-red-600",
      link: "https://laundryimpact.org/",
      linkType: "external"
    }
  ];

  // Get recent orders from Firebase (limit to 3 most recent)
  const recentOrders = orders.slice(0, 3);

  if (!currentUser) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          {/* Logo Section */}
          <div className="flex justify-center mb-6">
            <img 
              src="/icons/default-monochrome.svg" 
              alt="Nahati Anytime Laundry" 
              className="h-20 w-auto"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {greeting}, {currentUser.displayName?.split(' ')[0] || 'there'}!
              </h1>
              <p className="text-gray-600 mt-1">Ready for fresh, clean laundry?</p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {currentUser.displayName?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Promotions Carousel */}
      <div className="px-4 py-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Featured Services & Impact</h2>
        <div className="space-y-4">
          {promotions.map((promo) => (
            <div
              key={promo.id}
              className={`${promo.color} rounded-xl p-6 text-white relative overflow-hidden`}
            >
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">{promo.title}</h3>
                <p className="text-blue-100 mb-4">{promo.description}</p>
                <a 
                  href={promo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-lg text-white font-medium hover:bg-opacity-30 transition duration-200 inline-block"
                >
                  Learn More
                </a>
              </div>
              <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white bg-opacity-10 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        
        {/* Book Now Button */}
        <Link
          to="/services"
          className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl text-center transition-all duration-300 mb-4 shadow-lg transform hover:scale-105 active:scale-95"
        >
          <div className="flex items-center justify-center">
            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Book New Order
          </div>
        </Link>

        {/* Service Categories Grid */}
        <div className="grid grid-cols-1 gap-4">
          {Object.values(SERVICE_TYPES).map((service) => (
            <Link
              key={service.id}
              to={`/services?type=${service.id}`}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 transform transition-all duration-300 hover:shadow-lg hover:scale-102 hover:-translate-y-1 active:scale-98 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">{service.name}</h3>
                  <p className="text-sm text-gray-600 mt-1 group-hover:text-gray-700 transition-colors duration-200">{service.description}</p>
                  <p className="text-sm font-medium text-blue-600 mt-2 group-hover:text-blue-700 transition-colors duration-200">
                    {CURRENCY_CONFIG.formatPrice(service.pricePerKg)}/kg
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${service.color} group-hover:scale-105 transition-transform duration-200`}>
                    {service.deliveryTime}
                  </span>
                  <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all duration-200 mt-2 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/my-orders" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View All
            </Link>
          </div>
        {ordersLoading ? (
          <div className="bg-white rounded-xl p-8">
            <LoadingSpinner className="h-20" />
            <p className="text-center text-gray-500 mt-4">Loading your orders...</p>
          </div>
        ) : ordersError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-800 text-sm">Error loading orders: {ordersError}</p>
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                to={`/order-tracking?id=${order.id}`}
                className="block bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      Order #{order.order_id || order.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.service_type || 'Standard'} Service
                    </p>
                    <p className="text-sm text-gray-500">
                      {CURRENCY_CONFIG.formatPrice(order.totalPrice || order.total_price || 0)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {(order.status || 'pending').replace('_', ' ').toUpperCase()}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-4">Start by booking your first laundry service</p>
            <Link
              to="/services"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Book Now
            </Link>
          </div>
        )}
        </div>
      )}

      {/* Quick Links */}
      <div className="px-4 py-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h2>
        <div className="grid grid-cols-2 gap-4">
          <Link
            to="/location-contact"
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition duration-200 text-center"
          >
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">Contact Us</p>
          </Link>
          
          <Link
            to="/location-contact"
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition duration-200 text-center"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">Our Location</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;