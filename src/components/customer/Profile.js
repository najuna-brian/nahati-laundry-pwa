import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../../services/firestore';
import { useAuth } from '../../services/auth';

const Profile = () => {
    const { currentUser } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (currentUser) {
                try {
                    console.log('Fetching profile for user:', currentUser.uid);
                    const profile = await getUserProfile(currentUser.uid);
                    console.log('Profile data:', profile);
                    
                    setName(profile?.name || currentUser.displayName || '');
                    setEmail(profile?.email || currentUser.email || '');
                    setPhone(profile?.phone || '');
                    setAddresses(profile?.addresses || []);
                } catch (error) {
                    console.error('Error fetching profile:', error);
                    setError('Failed to load profile data');
                    // Use Firebase Auth data as fallback
                    setName(currentUser.displayName || '');
                    setEmail(currentUser.email || '');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchUserProfile();
    }, [currentUser]);

    const handleSave = async () => {
        if (!currentUser) return;
        
        try {
            setLoading(true);
            setError('');
            const profileData = { name, email, phone, addresses };
            await updateUserProfile(currentUser.uid, profileData);
            setSuccess('Profile updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!currentUser) {
        return (
            <div className="profile-container">
                <div className="text-center py-8">
                    <p>Please log in to view your profile.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="profile-container">
                <div className="text-center py-8">
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-container max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">My Profile</h2>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}

            <div className="profile-form space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your email"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your phone number"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Addresses</label>
                    {addresses.length > 0 ? (
                        <div className="space-y-2">
                            {addresses.map((address, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-md">
                                    <div className="font-medium">{address.type || 'Address'}</div>
                                    <div className="text-sm text-gray-600">{address.street}</div>
                                    <div className="text-sm text-gray-600">{address.city}, {address.state} {address.zipCode}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No addresses saved</p>
                    )}
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`w-full py-2 px-4 rounded-md font-medium ${
                        loading 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    } text-white transition duration-200`}
                >
                    {loading ? 'Saving...' : 'Save Profile'}
                </button>
            </div>
        </div>
    );
};

export default Profile;