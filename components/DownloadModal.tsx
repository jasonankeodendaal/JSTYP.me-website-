import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePinRecords } from '../hooks/usePinRecords';
import { useAuth } from '../contexts/AuthContext';
import { AndroidIcon, AppleIcon, GlobeIcon } from './IconComponents';
import type { AppShowcaseItem } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface DownloadModalProps {
    isOpen: boolean;
    onClose: () => void;
    app: AppShowcaseItem;
}

const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, app }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const { verifyAndRedeemPin } = usePinRecords();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleVerify = async () => {
        setError('');
        const trimmedPin = pin.trim();
        if (!trimmedPin) {
            setError('Please enter a PIN code.');
            return;
        }
        setIsLoading(true);

        // Universal dev pin check
        if (trimmedPin === '1723') {
            setIsVerified(true);
            setIsLoading(false);
            return;
        }

        // Master/dev pin check (doesn't require login and doesn't link to an account)
        if (app.pinCode && trimmedPin === app.pinCode) {
            setIsVerified(true);
            setIsLoading(false);
            return;
        }
        
        // This is a safeguard; the UI should prevent this state by requiring login first.
        if (!currentUser) {
            setError("You must be logged in to redeem a client PIN.");
            setIsLoading(false);
            return;
        }

        const client = { id: currentUser.id, name: currentUser.name };
        const result = await verifyAndRedeemPin(trimmedPin, app.id, client);

        if (result.success) {
            setIsVerified(true);
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    };

    const handleClose = () => {
        // Reset state on close
        setPin('');
        setError('');
        setIsLoading(false);
        setIsVerified(false);
        onClose();
    };

    const handleNavigateToAuth = () => {
        onClose(); // Close modal before navigating
        navigate('/auth');
    };

    if (!isOpen) return null;

    const renderContent = () => {
        if (!currentUser) {
            return (
                <>
                    <h2 id="modal-title" className="text-2xl font-bold text-[var(--text-color)] mb-2">Authentication Required</h2>
                    <p className="text-gray-400 mb-6">Please log in or create an account to redeem your PIN and link the app to your personal dashboard.</p>
                    <button onClick={handleNavigateToAuth} className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg transition-colors hover:bg-orange-600">
                        Login / Sign Up
                    </button>
                </>
            );
        }

        // This block correctly displays the download links after 'isVerified' is set to true.
        // It works for both a logged-in user who redeems a client PIN and for any user 
        // who enters the correct master/dev pin.
        if (isVerified) {
            return (
                <>
                    <h2 id="modal-title" className="text-2xl font-bold text-[var(--text-color)] mb-2">Download {app.name}</h2>
                    <div className="space-y-4 mt-6">
                        <p className="text-green-400 font-semibold">PIN verified! You can now download the app.</p>
                        {app.apkUrl && (
                            <a href={app.apkUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-3 bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:bg-green-700">
                                <AndroidIcon className="w-6 h-6" /> Download for Android (.apk)
                            </a>
                        )}
                        {app.iosUrl && (
                             <a href={app.iosUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-3 bg-gray-300 text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:bg-white">
                                <AppleIcon className="w-6 h-6" /> Get it on the App Store
                            </a>
                        )}
                        {app.pwaUrl && (
                             <a href={app.pwaUrl} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-3 bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:bg-blue-600">
                                <GlobeIcon className="w-6 h-6" /> Launch Web App (PWA)
                            </a>
                        )}
                    </div>
                </>
            );
        }

        return (
            <>
                <h2 id="modal-title" className="text-2xl font-bold text-[var(--text-color)] mb-2">Enter PIN to Download</h2>
                <p className="text-gray-400 mb-6">Welcome, <span className="font-bold text-orange-400">{currentUser.name}</span>! Enter the one-time PIN you received to continue.</p>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={pin}
                        onChange={e => setPin(e.target.value.toUpperCase())}
                        placeholder="XXXXXX"
                        className="flex-grow bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none font-mono text-lg tracking-widest text-center"
                        aria-label="PIN Code"
                    />
                    <button onClick={handleVerify} disabled={isLoading} className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg transition-colors hover:bg-orange-600 disabled:bg-gray-500 flex items-center justify-center">
                        {isLoading ? <LoadingSpinner size={6} /> : "Verify"}
                    </button>
                </div>
                {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
            </>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 backdrop-blur-sm" onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="bg-[var(--card-color)] rounded-xl border border-[var(--border-color)] p-8 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                {renderContent()}
                 <div className="flex justify-end mt-6">
                    <button onClick={handleClose} className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DownloadModal;