import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';
import Footer from './Footer';
import Header from './Header';
import { ArrowLeftIcon } from './IconComponents';

type AuthMode = 'login' | 'signup';

const ClientAuthPage: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const response = mode === 'login' 
            ? await login(email, password)
            : await signup(name, email, password);

        if (response.success) {
            navigate('/dashboard');
        } else {
            setError(response.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] flex flex-col">
            <div className="flex-grow relative">
                <Header />
                <div className="flex items-center justify-center pt-32 pb-16 h-full">
                    <div className="w-full max-w-md mx-4">
                        <div className="bg-[var(--card-color)]/50 backdrop-blur-sm border border-[var(--border-color)] rounded-xl p-8">
                            <div className="flex mb-6 border-b border-[var(--border-color)]">
                                <button onClick={() => setMode('login')} className={`flex-1 py-2 font-bold text-center ${mode === 'login' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400'}`}>Login</button>
                                <button onClick={() => setMode('signup')} className={`flex-1 py-2 font-bold text-center ${mode === 'signup' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400'}`}>Sign Up</button>
                            </div>
                            <h2 className="text-3xl font-bold text-center mb-6">{mode === 'login' ? 'Welcome Back' : 'Create Your Account'}</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {mode === 'signup' && (
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        required
                                        className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                    />
                                )}
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                />
                                {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                                <button type="submit" disabled={loading} className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg transition-colors hover:bg-orange-600 disabled:bg-gray-500 flex items-center justify-center gap-2">
                                    {loading ? <LoadingSpinner size={6}/> : (mode === 'login' ? 'Login' : 'Sign Up')}
                                </button>
                            </form>
                        </div>
                        <div className="text-center mt-6">
                            <button 
                                type="button" 
                                onClick={() => navigate('/')} 
                                className="text-gray-400 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                                Back to Homepage
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ClientAuthPage;