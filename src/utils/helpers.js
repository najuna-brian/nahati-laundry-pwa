const formatCurrency = (amount, currency = 'UGX') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
};

const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10,15}$/; // Adjust regex based on phone number format
    return phoneRegex.test(phone);
};

const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0]; // Returns current date in YYYY-MM-DD format
};

export { formatCurrency, calculateDistance, validatePhoneNumber, getCurrentDate };