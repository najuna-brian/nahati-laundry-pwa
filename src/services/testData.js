import { addDoc, collection, setDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

// Sample data for testing
const sampleUsers = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+256700123456',
    addresses: [
      {
        street: 'Kampala Road',
        city: 'Kampala',
        landmark: 'Near City Square'
      }
    ],
    role: 'customer',
    created_at: new Date(),
    fcm_token: ''
  },
  {
    id: 'user2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+256700654321',
    addresses: [
      {
        street: 'Entebbe Road',
        city: 'Kampala',
        landmark: 'Near Garden City'
      }
    ],
    role: 'customer',
    created_at: new Date(),
    fcm_token: ''
  },
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@nahati.com',
    phone: '+256700999888',
    addresses: [],
    role: 'admin',
    created_at: new Date(),
    fcm_token: ''
  }
];

const sampleOrders = [
  {
    user_id: 'user1',
    customer_name: 'John Doe',
    customer_phone: '+256700123456',
    customer_email: 'john@example.com',
    service_type: 'Standard',
    items: [
      { name: 'Shirts', quantity: 5, price_per_item: 3000 },
      { name: 'Trousers', quantity: 2, price_per_item: 4000 }
    ],
    total_price: 23000,
    pickup_address: {
      street: 'Kampala Road',
      city: 'Kampala',
      landmark: 'Near City Square'
    },
    delivery_address: {
      street: 'Kampala Road',
      city: 'Kampala',
      landmark: 'Near City Square'
    },
    pickup_date: new Date(),
    delivery_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    status: 'pending',
    payment_status: 'pending',
    payment_method: 'cash',
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    user_id: 'user1',
    customer_name: 'John Doe',
    customer_phone: '+256700123456',
    customer_email: 'john@example.com',
    service_type: 'Express',
    items: [
      { name: 'Bed sheets', quantity: 2, price_per_item: 8000 }
    ],
    total_price: 16000,
    pickup_address: {
      street: 'Kampala Road',
      city: 'Kampala',
      landmark: 'Near City Square'
    },
    delivery_address: {
      street: 'Kampala Road',
      city: 'Kampala',
      landmark: 'Near City Square'
    },
    pickup_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Yesterday
    delivery_date: new Date(),
    status: 'completed',
    payment_status: 'paid',
    payment_method: 'mobile_money',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updated_at: new Date()
  },
  {
    user_id: 'user2',
    customer_name: 'Jane Smith',
    customer_phone: '+256700654321',
    customer_email: 'jane@example.com',
    service_type: 'Ordinary',
    items: [
      { name: 'Casual wear', quantity: 8, price_per_item: 2500 }
    ],
    total_price: 20000,
    pickup_address: {
      street: 'Entebbe Road',
      city: 'Kampala',
      landmark: 'Near Garden City'
    },
    delivery_address: {
      street: 'Entebbe Road',
      city: 'Kampala',
      landmark: 'Near Garden City'
    },
    pickup_date: new Date(),
    delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    status: 'in-progress',
    payment_status: 'pending',
    payment_method: 'cash',
    created_at: new Date(),
    updated_at: new Date()
  }
];

/**
 * Add sample users to Firestore
 */
export const addSampleUsers = async () => {
  console.log('Adding sample users...');
  
  try {
    for (const user of sampleUsers) {
      await setDoc(doc(db, 'users', user.id), user);
      console.log(`Added user: ${user.name}`);
    }
    console.log('✅ Sample users added successfully!');
    return { success: true, message: 'Sample users added successfully!' };
  } catch (error) {
    console.error('❌ Error adding sample users:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Add sample orders to Firestore
 */
export const addSampleOrders = async () => {
  console.log('Adding sample orders...');
  
  try {
    for (const order of sampleOrders) {
      await addDoc(collection(db, 'orders'), order);
      console.log(`Added order for: ${order.customer_name}`);
    }
    console.log('✅ Sample orders added successfully!');
    return { success: true, message: 'Sample orders added successfully!' };
  } catch (error) {
    console.error('❌ Error adding sample orders:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Add all sample data
 */
export const addAllSampleData = async () => {
  console.log('🚀 Adding all sample data to Firebase...');
  
  try {
    const userResult = await addSampleUsers();
    if (!userResult.success) {
      throw new Error(userResult.error);
    }
    
    const orderResult = await addSampleOrders();
    if (!orderResult.success) {
      throw new Error(orderResult.error);
    }
    
    console.log('🎉 All sample data added successfully!');
    return { 
      success: true, 
      message: 'All sample data added successfully! You can now test Firebase data reading.' 
    };
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate random order data for testing
 */
export const generateRandomOrder = (userId = 'user1', customerName = 'Test User') => {
  const serviceTypes = ['Ordinary', 'Standard', 'Express'];
  const statuses = ['pending', 'confirmed', 'picked-up', 'in-progress', 'ready', 'delivered', 'completed'];
  const paymentMethods = ['cash', 'mobile_money', 'bank_transfer'];
  
  const randomService = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const randomPayment = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
  
  return {
    userId: userId,
    customer_name: customerName,
    customer_phone: '+256700' + Math.floor(Math.random() * 999999),
    customer_email: customerName.toLowerCase().replace(' ', '') + '@example.com',
    service_type: randomService,
    items: [
      { 
        name: 'Mixed clothing', 
        quantity: Math.floor(Math.random() * 10) + 1, 
        price_per_item: Math.floor(Math.random() * 5000) + 2000 
      }
    ],
    total_price: Math.floor(Math.random() * 50000) + 10000,
    pickup_address: {
      street: 'Random Street ' + Math.floor(Math.random() * 100),
      city: 'Kampala',
      landmark: 'Near Random Landmark'
    },
    delivery_address: {
      street: 'Random Street ' + Math.floor(Math.random() * 100),
      city: 'Kampala',
      landmark: 'Near Random Landmark'
    },
    pickup_date: new Date(),
    delivery_date: new Date(Date.now() + Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000),
    status: randomStatus,
    payment_status: Math.random() > 0.5 ? 'paid' : 'pending',
    payment_method: randomPayment,
    created_at: new Date(),
    updated_at: new Date()
  };
};

/**
 * Add multiple random orders for testing
 */
export const addRandomOrders = async (count = 5) => {
  console.log(`Adding ${count} random orders...`);
  
  try {
    for (let i = 0; i < count; i++) {
      const randomOrder = generateRandomOrder();
      await addDoc(collection(db, 'orders'), randomOrder);
      console.log(`Added random order ${i + 1}/${count}`);
    }
    console.log(`✅ ${count} random orders added successfully!`);
    return { success: true, message: `${count} random orders added successfully!` };
  } catch (error) {
    console.error('❌ Error adding random orders:', error);
    return { success: false, error: error.message };
  }
};

const testDataService = {
  addSampleUsers,
  addSampleOrders,
  addAllSampleData,
  addRandomOrders,
  generateRandomOrder
};

export default testDataService;
