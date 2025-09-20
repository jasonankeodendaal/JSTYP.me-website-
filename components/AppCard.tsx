import React from 'react';
import type { AppShowcaseItem } from '../types';

interface AppCardProps {
    app: AppShowcaseItem;
}

const AppCard: React.FC<AppCardProps> = ({ app }) => {
    return (
        <div className="bg-[var(--card-color)]/50 backdrop-blur-sm border border-[var(--border-color)] rounded-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:border-orange-500 hover:glow-effect aspect-square flex flex-col group">
            <div className="w-full h-2/3 overflow-hidden">
                <img src={app.imageUrl} alt={app.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="p-3 sm:p-4 flex-grow flex flex-col justify-center text-center">
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-[var(--text-color)] truncate">{app.name}</h3>
                <p className="text-gray-400 text-xs md:text-sm mt-1 hidden sm:block">{app.description}</p>
            </div>
        </div>
    );
};

export default AppCard;