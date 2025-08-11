import firebase from './firebase';
import { db } from './firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const messaging = firebase.messaging();

export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            console.log('Notification permission granted.');
            return true;
        } else {
            console.log('Notification permission denied.');
            return false;
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
        return false;
    }
};

export const getToken = async () => {
    try {
        const currentToken = await messaging.getToken();
        if (currentToken) {
            console.log('Current token for client: ', currentToken);
            return currentToken;
        } else {
            console.log('No registration token available. Request permission to generate one.');
            return null;
        }
    } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
        return null;
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        messaging.onMessage((payload) => {
            console.log('Message received. ', payload);
            resolve(payload);
        });
    });

// Notification service for admin operations
export const notificationService = {
    // Send notification to all users
    sendBroadcastNotification: async ({ title, body, data = {} }) => {
        try {
            const notificationData = {
                title,
                body,
                type: 'broadcast',
                data,
                createdAt: serverTimestamp(),
                sentBy: 'admin'
            };

            const docRef = await addDoc(collection(db, 'notifications'), notificationData);
            
            // Here you would typically call your backend to send push notifications
            // For now, we'll just store in Firestore
            console.log('Broadcast notification sent:', docRef.id);
            
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error sending broadcast notification:', error);
            return { success: false, error: error.message };
        }
    },

    // Send notification to specific user
    sendNotificationToUser: async (userId, { title, body, data = {} }) => {
        try {
            const notificationData = {
                title,
                body,
                type: 'individual',
                userId,
                data,
                createdAt: serverTimestamp(),
                sentBy: 'admin',
                read: false
            };

            const docRef = await addDoc(collection(db, 'notifications'), notificationData);
            
            // Here you would typically call your backend to send push notification to specific user
            console.log('Individual notification sent:', docRef.id);
            
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error sending notification to user:', error);
            return { success: false, error: error.message };
        }
    },

    // Send order status notification
    sendOrderStatusNotification: async (userId, orderId, status, message) => {
        try {
            const notificationData = {
                title: `Order Update - ${status}`,
                body: message,
                type: 'order_status',
                userId,
                orderId,
                status,
                createdAt: serverTimestamp(),
                read: false
            };

            const docRef = await addDoc(collection(db, 'notifications'), notificationData);
            console.log('Order status notification sent:', docRef.id);
            
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('Error sending order status notification:', error);
            return { success: false, error: error.message };
        }
    },

    // Mark notification as read
    markAsRead: async (notificationId) => {
        try {
            await updateDoc(doc(db, 'notifications', notificationId), {
                read: true,
                readAt: serverTimestamp()
            });
            
            return { success: true };
        } catch (error) {
            console.error('Error marking notification as read:', error);
            return { success: false, error: error.message };
        }
    }
};