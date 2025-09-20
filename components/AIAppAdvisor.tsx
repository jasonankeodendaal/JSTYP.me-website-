import React, { useState } from 'react';
import { useApps } from '../hooks/useApps';
import { useAppRequests } from '../hooks/useAppRequests';
import { findMatchingApp } from '../services/geminiService';
import AppCard from './AppCard';
import LoadingSpinner from './LoadingSpinner';
import RequestAppModal from './RequestAppModal';
import { SparklesIcon } from './IconComponents';
import type { AppShowcaseItem } from '../types';

const AIAppAdvisor: React.FC = () => {
    const { apps, loading: appsLoading } = useApps();
    const { addRequest } = useAppRequests();
    const [problem, setProblem] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ app: AppShowcaseItem | null; reasoning: string } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);


    const handleSearch = async () => {
        if (!problem.trim()) {
            alert("Please describe your problem first.");
            return;
        }
        if (!apps) {
            alert("App data is not available yet. Please try again in a moment.");
            return;
        }
        setIsLoading(true);
        setResult(null);

        const response = await findMatchingApp(problem, apps);
        
        if (response.bestMatchAppId) {
            const matchedApp = apps.find(app => app.id === response.bestMatchAppId);
            setResult({ app: matchedApp || null, reasoning: response.reasoning });
        } else {
            setResult({ app: null, reasoning: response.reasoning });
            setIsModalOpen(true);
        }
        setIsLoading(false);
    };

    const handleRequestSubmit = (description: string) => {
        addRequest(description);
        setIsModalOpen(false);
        setSubmitted(true);
    };
    
    if (submitted) {
        return (
            <div className="text-center py-10 bg-green-900/20 border border-green-500 rounded-xl">
                <h3 className="text-2xl font-bold text-green-400">Thank you!</h3>
                <p className="text-green-300 mt-2">Your idea has been submitted to our team. We'll get building!</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-[var(--card-color)]/50 backdrop-blur-sm border border-[var(--border-color)] rounded-xl p-8">
                <div className="flex items-center gap-4 mb-4">
                    <SparklesIcon className="w-10 h-10 text-orange-500" />
                    <div>
                        <h2 className="text-3xl font-bold text-[var(--text-color)]">AI App Advisor</h2>
                        <p className="text-gray-400">Describe a problem, and we'll find the right app for you.</p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <textarea
                        value={problem}
                        onChange={e => setProblem(e.target.value)}
                        placeholder="e.g., 'I need help creating images from text' or 'I want to browse the web privately'"
                        rows={3}
                        className="flex-grow bg-gray-800 text-white p-3 rounded-lg border border-gray-700 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                        aria-label="Problem description"
                    />
                    <button 
                        onClick={handleSearch} 
                        disabled={isLoading || appsLoading}
                        className="bg-orange-500 text-white font-bold py-3 px-6 rounded-lg transition-colors hover:bg-orange-600 disabled:bg-gray-500 flex items-center justify-center gap-2"
                    >
                        {isLoading || appsLoading ? <LoadingSpinner size={6} /> : "Find My App"}
                    </button>
                </div>

                {result && (
                    <div className="mt-8" aria-live="polite">
                        <h3 className="text-xl font-bold text-white mb-2">Our Recommendation:</h3>
                        <p className="text-gray-400 mb-4 italic">"{result.reasoning}"</p>
                        {result.app ? (
                            <div className="max-w-md">
                                <AppCard app={result.app} />
                            </div>
                        ) : null }
                    </div>
                )}
            </div>
            <RequestAppModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleRequestSubmit}
                initialProblem={problem}
            />
        </>
    );
};

export default AIAppAdvisor;