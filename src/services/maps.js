import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
  version: 'weekly',
});

export const loadMap = (mapElement, options) => {
  return loader.load().then(() => {
    return new google.maps.Map(mapElement, options);
  });
};

export const createMarker = (map, position, title) => {
  return new google.maps.Marker({
    position,
    map,
    title,
  });
};

export const setMapCenter = (map, lat, lng) => {
  map.setCenter(new google.maps.LatLng(lat, lng));
};

export const addListenerToMarker = (marker, event, callback) => {
  marker.addListener(event, callback);
};