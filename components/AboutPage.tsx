

import React from 'react';
import { useWebsiteDetails } from '../hooks/useWebsiteDetails';
import Header from './Header';
import Footer from './Footer';
import LoadingSpinner from './LoadingSpinner';
import type { AboutPageSection } from '../types';
// FIX: Changed single quotes to double quotes for the import path to potentially resolve module resolution issues.
import { Link } from "react-router-dom";
import { ArrowLeftIcon } from './IconComponents';

const AboutPage: React.FC = () => {
    const { details, loading } = useWebsiteDetails();

    if (loading) {
        return <div className="min-h-screen bg-[var(--background-color)] flex items-center justify-center"><LoadingSpinner size={16} /></div>;
    }

    const content = details?.aboutPageContent;

    const Section: React.FC<{ section: AboutPageSection, imageOnLeft?: boolean }> = ({ section, imageOnLeft = false }) => (
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${imageOnLeft ? 'md:grid-flow-row-dense' : ''}`}>
            <div className={` ${imageOnLeft ? 'md:col-start-2' : ''}`}>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-orange-500 text-glow">{section.heading}</h2>
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{section.content}</p>
            </div>
            <div className={` ${imageOnLeft ? 'md:col-start-1' : ''}`}>
                {section.imageUrl ? (
                    <img src={section.imageUrl} alt={section.heading} className="rounded-xl object-cover w-full h-80 glow-effect" style={{'--glow-color': 'rgba(255,255,255,0.1)'} as React.CSSProperties}/>
                ) : (
                    <div className="rounded-xl bg-gray-800 w-full h-80 flex items-center justify-center text-gray-500">
                        Illustration coming soon
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-[var(--background-color)] text-[var(--text-color)] min-h-screen">
            <Header sticky />
            <main className="container mx-auto py-24 px-4">
                <Link 
                    to="/" 
                    className="mb-12 inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors font-semibold"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back to Homepage
                </Link>
                {content ? (
                    <div className="space-y-24">
                        <div className="text-center max-w-4xl mx-auto">
                            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-futuristic-glow">{content.pageTitle}</h1>
                            <p className="text-lg md:text-xl text-gray-300">{content.introduction.content}</p>
                            {content.introduction.imageUrl && (
                                 <img src={content.introduction.imageUrl} alt={content.introduction.heading} className="rounded-xl object-cover w-full h-96 mt-12 glow-effect" style={{'--glow-color': 'rgba(255,255,255,0.1)'} as React.CSSProperties}/>
                            )}
                        </div>
                        
                        {content.sections.map((section, index) => (
                            <Section key={index} section={section} imageOnLeft={index % 2 !== 0} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <h1 className="text-5xl font-bold mb-4">About Us</h1>
                        <p className="text-gray-400">Content for this page is being crafted. Please check back soon!</p>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default AboutPage;