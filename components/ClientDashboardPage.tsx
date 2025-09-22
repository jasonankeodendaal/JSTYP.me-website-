import React, { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePinRecords } from '../hooks/usePinRecords';
import { useApps } from '../hooks/useApps';
import { useRedownloadRequests } from '../hooks/useRedownloadRequests';
import Header from './Header';
import Footer from './Footer';
import LoadingSpinner from './LoadingSpinner';
import { DownloadIcon, ArrowLeftIcon } from './IconComponents';
import { Link } from "react-router-dom";

const ClientDashboardPage: React.FC = () => {
    const { currentUser } = useAuth();
    const { records, loading: pinsLoading } = usePinRecords();
    const { apps, loading: appsLoading } = useApps();
    const { requests, addRequest, loading: requestsLoading } = useRedownloadRequests();
    
    const purchasedApps = useMemo(() => {
        if (!currentUser || !records || !apps) return [];
        const redeemedPins = records.filter(r => r.clientId === currentUser.id && r.isRedeemed);
        
        const appMap = new Map();
        redeemedPins.forEach(pin => {
            const app = apps.find(a => a.id === pin.appId);
            if (app && !appMap.has(app.id)) {
                appMap.set(app.id, app);
            }
        });
        return Array.from(appMap.values());
    }, [currentUser, records, apps]);
    
    const handleRedownloadRequest = (appId: string, appName: string) => {
        if (currentUser) {
            addRequest({
                clientId: currentUser.id,
                clientName: currentUser.name,
                appId,
                appName,
            });
        }
    };

    const loading = pinsLoading || appsLoading || requestsLoading;

    if (!currentUser) {
        return null; // Should be handled by ProtectedRoute
    }

    return (
        <div className="min-h-screen bg-[var(--background-color)] text-[var(--text-color)] flex flex-col">
            <div className="flex-grow relative">
                <Header />
                <main className="px-4 md:px-8 pt-32 pb-16">
                    <div className="container mx-auto">
                        <div className="flex justify-between items-start mb-10">
                            <div>
                                <h1 className="text-4xl font-bold text-[var(--text-color)] mb-2">Welcome, <span className="text-orange-500 text-glow">{currentUser.name}</span>!</h1>
                                <p className="text-gray-400">This is your personal dashboard. View your purchased apps and manage your account.</p>
                            </div>
                            <Link to="/" className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 flex-shrink-0">
                                <ArrowLeftIcon className="w-5 h-5" />
                                Back to Site
                            </Link>
                        </div>

                        <h2 className="text-3xl font-bold mb-6">My Apps</h2>
                        {loading ? (
                            <div className="flex justify-center"><LoadingSpinner /></div>
                        ) : purchasedApps.length > 0 ? (
                            <div className="space-y-6">
                                {purchasedApps.map(app => {
                                    const relevantRequest = requests?.find(r => r.clientId === currentUser.id && r.appId === app.id);
                                    return (
                                    <div key={app.id} className="bg-[var(--card-color)]/50 border border-[var(--border-color)] rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
                                        <img src={app.imageUrl} alt={app.name} className="w-24 h-24 rounded-lg object-cover"/>
                                        <div className="flex-grow text-center md:text-left">
                                            <h3 className="text-2xl font-bold">{app.name}</h3>
                                            <p className="text-gray-400">{app.description}</p>
                                            
                                            {relevantRequest && (
                                                <div className={`mt-3 text-sm p-2 rounded-lg border ${
                                                    relevantRequest.status === 'pending' ? 'bg-yellow-900/50 border-yellow-700 text-yellow-300' :
                                                    relevantRequest.status === 'approved' ? 'bg-green-900/50 border-green-700 text-green-300' :
                                                    'bg-red-900/50 border-red-700 text-red-300'
                                                }`}>
                                                    <span className="font-bold">Request Status: {relevantRequest.status.toUpperCase()}</span>
                                                    {relevantRequest.resolutionNotes && <p className="mt-1">Notes: {relevantRequest.resolutionNotes}</p>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-shrink-0">
                                            {!relevantRequest || relevantRequest.status === 'denied' ? (
                                                <button onClick={() => handleRedownloadRequest(app.id, app.name)} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                                                    <DownloadIcon className="w-5 h-5"/> Request Re-download
                                                </button>
                                            ) : relevantRequest.status === 'pending' ? (
                                                <p className="font-bold text-yellow-400">Request Pending...</p>
                                            ) : (
                                                <button className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">Download Approved</button>
                                            )}
                                        </div>
                                    </div>
                                )})}
                            </div>
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-[var(--border-color)] rounded-xl">
                                <p className="text-gray-400">You haven't purchased any apps yet.</p>
                                <Link to="/" className="mt-4 inline-block text-orange-500 font-bold hover:underline">Explore Apps</Link>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default ClientDashboardPage;