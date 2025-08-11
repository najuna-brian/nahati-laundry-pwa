// Test file to verify notification system implementation
import { notificationService } from '../services/notificationService';

// Test function to send a sample notification
export const testNotificationSystem = async () => {
    try {
        console.log('Testing notification system...');
        
        // Test sending a notification to all staff and admins
        await notificationService.sendToAllStaffAndAdmins({
            type: 'test',
            title: 'Test Notification',
            message: 'This is a test notification from the system',
            priority: 'normal',
            data: {
                testField: 'test value'
            }
        });
        
        console.log('Test notification sent successfully');
        return true;
    } catch (error) {
        console.error('Error testing notification system:', error);
        return false;
    }
};

// Test function to create a mock notification
export const createMockNotification = () => {
    return {
        id: 'test-' + Date.now(),
        type: 'new_order',
        title: 'New Test Order',
        message: 'Order #NH123456 from Test Customer',
        priority: 'high',
        isRead: false,
        createdAt: { toDate: () => new Date() },
        data: {
            orderId: 'NH123456',
            customerName: 'Test Customer'
        }
    };
};

export default {
    testNotificationSystem,
    createMockNotification
};
