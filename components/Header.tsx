

import React from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution errors.
import * as ReactRouterDom from "react-router-dom";
import { useWebsiteDetails } from '../hooks/useWebsiteDetails';
import { useAuth } from '../contexts/AuthContext';
import { LoginIcon } from './IconComponents';

interface HeaderProps {
    sticky?: boolean;
}

const Header: React.FC<HeaderProps> = ({ sticky }) => {
    const { details } = useWebsiteDetails();
    const { currentUser, logout } = useAuth();
    const navigate = ReactRouterDom.useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Guard against null details during initial load by showing a skeleton
    if (!details) {
        return (
             <header className={`py-6 px-4 md:px-8 z-20 ${sticky ? 'sticky top-0 bg-[var(--background-color)]/50 backdrop-blur-sm border-b border-[var(--border-color)]' : 'absolute top-0 left-0 right-0'}`}>
                <div className="container mx-auto flex justify-between items-center animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700"></div>
                        <div className="w-32 h-6 bg-gray-700 rounded"></div>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="w-28 h-10 bg-gray-700 rounded-lg"></div>
                       <div className="w-6 h-6 bg-gray-700 rounded"></div>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className={`py-6 px-4 md:px-8 z-20 ${sticky ? 'sticky top-0 bg-[var(--background-color)]/50 backdrop-blur-sm border-b border-[var(--border-color)]' : 'absolute top-0 left-0 right-0'}`}>
            <div className="container mx-auto flex justify-between items-center">
                <ReactRouterDom.Link to="/" className="flex items-center gap-3 text-3xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg">
                    {details.logoUrl && <img src={details.logoUrl} alt="logo" className="w-10 h-10 rounded-full" />}
                     <span>
                        <span className="text-orange-500 text-glow">{details.companyName.split(' ')[0]}</span>
                        {details.companyName.split(' ').slice(1).join(' ')}
                    </span>
                </ReactRouterDom.Link>
                <div className="flex items-center gap-4">
                    {currentUser ? (
                        <>
                            <ReactRouterDom.Link to="/dashboard" className="font-bold text-[var(--text-color)] hover:text-orange-400 transition-colors">Dashboard</ReactRouterDom.Link>
                            <button onClick={handleLogout} className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">Logout</button>
                        </>
                    ) : (
                        <ReactRouterDom.Link to="/about" className="bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-colors">About Us</ReactRouterDom.Link>
                    )}
                     <button
                        onClick={() => navigate('/admin')}
                        className="text-gray-600 hover:text-orange-500 transition-colors"
                        aria-label="Admin Login"
                    >
                        <LoginIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;