import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp,
  getDocs 
} from 'firebase/firestore';
import { db } from './firebase';

class NotificationService {
  constructor() {
    this.listeners = new Map();
    this.reminderIntervals = new Map();
  }

  /**
   * Send notification to all staff and admins
   */
  async sendToAllStaff(notification) {
    try {
      // Get all staff and admin users
      const usersQuery = query(
        collection(db, 'users'),
        where('role', 'in', ['staff', 'admin'])
      );
      
      const usersSnapshot = await getDocs(usersQuery);
      const staffUsers = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Send notification to each staff/admin
      const notificationPromises = staffUsers.map(user => 
        this.sendNotification({
          ...notification,
          userId: user.id,
          userRole: user.role
        })
      );

      await Promise.all(notificationPromises);
      console.log(`Notification sent to ${staffUsers.length} staff members`);
      
      return { success: true, recipientCount: staffUsers.length };
    } catch (error) {
      console.error('Error sending notification to all staff:', error);
      throw error;
    }
  }

  /**
   * Send notification to specific user
   */
  async sendNotification(notificationData) {
    try {
      const notification = {
        ...notificationData,
        createdAt: serverTimestamp(),
        read: false,
        viewed: false,
        priority: notificationData.priority || 'normal'
      };

      const docRef = await addDoc(collection(db, 'notifications'), notification);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send new order notification to all staff
   */
  async sendNewOrderNotification(orderData) {
    const notification = {
      type: 'new_order',
      title: '🆕 New Order Received',
      message: `New order from ${orderData.customerName} - Total: $${orderData.totalAmount}`,
      priority: 'high',
      isRead: false,
      data: {
        orderId: orderData.orderId || orderData.id,
        customerName: orderData.customerName,
        totalAmount: orderData.totalAmount
      }
    };

    await this.sendToAllStaff(notification);
    
    // Start reminder system for this order
    this.startOrderReminder(orderData.orderId, orderData);
    
    return { success: true };
  }

  /**
   * Send client registration notification to admins
   */
  async sendClientRegistrationNotification(clientData, registeredBy) {
    try {
      // Get all admin users
      const adminsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'admin')
      );
      
      const adminsSnapshot = await getDocs(adminsQuery);
      const adminUsers = adminsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      const notification = {
        type: 'client_registration',
        title: 'New Client Registered',
        message: `${clientData.name} was registered by ${registeredBy.name}`,
        priority: 'normal',
        data: {
          clientName: clientData.name,
          clientEmail: clientData.email,
          clientPhone: clientData.phone,
          registeredBy: registeredBy.name,
          registeredByRole: registeredBy.role
        }
      };

      // Send to all admins
      const notificationPromises = adminUsers.map(admin => 
        this.sendNotification({
          ...notification,
          userId: admin.id,
          userRole: admin.role
        })
      );

      await Promise.all(notificationPromises);
      return { success: true, recipientCount: adminUsers.length };
    } catch (error) {
      console.error('Error sending client registration notification:', error);
      throw error;
    }
  }

  /**
   * Start reminder system for unviewed orders
   */
  startOrderReminder(orderId, orderData) {
    // Clear any existing reminder for this order
    if (this.reminderIntervals.has(orderId)) {
      clearInterval(this.reminderIntervals.get(orderId));
    }

    // Set reminder every 2 minutes
    const reminderInterval = setInterval(async () => {
      try {
        // Check if order has been viewed/assigned
        const orderViewed = await this.checkOrderViewed(orderId);
        
        if (!orderViewed) {
          // Send reminder notification
          const reminderNotification = {
            type: 'order_reminder',
            title: '⏰ Order Reminder',
            message: `Order #${orderData.orderId} still needs attention!`,
            orderId: orderId,
            customerName: orderData.userName,
            priority: 'urgent',
            actionRequired: true,
            data: {
              orderId: orderData.orderId,
              customerName: orderData.userName,
              waitTime: '2+ minutes',
              reminderCount: this.getReminderCount(orderId)
            }
          };

          await this.sendToAllStaff(reminderNotification);
          this.incrementReminderCount(orderId);
          
          console.log(`Reminder sent for order ${orderId}`);
        } else {
          // Order has been viewed, stop reminders
          this.stopOrderReminder(orderId);
        }
      } catch (error) {
        console.error('Error in order reminder:', error);
      }
    }, 2 * 60 * 1000); // 2 minutes

    this.reminderIntervals.set(orderId, reminderInterval);
  }

  /**
   * Stop reminder for specific order
   */
  stopOrderReminder(orderId) {
    if (this.reminderIntervals.has(orderId)) {
      clearInterval(this.reminderIntervals.get(orderId));
      this.reminderIntervals.delete(orderId);
      console.log(`Stopped reminders for order ${orderId}`);
    }
  }

  /**
   * Check if order has been viewed by staff
   */
  async checkOrderViewed(orderId) {
    try {
      // Check if there are any notifications for this order that have been viewed
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('orderId', '==', orderId),
        where('viewed', '==', true)
      );
      
      const snapshot = await getDocs(notificationsQuery);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking order viewed status:', error);
      return false;
    }
  }

  /**
   * Mark notification as viewed
   */
  async markAsViewed(notificationId, userId) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        viewed: true,
        viewedAt: serverTimestamp(),
        viewedBy: userId
      });

      // If this was an order notification, stop reminders
      const notificationDoc = await getDocs(
        query(
          collection(db, 'notifications'),
          where('__name__', '==', notificationId)
        )
      );
      
      if (!notificationDoc.empty) {
        const notification = notificationDoc.docs[0].data();
        if (notification.orderId && notification.type === 'new_order') {
          this.stopOrderReminder(notification.orderId);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking notification as viewed:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Listen to notifications for specific user
   */
  listenToUserNotifications(userId, callback) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(notifications);
    });

    this.listeners.set(userId, unsubscribe);
    return unsubscribe;
  }

  /**
   * Helper methods for reminder counting
   */
  getReminderCount(orderId) {
    return this.reminderCounts?.get(orderId) || 0;
  }

  incrementReminderCount(orderId) {
    if (!this.reminderCounts) {
      this.reminderCounts = new Map();
    }
    const currentCount = this.reminderCounts.get(orderId) || 0;
    this.reminderCounts.set(orderId, currentCount + 1);
  }

  /**
   * Cleanup listeners
   */
  cleanup() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
    
    this.reminderIntervals.forEach(interval => clearInterval(interval));
    this.reminderIntervals.clear();
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
