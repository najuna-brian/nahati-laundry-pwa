import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc } from 'firebase/firestore';
import LoadingSpinner from '../shared/LoadingSpinner';

const Inventory = () => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        category: '',
        quantity: 0,
        minimumStock: 0,
        unit: 'pieces',
        cost: 0
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, low-stock, out-of-stock

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        try {
            setLoading(true);
            const inventoryCollection = collection(db, 'inventory');
            const inventorySnapshot = await getDocs(inventoryCollection);
            const inventoryList = inventorySnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
            }));
            setInventoryItems(inventoryList);
        } catch (error) {
            console.error("Error fetching inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (itemId, field, value) => {
        try {
            const itemRef = doc(db, 'inventory', itemId);
            await updateDoc(itemRef, { 
                [field]: Number(value),
                updatedAt: new Date()
            });
            
            setInventoryItems(prevItems => 
                prevItems.map(item => 
                    item.id === itemId 
                        ? { ...item, [field]: Number(value), updatedAt: new Date() } 
                        : item
                )
            );
        } catch (error) {
            console.error("Error updating inventory:", error);
            alert('Error updating inventory item');
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const docRef = await addDoc(collection(db, 'inventory'), {
                ...newItem,
                quantity: Number(newItem.quantity),
                minimumStock: Number(newItem.minimumStock),
                cost: Number(newItem.cost),
                createdAt: new Date(),
                updatedAt: new Date()
            });
            
            const newInventoryItem = {
                id: docRef.id,
                ...newItem,
                quantity: Number(newItem.quantity),
                minimumStock: Number(newItem.minimumStock),
                cost: Number(newItem.cost),
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            setInventoryItems(prev => [...prev, newInventoryItem]);
            setNewItem({
                name: '',
                category: '',
                quantity: 0,
                minimumStock: 0,
                unit: 'pieces',
                cost: 0
            });
            setShowAddModal(false);
        } catch (error) {
            console.error("Error adding inventory item:", error);
            alert('Error adding inventory item');
        }
    };

    const handleDeleteItem = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteDoc(doc(db, 'inventory', itemId));
                setInventoryItems(prev => prev.filter(item => item.id !== itemId));
            } catch (error) {
                console.error("Error deleting inventory item:", error);
                alert('Error deleting inventory item');
            }
        }
    };

    const getStockStatus = (item) => {
        if (item.quantity === 0) return 'out-of-stock';
        if (item.quantity <= item.minimumStock) return 'low-stock';
        return 'in-stock';
    };

    const getStockColor = (status) => {
        switch (status) {
            case 'out-of-stock': return 'bg-red-100 text-red-800';
            case 'low-stock': return 'bg-yellow-100 text-yellow-800';
            case 'in-stock': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredItems = inventoryItems.filter(item => {
        const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.category?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const stockStatus = getStockStatus(item);
        const matchesFilter = filter === 'all' || 
                            (filter === 'low-stock' && stockStatus === 'low-stock') ||
                            (filter === 'out-of-stock' && stockStatus === 'out-of-stock');
        
        return matchesSearch && matchesFilter;
    });

    const getInventoryStats = () => {
        const totalItems = inventoryItems.length;
        const lowStock = inventoryItems.filter(item => getStockStatus(item) === 'low-stock').length;
        const outOfStock = inventoryItems.filter(item => getStockStatus(item) === 'out-of-stock').length;
        const totalValue = inventoryItems.reduce((sum, item) => sum + (item.quantity * (item.cost || 0)), 0);
        
        return { totalItems, lowStock, outOfStock, totalValue };
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const stats = getInventoryStats();

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        Add Item
                    </button>
                </div>
                
                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-blue-900">Total Items</h3>
                        <p className="text-2xl font-bold text-blue-600">{stats.totalItems}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-yellow-900">Low Stock</h3>
                        <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-red-900">Out of Stock</h3>
                        <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="text-sm font-medium text-green-900">Total Value</h3>
                        <p className="text-2xl font-bold text-green-600">${stats.totalValue.toFixed(2)}</p>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                        <input 
                            type="text" 
                            placeholder="Search items..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Items</option>
                            <option value="low-stock">Low Stock</option>
                            <option value="out-of-stock">Out of Stock</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Item
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quantity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Min Stock
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Unit Cost
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredItems.map(item => {
                                const stockStatus = getStockStatus(item);
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                            <div className="text-sm text-gray-500">{item.unit}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.category || 'Uncategorized'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleUpdate(item.id, 'quantity', e.target.value)}
                                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                                                min="0"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="number"
                                                value={item.minimumStock}
                                                onChange={(e) => handleUpdate(item.id, 'minimumStock', e.target.value)}
                                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                                                min="0"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStockColor(stockStatus)}`}>
                                                {stockStatus === 'out-of-stock' ? 'Out of Stock' :
                                                 stockStatus === 'low-stock' ? 'Low Stock' : 'In Stock'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="number"
                                                value={item.cost || 0}
                                                onChange={(e) => handleUpdate(item.id, 'cost', e.target.value)}
                                                className="w-20 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                                                min="0"
                                                step="0.01"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="text-red-600 hover:text-red-900 transition duration-200"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <div className="mb-2">📦</div>
                        <p>No inventory items found.</p>
                    </div>
                )}
            </div>

            {/* Add Item Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                        <h2 className="text-xl font-bold mb-4">Add New Item</h2>
                        <form onSubmit={handleAddItem}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Item Name</label>
                                <input
                                    type="text"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <input
                                    type="text"
                                    value={newItem.category}
                                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Quantity</label>
                                    <input
                                        type="number"
                                        value={newItem.quantity}
                                        onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        min="0"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Min Stock</label>
                                    <input
                                        type="number"
                                        value={newItem.minimumStock}
                                        onChange={(e) => setNewItem({...newItem, minimumStock: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        min="0"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Unit</label>
                                    <select
                                        value={newItem.unit}
                                        onChange={(e) => setNewItem({...newItem, unit: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="pieces">Pieces</option>
                                        <option value="kg">Kilograms</option>
                                        <option value="liters">Liters</option>
                                        <option value="bottles">Bottles</option>
                                        <option value="boxes">Boxes</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Unit Cost ($)</label>
                                    <input
                                        type="number"
                                        value={newItem.cost}
                                        onChange={(e) => setNewItem({...newItem, cost: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Add Item
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;