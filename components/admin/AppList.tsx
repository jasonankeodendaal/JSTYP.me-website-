import React from 'react';
import type { AppShowcaseItem } from '../../types';
import { PencilIcon, TrashIcon } from '../IconComponents';
import LoadingSpinner from '../LoadingSpinner';

interface AppListProps {
    apps: AppShowcaseItem[] | null;
    loading: boolean;
    onEdit: (app: AppShowcaseItem) => void;
    onDelete: (appId: string) => void;
}

const AppList: React.FC<AppListProps> = ({ apps, loading, onEdit, onDelete }) => {
    
    const handleDelete = (appId: string) => {
        if (window.confirm('Are you sure you want to delete this app?')) {
            onDelete(appId);
        }
    };
    
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-white">Manage Existing Apps</h2>
            {loading ? <div className="flex justify-center"><LoadingSpinner size={10} /></div> : (
                <div className="space-y-4 max-h-[1200px] overflow-y-auto pr-2">
                    {apps?.map(app => (
                        <div key={app.id} className="flex items-center justify-between bg-gray-700 p-4 rounded-lg">
                            <div className="flex items-center gap-4">
                                <img src={app.imageUrl} alt={app.name} className="w-12 h-12 rounded-md object-cover"/>
                                <p className="font-bold text-white">{app.name}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => onEdit(app)} className="text-blue-400 hover:text-blue-300 p-2 rounded-full hover:bg-gray-600 transition-colors" aria-label="Edit">
                                    <PencilIcon className="w-6 h-6" />
                                </button>
                                <button onClick={() => handleDelete(app.id)} className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-gray-600 transition-colors" aria-label="Delete">
                                    <TrashIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AppList;