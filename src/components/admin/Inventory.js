import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

const Inventory = () => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventory = async () => {
            const inventoryCollection = collection(db, 'inventory');
            const inventorySnapshot = await getDocs(inventoryCollection);
            const inventoryList = inventorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setInventoryItems(inventoryList);
            setLoading(false);
        };

        fetchInventory();
    }, []);

    const handleUpdate = async (itemId, updatedQuantity) => {
        const itemRef = doc(db, 'inventory', itemId);
        await updateDoc(itemRef, { quantity: updatedQuantity });
        setInventoryItems(prevItems => 
            prevItems.map(item => item.id === itemId ? { ...item, quantity: updatedQuantity } : item)
        );
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Inventory Management</h1>
            <table>
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {inventoryItems.map(item => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>
                                <input 
                                    type="number" 
                                    value={item.quantity} 
                                    onChange={(e) => handleUpdate(item.id, e.target.value)} 
                                />
                            </td>
                            <td>
                                <button onClick={() => handleUpdate(item.id, item.quantity)}>Update</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Inventory;