# Firebase Data Reading Setup - Nahati Laundry PWA

## 🔥 Firebase Configuration

Your Firebase is already configured in `src/services/firebase.js`. Make sure to update your `.env` file with your actual Firebase credentials:

```env
REACT_APP_FIREBASE_API_KEY=your_actual_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 📖 How to Read Firebase Data

### 1. Using React Hooks (Recommended)

```javascript
import { useFirestoreCollection, useUserOrders } from "../hooks/useFirebase";

// Real-time collection data
const {
  data: orders,
  loading,
  error,
} = useFirestoreCollection("orders", {
  where: [["status", "==", "pending"]],
  orderBy: ["created_at", "desc"],
  limit: 10,
});

// User-specific orders
const { orders: userOrders, loading, error } = useUserOrders(userId);
```

### 2. Using Direct Service Functions

```javascript
import { getCollectionData, getUserOrders } from "../services/dataReader";

// One-time data fetch
const fetchOrders = async () => {
  const result = await getCollectionData("orders");
  if (result.success) {
    console.log(result.data);
  }
};

// Get user orders
const fetchUserOrders = async (userId) => {
  const result = await getUserOrders(userId);
  if (result.success) {
    console.log(result.data);
  }
};
```

## 📊 Available Data Reading Functions

### Collection Operations

- `getCollectionData(collectionName, options)` - Get all documents from a collection
- `listenToCollection(collectionName, callback, options)` - Real-time collection listener
- `searchOrders(searchTerm)` - Search orders by customer name or order ID

### Document Operations

- `getDocumentById(collectionName, documentId)` - Get single document
- `listenToDocument(collectionName, documentId, callback)` - Real-time document listener

### Laundry-Specific Operations

- `getUserOrders(userId)` - Get all orders for a user
- `getOrdersByStatus(status)` - Get orders by status
- `getActiveOrders()` - Get non-completed orders
- `getDashboardStats()` - Get admin dashboard statistics

### Real-time Hooks

- `useFirestoreCollection(collectionName, options)` - Real-time collection hook
- `useFirestoreDocument(collectionName, documentId)` - Real-time document hook
- `useUserOrders(userId)` - Real-time user orders hook
- `useDashboardStats()` - Dashboard statistics hook

## 🎯 Query Options

When using collection functions, you can pass options:

```javascript
const options = {
  where: [
    ["status", "==", "pending"],
    ["user_id", "==", userId],
  ],
  orderBy: ["created_at", "desc"],
  limit: 10,
};
```

### Where Conditions

- `['field', '==', 'value']` - Equal to
- `['field', '!=', 'value']` - Not equal to
- `['field', '>', 'value']` - Greater than
- `['field', '>=', 'value']` - Greater than or equal
- `['field', '<', 'value']` - Less than
- `['field', '<=', 'value']` - Less than or equal
- `['field', 'in', [values]]` - In array
- `['field', 'array-contains', 'value']` - Array contains

### Order By

- `['created_at', 'desc']` - Descending order
- `['created_at', 'asc']` - Ascending order

## 🧪 Testing Your Setup

Visit http://localhost:3000/firebase-demo to see the Firebase Data Demo page where you can:

1. **Add Test Data** - Click "Add Sample Data" to populate your Firebase with sample users and orders
2. **View Real-time Data** - See orders and users update in real-time
3. **Search Orders** - Test the search functionality
4. **Dashboard Stats** - View aggregated statistics

## 📝 Example: Updated Dashboard Component

Your Dashboard component (`src/components/customer/Dashboard.js`) has been updated to show real Firebase data:

```javascript
import { useUserOrders } from "../../hooks/useFirebase";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { orders, loading, error } = useUserOrders(currentUser?.uid);

  // Display recent orders from Firebase
  const recentOrders = orders.slice(0, 3);

  return (
    <div>
      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div>
          {recentOrders.map((order) => (
            <div key={order.id}>
              Order #{order.order_id} - {order.status}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

## 🔄 Real-time Updates

All hooks automatically provide real-time updates. When data changes in Firebase:

- Components re-render automatically
- Loading states are handled
- Errors are caught and displayed

## 🏗️ Database Structure

Your Firebase should have these collections:

### `users` Collection

```javascript
{
  id: "user_id",
  name: "John Doe",
  email: "john@example.com",
  phone: "+256700123456",
  addresses: [...],
  role: "customer",
  created_at: Timestamp,
  fcm_token: ""
}
```

### `orders` Collection

```javascript
{
  id: "order_id",
  user_id: "user_id",
  customer_name: "John Doe",
  service_type: "Standard",
  items: [...],
  total_price: 25000,
  status: "pending",
  payment_status: "pending",
  pickup_address: {...},
  delivery_address: {...},
  created_at: Timestamp,
  updated_at: Timestamp
}
```

## 🚀 Next Steps

1. **Configure Firebase** - Update your `.env` file with real Firebase credentials
2. **Test the Demo** - Visit `/firebase-demo` and add test data
3. **Implement in Components** - Use the hooks in your other components
4. **Add Security Rules** - Set up Firestore security rules for your database

## 📞 Support

If you need help with Firebase setup or have questions about the data reading implementation, refer to the Firebase documentation or the code examples in the demo component.
