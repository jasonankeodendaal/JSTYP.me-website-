import React from 'react';
import { Link } from 'react-router-dom';
import { useWebsiteDetails } from '../hooks/useWebsiteDetails';
import { PhoneIcon, WhatsAppIcon, EnvelopeIcon, MapPinIcon } from './IconComponents';

const Footer: React.FC = () => {
    const { details, loading } = useWebsiteDetails();

    if (loading || !details) {
        // Render a skeleton or null while loading to prevent layout shifts
        return (
            <footer className="py-12 px-4 md:px-8 bg-black border-t border-gray-800">
                <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
                    <div className="space-y-4">
                        <div className="w-1/2 h-8 bg-gray-700 rounded"></div>
                        <div className="w-3/4 h-4 bg-gray-700 rounded"></div>
                    </div>
                    <div className="space-y-2">
                         <div className="w-1/3 h-6 bg-gray-700 rounded mb-4"></div>
                         <div className="w-full h-4 bg-gray-700 rounded"></div>
                         <div className="w-full h-4 bg-gray-700 rounded"></div>
                    </div>
                     <div className="space-y-2">
                         <div className="w-1/3 h-6 bg-gray-700 rounded mb-4"></div>
                         <div className="w-full h-4 bg-gray-700 rounded"></div>
                         <div className="w-full h-4 bg-gray-700 rounded"></div>
                    </div>
                </div>
            </footer>
        );
    }

    return (
        <footer className="bg-[var(--card-color)]/30 border-t border-[var(--border-color)] text-gray-400">
            <div className="container mx-auto py-12 px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    {/* Company Info */}
                    <div className="lg:col-span-2">
                         <Link to="/" className="flex items-center gap-3 text-3xl font-bold text-white mb-4">
                            {details.logoUrl && <img src={details.logoUrl} alt="logo" className="w-10 h-10 rounded-full" />}
                            <span>
                                <span className="text-orange-500 text-glow">{details.companyName.split(' ')[0]}</span>
                                {details.companyName.split(' ').slice(1).join(' ')}
                            </span>
                        </Link>
                        <p className="max-w-md">
                            Crafting innovative AI-powered applications to solve real-world problems and drive the future of technology.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-bold text-lg text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="hover:text-orange-500 transition-colors">Home</Link></li>
                            <li><Link to="/about" className="hover:text-orange-500 transition-colors">About Us</Link></li>
                            <li><Link to="/dashboard" className="hover:text-orange-500 transition-colors">Client Dashboard</Link></li>
                            <li><a href="/#apps" className="hover:text-orange-500 transition-colors">Our Apps</a></li>
                        </ul>
                    </div>
                    
                    {/* Contact Info */}
                    <div>
                        <h3 className="font-bold text-lg text-white mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            {details.tel && (
                                <li className="flex items-start gap-3">
                                    <PhoneIcon className="w-5 h-5 mt-1 text-orange-500 flex-shrink-0" />
                                    <span>{details.tel}</span>
                                </li>
                            )}
                             {details.whatsapp && (
                                <li className="flex items-start gap-3">
                                    <WhatsAppIcon className="w-5 h-5 mt-1 text-orange-500 flex-shrink-0" />
                                    <a href={details.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">Message on WhatsApp</a>
                                </li>
                            )}
                            {details.email && (
                                <li className="flex items-start gap-3">
                                    <EnvelopeIcon className="w-5 h-5 mt-1 text-orange-500 flex-shrink-0" />
                                    <span>{details.email}</span>
                                </li>
                            )}
                             {details.address && (
                                <li className="flex items-start gap-3">
                                    <MapPinIcon className="w-5 h-5 mt-1 text-orange-500 flex-shrink-0" />
                                    <span>{details.address}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-[var(--border-color)] pt-8 text-center">
                    <p>&copy; {new Date().getFullYear()} {details.companyName}. All Rights Reserved.</p>
                    <p className="text-sm mt-1">The Future, Delivered.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;