import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, where, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import LoadingSpinner from '../shared/LoadingSpinner';

const Reports = () => {
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('7days'); // 7days, 30days, 90days, all
    const [selectedReport, setSelectedReport] = useState('overview'); // overview, financial, services, customers

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch orders
            const ordersQuery = query(
                collection(db, 'orders'),
                orderBy('createdAt', 'desc')
            );
            const ordersSnapshot = await getDocs(ordersQuery);
            const ordersList = ordersSnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                totalPrice: doc.data().totalPrice || 0
            }));

            // Fetch customers
            const customersQuery = query(
                collection(db, 'users'),
                where('role', '==', 'customer')
            );
            const customersSnapshot = await getDocs(customersQuery);
            const customersList = customersSnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));

            setOrders(ordersList);
            setCustomers(customersList);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getDateFilteredOrders = () => {
        if (dateRange === 'all') return orders;
        
        const now = new Date();
        const days = dateRange === '7days' ? 7 : dateRange === '30days' ? 30 : 90;
        const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
        
        return orders.filter(order => order.createdAt >= cutoffDate);
    };

    const getFinancialMetrics = () => {
        const filteredOrders = getDateFilteredOrders();
        const completedOrders = filteredOrders.filter(order => order.status === 'completed');
        
        const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        const totalOrders = filteredOrders.length;
        const completedOrdersCount = completedOrders.length;
        const averageOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;
        
        const pendingOrders = filteredOrders.filter(order => order.status === 'pending').length;
        const inProgressOrders = filteredOrders.filter(order => ['pickedUp', 'inProgress'].includes(order.status)).length;
        
        return {
            totalRevenue,
            totalOrders,
            completedOrdersCount,
            averageOrderValue,
            pendingOrders,
            inProgressOrders
        };
    };

    const getServiceMetrics = () => {
        const filteredOrders = getDateFilteredOrders();
        const serviceStats = {};
        
        filteredOrders.forEach(order => {
            if (order.selectedServices) {
                order.selectedServices.forEach(service => {
                    if (!serviceStats[service.name]) {
                        serviceStats[service.name] = {
                            count: 0,
                            revenue: 0,
                            quantity: 0
                        };
                    }
                    serviceStats[service.name].count += 1;
                    serviceStats[service.name].revenue += service.price || 0;
                    serviceStats[service.name].quantity += service.quantity || 1;
                });
            }
        });
        
        return Object.entries(serviceStats)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => b.count - a.count);
    };

    const getCustomerMetrics = () => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        const newCustomers = customers.filter(customer => customer.createdAt >= thirtyDaysAgo).length;
        const totalCustomers = customers.length;
        
        // Customer order frequency
        const customerOrderCounts = {};
        orders.forEach(order => {
            customerOrderCounts[order.userId] = (customerOrderCounts[order.userId] || 0) + 1;
        });
        
        const returningCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
        const averageOrdersPerCustomer = totalCustomers > 0 ? orders.length / totalCustomers : 0;
        
        return {
            totalCustomers,
            newCustomers,
            returningCustomers,
            averageOrdersPerCustomer
        };
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const financialMetrics = getFinancialMetrics();
    const serviceMetrics = getServiceMetrics();
    const customerMetrics = getCustomerMetrics();

    const renderOverviewReport = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Financial Overview */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                <h3 className="text-lg font-semibold mb-2">Revenue</h3>
                <p className="text-3xl font-bold">${financialMetrics.totalRevenue.toFixed(2)}</p>
                <p className="text-blue-100">From {financialMetrics.completedOrdersCount} completed orders</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
                <p className="text-3xl font-bold">{financialMetrics.totalOrders}</p>
                <p className="text-green-100">{financialMetrics.pendingOrders} pending, {financialMetrics.inProgressOrders} in progress</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                <h3 className="text-lg font-semibold mb-2">Avg Order Value</h3>
                <p className="text-3xl font-bold">${financialMetrics.averageOrderValue.toFixed(2)}</p>
                <p className="text-purple-100">Per completed order</p>
            </div>
            
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                <h3 className="text-lg font-semibold mb-2">Total Customers</h3>
                <p className="text-3xl font-bold">{customerMetrics.totalCustomers}</p>
                <p className="text-orange-100">{customerMetrics.newCustomers} new this month</p>
            </div>
            
            <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 rounded-lg text-white">
                <h3 className="text-lg font-semibold mb-2">Returning Customers</h3>
                <p className="text-3xl font-bold">{customerMetrics.returningCustomers}</p>
                <p className="text-teal-100">{((customerMetrics.returningCustomers / customerMetrics.totalCustomers) * 100).toFixed(1)}% retention rate</p>
            </div>
            
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 p-6 rounded-lg text-white">
                <h3 className="text-lg font-semibold mb-2">Avg Orders/Customer</h3>
                <p className="text-3xl font-bold">{customerMetrics.averageOrdersPerCustomer.toFixed(1)}</p>
                <p className="text-pink-100">Overall average</p>
            </div>
        </div>
    );

    const renderServiceReport = () => (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Service Performance</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {serviceMetrics.map((service, index) => (
                                <tr key={service.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {service.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {service.count}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {service.quantity}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        ${service.revenue.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {serviceMetrics.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No service data available for the selected period.
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Reports & Analytics</h1>
                
                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                        <select 
                            value={dateRange} 
                            onChange={(e) => setDateRange(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                            <option value="90days">Last 90 Days</option>
                            <option value="all">All Time</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                        <select 
                            value={selectedReport} 
                            onChange={(e) => setSelectedReport(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="overview">Overview</option>
                            <option value="services">Service Performance</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div className="space-y-6">
                {selectedReport === 'overview' && renderOverviewReport()}
                {selectedReport === 'services' && renderServiceReport()}
            </div>

            {/* Export Options */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Export Options</h3>
                <div className="flex gap-4">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
                        Export PDF
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200">
                        Export CSV
                    </button>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200">
                        Email Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Reports;