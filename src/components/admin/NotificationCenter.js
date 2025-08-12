import React, { useState, useEffect } from 'react';
import { notificationService } from '../../services/notificationService';
import { useFirebase } from '../../hooks/useFirebase';

const NotificationCenter = () => {
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [message, setMessage] = useState('');
  const [notificationType, setNotificationType] = useState('individual');
  const [sending, setSending] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [sentNotifications, setSentNotifications] = useState([]);

  const { data: customersData } = useFirebase('users', {
    realtime: true,
    where: [['role', '==', 'customer']]
  });

  const { data: notificationsData } = useFirebase('notifications', {
    realtime: true,
    orderBy: [['createdAt', 'desc']],
    limit: 20
  });

  useEffect(() => {
    if (customersData) {
      setCustomers(customersData);
    }
  }, [customersData]);

  useEffect(() => {
    if (notificationsData) {
      setSentNotifications(notificationsData);
    }
  }, [notificationsData]);

  const handleSendNotification = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    if (notificationType === 'individual' && !selectedCustomer) {
      alert('Please select a customer');
      return;
    }

    setSending(true);
    try {
      if (notificationType === 'broadcast') {
        await notificationService.sendBroadcastNotification({
          title: 'Nahati Anytime Laundry',
          body: message,
          data: { type: 'admin_broadcast' }
        });
      } else {
        await notificationService.sendNotificationToUser(selectedCustomer, {
          title: 'Nahati Anytime Laundry',
          body: message,
          data: { type: 'admin_message' }
        });
      }
      
      setMessage('');
      setSelectedCustomer('');
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('Failed to send notification. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const predefinedMessages = [
    "Your laundry order is ready for pickup!",
    "New services available this month with special discounts!",
    "Holiday hours: We'll be closed on Sunday. Plan your pickups accordingly.",
    "Reminder: Your scheduled pickup is tomorrow.",
    "Thank you for choosing Nahati! Rate your experience."
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📱 Notification Center</h2>
      
      {/* Send Notification Section */}
      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Send Notification</h3>
        
        {/* Notification Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notification Type
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="individual"
                checked={notificationType === 'individual'}
                onChange={(e) => setNotificationType(e.target.value)}
                className="mr-2"
              />
              <span>Individual Customer</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="broadcast"
                checked={notificationType === 'broadcast'}
                onChange={(e) => setNotificationType(e.target.value)}
                className="mr-2"
              />
              <span>All Customers</span>
            </label>
          </div>
        </div>

        {/* Customer Selection */}
        {notificationType === 'individual' && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Customer
            </label>
            <select
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a customer...</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name || customer.email} - {customer.phone || 'No phone'}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Predefined Messages */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Messages
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {predefinedMessages.map((msg, index) => (
              <button
                key={index}
                onClick={() => setMessage(msg)}
                className="text-left p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded border text-gray-700"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Message */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your message here..."
            rows="4"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Send Button */}
        <button
          onClick={handleSendNotification}
          disabled={sending || !message.trim()}
          className={`w-full py-3 px-6 rounded-lg font-semibold ${
            sending || !message.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {sending ? '📤 Sending...' : '📱 Send Notification'}
        </button>
      </div>

      {/* Recent Notifications */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Notifications</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sentNotifications.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No notifications sent yet</p>
          ) : (
            sentNotifications.map((notification) => (
              <div key={notification.id} className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    notification.type === 'broadcast' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {notification.type === 'broadcast' ? '📢 Broadcast' : '👤 Individual'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {notification.createdAt?.toDate().toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-800 font-medium">{notification.title}</p>
                <p className="text-gray-600 text-sm">{notification.body}</p>
                {notification.recipientName && (
                  <p className="text-xs text-blue-600 mt-1">
                    Sent to: {notification.recipientName}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
