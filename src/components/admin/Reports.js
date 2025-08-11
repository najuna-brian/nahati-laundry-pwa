import React, { useEffect, useState } from 'react';
import { firestore } from '../../services/firestore';
import LoadingSpinner from '../shared/LoadingSpinner';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const snapshot = await firestore.collection('orders').get();
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setReports(data);
            } catch (error) {
                console.error("Error fetching reports: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    const totalIncome = reports.reduce((acc, order) => acc + order.total_price_ugx, 0);
    const serviceCounts = reports.reduce((acc, order) => {
        acc[order.service_type] = (acc[order.service_type] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="reports-container">
            <h1>Reports</h1>
            <h2>Total Income: UGX {totalIncome}</h2>
            <h3>Service Requests:</h3>
            <ul>
                {Object.entries(serviceCounts).map(([service, count]) => (
                    <li key={service}>{service}: {count} requests</li>
                ))}
            </ul>
        </div>
    );
};

export default Reports;