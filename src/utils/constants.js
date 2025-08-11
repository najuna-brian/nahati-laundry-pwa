export const SERVICE_TYPES = {
  ORDINARY: {
    id: 'ordinary',
    name: "Ordinary",
    pricePerKg: 4000,
    deliveryTime: "2 days",
    description: "Washed, not ironed, unscented",
    color: "bg-blue-100 text-blue-800"
  },
  STANDARD: {
    id: 'standard',
    name: "Standard",
    pricePerKg: 5000,
    deliveryTime: "Next day",
    description: "Scented, ironed",
    color: "bg-green-100 text-green-800"
  },
  EXPRESS: {
    id: 'express',
    name: "Express",
    pricePerKg: 8000,
    deliveryTime: "Same day",
    description: "Scented, ironed, skips the queue",
    color: "bg-red-100 text-red-800"
  }
};

export const ADD_ONS = {
  DUVET: {
    id: 'duvet',
    name: "Duvet Cleaning",
    basePrice: 10000,
    maxPrice: 30000,
    unit: 'piece',
    description: "Professional duvet cleaning"
  },
  SUIT: {
    id: 'suit',
    name: "Suit Cleaning",
    basePrice: 10000,
    maxPrice: 20000,
    unit: 'piece',
    description: "Dry cleaning for suits"
  },
  SNEAKER: {
    id: 'sneaker',
    name: "Sneaker Cleaning",
    pricePerKg: 5000,
    unit: 'kg',
    description: "Deep cleaning for sneakers"
  }
};

export const DELIVERY_FEE_PER_KM = 2000;
export const MINIMUM_ORDER_AMOUNT = 10000;

export const PAYMENT_METHODS = {
  MOBILE_MONEY: {
    id: 'mobile_money',
    name: "Mobile Money",
    code: 'MTN_MOMO',
    merchantCode: '327231',
    businessName: 'Nahati Anytime Laundry',
    instructions: "Dial *165# and follow prompts to pay merchant"
  },
  BANK_TRANSFER: {
    id: 'bank_transfer',
    name: "Bank Transfer", 
    bankName: "Equity Bank",
    accountNumber: "1234567890",
    accountName: "Nahati Anytime Laundry"
  },
  CASH_ON_DELIVERY: {
    id: 'cash_on_delivery',
    name: "Cash on Delivery",
    description: "Pay when we deliver (Recommended)",
    recommended: true
  }
};

export const ORDER_STATUS = {
  PLACED: 'placed',
  PICKED_UP: 'picked_up', 
  IN_PROGRESS: 'in_progress',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PLACED]: 'Order Placed',
  [ORDER_STATUS.PICKED_UP]: 'Picked Up',
  [ORDER_STATUS.IN_PROGRESS]: 'In Progress',
  [ORDER_STATUS.READY]: 'Ready for Delivery',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled'
};

export const CONTACT_INFO = {
  MTN_NUMBER: '+256394827687',
  AIRTEL_NUMBER: '+256200981445',
  WHATSAPP_NUMBER: '+256200981445',
  EMAIL: 'info@nahatilaundry.com',
  ADDRESS: 'Nahati Anytime Laundry, Kampala, Uganda'
};

export const BUSINESS_LOCATION = {
  lat: 0.3385054639934989,
  lng: 32.56840547410712,
  address: 'Nahati Anytime Laundry, Kampala, Uganda'
};

export const TIME_SLOTS = [
  '8:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM', 
  '12:00 PM - 2:00 PM',
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM'
];

export const CURRENCY = {
  UGX: 'UGX',
  USD: 'USD'
};

export const EXCHANGE_RATE = 3700; // UGX to USD