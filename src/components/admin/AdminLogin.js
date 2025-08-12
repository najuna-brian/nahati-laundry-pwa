import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../services/auth';

const AdminLogin = () => {
    const [email, setEmail] = useState('nahatico.ltd@gmail.com');
    const [password, setPassword] = useState('Nahati2025!');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { loginWithRole } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await loginWithRole(email, password, 'admin');
            navigate('/admin/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fillDefaultCredentials = () => {
        setEmail('nahatico.ltd@gmail.com');
        setPassword('Nahati2025!');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">🔧</span>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Nahati Admin Login
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        System Administrator Access
                    </p>
                </div>
                
                {/* Default Credentials Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">🔑 Default Admin Credentials</h3>
                    <p className="text-xs text-blue-700 mb-2">
                        <strong>Email:</strong> nahatico.ltd@gmail.com<br/>
                        <strong>Password:</strong> Nahati2025!
                    </p>
                    <button
                        type="button"
                        onClick={fillDefaultCredentials}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                        Use Default Credentials
                    </button>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="text-sm text-red-800 mb-2">{error}</div>
                        {error.includes('user-not-found') || error.includes('wrong-password') || error.includes('invalid-credential') ? (
                            <p className="text-xs text-red-600">
                                Need to create admin account? 
                                <a href="/admin/setup" className="ml-1 underline hover:text-red-800">
                                    Setup Admin Account
                                </a>
                            </p>
                        ) : null}
                    </div>
                )}
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Email address"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>
                </form>
                
                <div className="text-center">
                    <p className="text-xs text-gray-500">
                        First time setup? 
                        <a href="/admin/setup" className="ml-1 text-blue-600 hover:text-blue-500 underline">
                            Create Admin Account
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;