import React, { useEffect, useState } from 'react';
import { firestore } from '../../services/firestore';
import LoadingSpinner from '../shared/LoadingSpinner';

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const snapshot = await firestore.collection('users').where('role', '==', 'customer').get();
                const customerList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setCustomers(customerList);
            } catch (error) {
                console.error("Error fetching customers: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    const filteredCustomers = customers.filter(customer => 
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        customer.phone.includes(searchTerm)
    );

    return (
        <div className="customer-management">
            <h1>Customer Management</h1>
            <input 
                type="text" 
                placeholder="Search by name or phone" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
            />
            {loading ? (
                <LoadingSpinner />
            ) : (
                <ul>
                    {filteredCustomers.map(customer => (
                        <li key={customer.id}>
                            <h2>{customer.name}</h2>
                            <p>Phone: {customer.phone}</p>
                            <p>Email: {customer.email}</p>
                            <p>Orders: {customer.orders ? customer.orders.length : 0}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CustomerManagement;