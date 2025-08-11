import React, { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../../services/firestore';
import { useAuth } from '../../services/auth';
import './Profile.css';

const Profile = () => {
    const { user } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user) {
                const profile = await getUserProfile(user.uid);
                setName(profile.name);
                setEmail(profile.email);
                setPhone(profile.phone);
                setAddresses(profile.addresses || []);
                setLoading(false);
            }
        };
        fetchUserProfile();
    }, [user]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        await updateUserProfile(user.uid, { name, email, phone, addresses });
        alert('Profile updated successfully!');
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="profile-container">
            <h2>Edit Profile</h2>
            <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Phone:</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Addresses:</label>
                    <textarea
                        value={addresses.join('\n')}
                        onChange={(e) => setAddresses(e.target.value.split('\n'))}
                        placeholder="Enter one address per line"
                    />
                </div>
                <button type="submit">Update Profile</button>
            </form>
        </div>
    );
};

export default Profile;