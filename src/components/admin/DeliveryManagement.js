import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import GoogleMapReact from 'google-map-react';

const DeliveryManagement = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [center, setCenter] = useState({ lat: 0, lng: 0 });
    const [zoom] = useState(11);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'orders'), (snapshot) => {
            const deliveryData = snapshot.docs
                .filter(doc => doc.data().status === 'pending')
                .map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
            setDeliveries(deliveryData);
            if (deliveryData.length > 0) {
                setCenter({
                    lat: deliveryData[0].pickup_location.lat,
                    lng: deliveryData[0].pickup_location.long,
                });
            }
        });

        return () => unsubscribe();
    }, []);

    const renderMarkers = () => {
        return deliveries.map(delivery => (
            <div
                key={delivery.id}
                lat={delivery.pickup_location.lat}
                lng={delivery.pickup_location.long}
                style={{
                    color: 'red',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                }}
            >
                📦
            </div>
        ));
    };

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <h2>Pending Deliveries</h2>
            <div style={{ height: '80%', width: '100%' }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: 'YOUR_GOOGLE_MAPS_API_KEY' }}
                    defaultCenter={center}
                    defaultZoom={zoom}
                >
                    {renderMarkers()}
                </GoogleMapReact>
            </div>
            <div>
                <h3>Delivery List</h3>
                <ul>
                    {deliveries.map(delivery => (
                        <li key={delivery.id}>
                            Order ID: {delivery.id} - Pickup: {delivery.pickup_location.address}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DeliveryManagement;