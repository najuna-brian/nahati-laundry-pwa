import { BUSINESS_LOCATION, pickupDeliveryFeePerKm } from './constants';

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

/**
 * Calculate pickup/delivery fee based on distance
 * Rounds up to the nearest kilometer and applies the fee
 * @param {Object} pickupCoordinates - {lat, lng}
 * @returns {Object} - {distance, roundedDistance, fee}
 */
export function calculatePickupDeliveryFee(pickupCoordinates) {
  if (!pickupCoordinates || !pickupCoordinates.lat || !pickupCoordinates.lng) {
    return { distance: 0, roundedDistance: 0, fee: 0 };
  }

  const distance = calculateDistance(
    BUSINESS_LOCATION.lat,
    BUSINESS_LOCATION.lng,
    pickupCoordinates.lat,
    pickupCoordinates.lng
  );

  // Round up to the nearest kilometer (e.g., 3.4km becomes 4km)
  const roundedDistance = Math.ceil(distance);
  
  // Calculate fee based on rounded distance (UGX only)
  const fee = roundedDistance * pickupDeliveryFeePerKm;

  return {
    distance: parseFloat(distance.toFixed(2)),
    roundedDistance,
    fee
  };
}

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export function formatDistance(distance) {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m`;
  }
  return `${distance.toFixed(1)}km`;
}
