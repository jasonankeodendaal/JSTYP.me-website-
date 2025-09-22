import React from 'react';
import { Link } from "react-router-dom";
import { useApps } from '../hooks/useApps';
import { useWebsiteDetails } from '../hooks/useWebsiteDetails';
import { useAuth } from '../contexts/AuthContext';
import { useTeamMembers } from '../hooks/useTeamMembers';
import { useVideos } from '../hooks/useVideos';
import AppCard from './AppCard';
import VideoCard from './VideoCard';
import LoadingSpinner from './LoadingSpinner';
import AIAppAdvisor from './AIAppAdvisor';
import Header from './Header'; // Import the new shared Header
import Footer from './Footer'; // Import the new shared Footer
import ScrollingTextCarousel from './ScrollingTextCarousel';

const Hero: React.FC = () => {
    const { currentUser } = useAuth();
    const { teamMembers, loading: teamLoading } = useTeamMembers();

    const creator = teamMembers?.find(m => m.role === 'Lead Developer');
    
    return (
        <section className="flex flex-col items-center justify-center text-center bg-[var(--background-color)] relative overflow-hidden py-32 px-4">
            <div className="absolute inset-0 bg-grid-gray-900 [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500 rounded-full mix-blend-screen filter blur-3xl animate-blob"></div>
                <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>
            </div>
            <div className="z-10">
                 <div className="p-4">
                    <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
                        Jason's Solution To Your Problems.
                    </h2>
                    <p className="text-2xl md:text-4xl font-bold text-orange-500 text-glow">Yes Me!</p>
                    <p className="max-w-2xl mx-auto mt-6 text-lg text-gray-300">
                        Discover innovative applications crafted with passion and cutting-edge technology.
                        Your next favorite app is just a click away.
                    </p>
                    <div className="mt-10">
                        {currentUser ? (
                             <Link 
                                to="/dashboard"
                                className="bg-orange-500 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/50 transform hover:scale-105 inline-block"
                            >
                               Go to Your Dashboard
                            </Link>
                        ) : (
                            <Link 
                                to="/auth"
                                className="bg-orange-500 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-500/50 transform hover:scale-105 inline-block"
                            >
                                Login / Sign Up
                            </Link>
                        )}
                    </div>
                </div>

                {!teamLoading && creator && (
                    <div className="mt-12 max-w-xl mx-auto bg-[var(--card-color)]/30 backdrop-blur-sm p-4 rounded-2xl border border-[var(--border-color)]">
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 text-left">
                            <img 
                                src={creator.profileImageUrl} 
                                alt={`${creator.firstName} ${creator.lastName}`}
                                className="w-20 h-20 flex-shrink-0 rounded-full object-cover border-4 border-orange-500/50 glow-effect"
                            />
                            <div className="text-center sm:text-left">
                                <h3 className="text-xl font-bold text-[var(--text-color)]">{creator.firstName} {creator.lastName}</h3>
                                <p className="text-base text-orange-400 font-semibold">{creator.role}</p>
                                <p className="mt-1 text-sm text-gray-300 max-w-md">
                                    The mind behind the code. I turn complex problems into elegant, user-centric applications that empower and inspire.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

const AppShowcase: React.FC = () => {
    const { apps, loading } = useApps();

    return (
        <section id="apps" className="py-20 px-4 md:px-8 bg-[var(--background-color)] relative">
            <div className="container mx-auto">
                <h2 className="text-4xl font-bold text-center mb-12">
                    Explore Our <span className="text-orange-500 text-glow">Creations</span>
                </h2>
                {loading ? (
                    <div className="flex justify-center">
                        <LoadingSpinner size={12} />
                    </div>
                ) : !apps || apps.length === 0 ? (
                    <div className="text-center py-20">
                        <h3 
                            className="text-white text-6xl font-black uppercase tracking-widest animate-pulse font-mono"
                            style={{ textShadow: '0 0 5px #ef4444, 0 0 10px #ef4444, 0 0 20px #ef4444' }}
                        >
                            Coming Soon!!!
                        </h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {apps.filter(app => app && app.id && app.name && app.imageUrl).map(app => (
                            <Link to={`/app/${app.id}`} key={app.id} className="focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-xl" aria-label={`View details for ${app.name}`}>
                                <AppCard app={app} />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

const VideoShowcase: React.FC = () => {
    const { videos, loading } = useVideos();

    return (
        <section id="videos" className="py-20 px-4 md:px-8 bg-[var(--background-color)] relative">
            <div className="container mx-auto">
                <h2 className="text-4xl font-bold text-center mb-12">
                    AI Generated <span className="text-orange-500 text-glow">Videos</span>
                </h2>
                {loading ? (
                    <div className="flex justify-center">
                        <LoadingSpinner size={12} />
                    </div>
                ) : !videos || videos.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">
                        <p>No videos have been generated yet. Check back soon!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {videos.map(video => (
                           <VideoCard key={video.id} video={video} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};


const HomePage: React.FC = () => {
    return (
        <div className="bg-[var(--background-color)] min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
                <Hero />

                <div className="py-8">
                    <ScrollingTextCarousel />
                </div>

                <section className="px-4 md:px-8 bg-[var(--background-color)] relative">
                    <div className="container mx-auto max-w-4xl">
                        <AIAppAdvisor />
                    </div>
                </section>

                <div className="py-8">
                    <ScrollingTextCarousel />
                </div>
                
                <AppShowcase />

                <div className="py-8">
                    <ScrollingTextCarousel />
                </div>
                
                <VideoShowcase />

            </main>
            <Footer />
        </div>
    );
};

export default HomePage;