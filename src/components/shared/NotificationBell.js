import React, { useState } from 'react';

const NotificationBell = ({ notifications = [], onNotificationClick }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    const handleNotificationClick = (notification) => {
        if (onNotificationClick) {
            onNotificationClick(notification);
        }
        setIsOpen(false);
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_order':
                return '📦';
            case 'order_status_update':
                return '🔄';
            case 'customer_registration':
                return '👤';
            case 'reminder':
                return '⏰';
            default:
                return '🔔';
        }
    };

    const getNotificationColor = (priority) => {
        switch (priority) {
            case 'high':
                return 'border-l-red-500 bg-red-50';
            case 'medium':
                return 'border-l-yellow-500 bg-yellow-50';
            default:
                return 'border-l-blue-500 bg-blue-50';
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return 'Just now';
        
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / 60000);
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="relative">
            {/* Notification Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M15 17h5l-3.5-3.5a50.002 50.002 0 00-2.5-5.5V6a6 6 0 10-12 0v2c0 1.8-.4 3.5-1 5l-3.5 3.5h5m7 0a3 3 0 11-6 0m6 0H9" />
                </svg>
                
                {/* Notification Badge */}
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-sm text-blue-600 font-medium">
                                    {unreadCount} unread
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-gray-500">
                                <svg className="mx-auto h-12 w-12 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293L16 15.586a1 1 0 01-.707.293h-2.586a1 1 0 01-.707-.293L10.293 13.293A1 1 0 009.586 13H7"/>
                                </svg>
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {notifications.slice(0, 10).map((notification) => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 ${getNotificationColor(notification.priority)} ${
                                            !notification.isRead ? 'bg-blue-25' : ''
                                        }`}
                                    >
                                        <div className="flex items-start space-x-3">
                                            <span className="text-2xl flex-shrink-0">
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className={`text-sm font-medium ${
                                                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                                    }`}>
                                                        {notification.title}
                                                    </p>
                                                    {!notification.isRead && (
                                                        <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatTime(notification.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {notifications.length > 10 && (
                        <div className="p-3 border-t border-gray-200 text-center">
                            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Overlay to close dropdown */}
            {isOpen && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default NotificationBell;
