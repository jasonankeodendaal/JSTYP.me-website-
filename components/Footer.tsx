import React from 'react';
import { Link } from 'react-router-dom';
import { useWebsiteDetails } from '../hooks/useWebsiteDetails';
import { PhoneIcon, EnvelopeIcon, MapPinIcon, WhatsAppIcon } from './IconComponents';

const Footer: React.FC = () => {
    const { details, loading } = useWebsiteDetails();

    if (loading || !details) {
        return null;
    }

    const handleAppsLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (window.location.pathname === '/') {
            e.preventDefault();
            const appsSection = document.getElementById('apps');
            if (appsSection) {
                appsSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <footer className="bg-[var(--background-color)]/80 backdrop-blur-sm border-t border-[var(--border-color)] text-gray-300">
            <div className="container mx-auto py-12 px-4 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                    {/* Column 1: Branding */}
                    <div>
                        <Link to="/" className="flex items-center justify-center md:justify-start gap-3 text-2xl font-bold mb-4">
                            {details.logoUrl && <img src={details.logoUrl} alt="logo" className="w-10 h-10 rounded-full" />}
                            <span>
                                <span className="text-orange-500 text-glow">{details.companyName.split(' ')[0]}</span>
                                {details.companyName.split(' ').slice(1).join(' ')}
                            </span>
                        </Link>
                        <p className="text-gray-400">The Future, Delivered.</p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="hover:text-orange-500 transition-colors">Home</Link></li>
                            <li><Link to="/about" className="hover:text-orange-500 transition-colors">About Us</Link></li>
                            <li><a href="/#apps" onClick={handleAppsLinkClick} className="hover:text-orange-500 transition-colors">Our Apps</a></li>
                            <li><Link to="/dashboard" className="hover:text-orange-500 transition-colors">Client Dashboard</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            {details.tel && (
                                <li className="flex items-center justify-center md:justify-start gap-3">
                                    <PhoneIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                    <a href={`tel:${details.tel}`} className="hover:text-orange-500 transition-colors">{details.tel}</a>
                                </li>
                            )}
                            {details.email && (
                                <li className="flex items-center justify-center md:justify-start gap-3">
                                    <EnvelopeIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                    <a href={`mailto:${details.email}`} className="hover:text-orange-500 transition-colors break-all">{details.email}</a>
                                </li>
                            )}
                             {details.whatsapp && (
                                <li className="flex items-center justify-center md:justify-start gap-3">
                                    <WhatsAppIcon className="w-5 h-5 text-orange-500 flex-shrink-0" />
                                    <a href={details.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-orange-500 transition-colors">Chat on WhatsApp</a>
                                </li>
                            )}
                            {details.address && (
                                <li className="flex items-start justify-center md:justify-start gap-3">
                                    <MapPinIcon className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                                    <span>{details.address}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-[var(--border-color)] text-center text-gray-400">
                    <p>&copy; {new Date().getFullYear()} {details.companyName}. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;