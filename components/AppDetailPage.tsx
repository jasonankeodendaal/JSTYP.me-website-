import React, { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApps } from '../hooks/useApps';
import { useWebsiteDetails } from '../hooks/useWebsiteDetails';
import { useAuth } from '../contexts/AuthContext';
import { usePinRecords } from '../hooks/usePinRecords';
import LoadingSpinner from './LoadingSpinner';
import DownloadModal from './DownloadModal';
import Header from './Header';
import ScreenshotCarousel from './ScreenshotCarousel';
import TermsModal from './TermsModal';
import StarRating from './StarRating';
import { DownloadIcon, ArrowLeftIcon, WhatsAppIcon } from './IconComponents';

const AppDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { apps, loading: appsLoading, addRating } = useApps();
    const { details, loading: detailsLoading } = useWebsiteDetails();
    const { records: pinRecords, loading: pinsLoading } = usePinRecords();
    const { currentUser } = useAuth();
    
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
    const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

    const app = apps?.find(a => a.id === id);

    const { averageRating, totalRatings, userHasPurchased, currentUserRating } = useMemo(() => {
        if (!app || !pinRecords) return { averageRating: 0, totalRatings: 0, userHasPurchased: false, currentUserRating: 0 };
        
        const total = app.ratings.reduce((sum, r) => sum + r.rating, 0);
        const avg = app.ratings.length > 0 ? total / app.ratings.length : 0;
        
        const hasPurchased = currentUser ? pinRecords.some(p => p.clientId === currentUser.id && p.appId === app.id && p.isRedeemed) : false;
        
        const userRatingObj = currentUser ? app.ratings.find(r => r.clientId === currentUser.id) : undefined;

        return {
            averageRating: avg,
            totalRatings: app.ratings.length,
            userHasPurchased: hasPurchased,
            currentUserRating: userRatingObj ? userRatingObj.rating : 0,
        };
    }, [app, currentUser, pinRecords]);


    const handleRatingSubmit = (rating: number) => {
        if (app && currentUser) {
            addRating(app.id, currentUser.id, rating);
        }
    };

    const loading = appsLoading || detailsLoading || pinsLoading;

    if (loading) {
        return <div className="min-h-screen bg-[var(--background-color)] flex items-center justify-center"><LoadingSpinner size={16} /></div>;
    }

    if (!app) {
        return (
            <div className="min-h-screen bg-[var(--background-color)] flex flex-col items-center justify-center text-center p-4">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center">
                    <h2 className="text-4xl font-bold text-red-500 mb-4">App Not Found</h2>
                    <p className="text-gray-300 mb-8">We couldn't find the app you're looking for.</p>
                    <Link to="/" className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors">
                        Go Back Home
                    </Link>
                </div>
            </div>
        );
    }
    
    const phoneNumber = '27695989427';
    const message = `Hi, I'm interested in purchasing the "${app.name}" app.\n\nPrice: ${app.price}\n\nPlease let me know the next steps for payment and receiving my PIN.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;


    return (
        <div className="bg-[var(--background-color)] text-[var(--text-color)] min-h-screen">
            <Header sticky />
            <main>
                <section className="relative h-[50vh] min-h-[300px] max-h-[500px]">
                    <img src={app.heroImageUrl} alt={`${app.name} hero`} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60"></div>
                    <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white text-glow" style={{'--glow-color': '#fff'} as React.CSSProperties}>{app.name}</h1>
                        <p className="text-xl md:text-2xl text-orange-400 font-semibold mt-2">{app.description}</p>
                    </div>
                </section>
                <section className="py-16 px-4 md:px-8">
                    <div className="container mx-auto">
                        <button 
                            onClick={() => navigate(-1)}
                            className="mb-8 flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors font-semibold"
                        >
                            <ArrowLeftIcon className="w-5 h-5" />
                            Back to All Apps
                        </button>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 space-y-12">
                                <div>
                                    <h2 className="text-3xl font-bold mb-6">About the App</h2>
                                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{app.longDescription}</p>
                                </div>
                                
                                {app.screenshots && app.screenshots.length > 0 && (
                                    <div>
                                        <h2 className="text-3xl font-bold mb-6">Screenshots</h2>
                                        <ScreenshotCarousel images={app.screenshots} />
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {app.features && app.features.length > 0 && (
                                        <div>
                                            <h3 className="text-2xl font-bold mb-4">Features</h3>
                                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                                                {app.features.map((item, index) => <li key={index}>{item}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                    {app.abilities && app.abilities.length > 0 && (
                                        <div>
                                            <h3 className="text-2xl font-bold mb-4">Abilities</h3>
                                            <ul className="list-disc list-inside space-y-2 text-gray-300">
                                                {app.abilities.map((item, index) => <li key={index}>{item}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                
                                {app.whyItWorks && (
                                    <div>
                                        <h2 className="text-3xl font-bold mb-6">Why It Will Work For You</h2>
                                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{app.whyItWorks}</p>
                                    </div>
                                )}

                                {app.dedicatedPurpose && (
                                    <div>
                                        <h2 className="text-3xl font-bold mb-6">Dedicated Purpose</h2>
                                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{app.dedicatedPurpose}</p>
                                    </div>
                                )}
                                
                                {userHasPurchased && (
                                    <div className="bg-[var(--card-color)] border border-orange-500 rounded-xl p-6">
                                        <h3 className="text-2xl font-bold text-orange-400 mb-4">Rate this App</h3>
                                        <p className="text-gray-400 mb-4">You've purchased this app. Let others know what you think!</p>
                                        <StarRating value={currentUserRating} onChange={handleRatingSubmit} interactive />
                                    </div>
                                )}

                                {details && (
                                    <div className="mt-12 bg-green-900/30 border border-green-700 rounded-xl p-6">
                                        <h3 className="text-2xl font-bold text-green-400 mb-4">How to Purchase & Download</h3>
                                        <ol className="list-decimal list-inside space-y-3 text-green-200 font-semibold">
                                            <li>
                                                Contact us via <a href={details.whatsapp} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">WhatsApp</a> to process the payment for the app.
                                            </li>
                                            <li>Once payment is confirmed, you will receive a unique one-time PIN code.</li>
                                            <li>
                                                Click the "Download Now" button on this page and enter your PIN to get access to the download links.
                                            </li>
                                        </ol>
                                    </div>
                                )}
                            </div>
                            <div className="lg:col-span-1">
                                <div className="bg-[var(--card-color)]/50 border border-[var(--border-color)] rounded-xl p-6 sticky top-28 space-y-6">
                                    <img src={app.imageUrl} alt={`${app.name} logo`} className="w-24 h-24 rounded-2xl mx-auto border-2 border-gray-700"/>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold">{app.name}</h3>
                                        <div className="mt-2">
                                            <StarRating rating={averageRating} count={totalRatings} />
                                        </div>
                                    </div>

                                    {app.price && <p className="text-3xl font-bold text-orange-500 text-center text-glow">{app.price}</p>}
                                    <button
                                        onClick={() => setIsDownloadModalOpen(true)}
                                        className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/50"
                                    >
                                        <DownloadIcon className="w-6 h-6" />
                                        Download Now
                                    </button>
                                     <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 hover:bg-green-600"
                                    >
                                        <WhatsAppIcon className="w-6 h-6" />
                                        Contact via WhatsApp
                                    </a>
                                    <button
                                        onClick={() => setIsTermsModalOpen(true)}
                                        className="w-full text-center text-gray-400 hover:text-white text-sm"
                                    >
                                        View Terms & Conditions
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <DownloadModal isOpen={isDownloadModalOpen} onClose={() => setIsDownloadModalOpen(false)} app={app} />
            <TermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} terms={app.termsAndConditions} appName={app.name} />
        </div>
    );
};

export default AppDetailPage;