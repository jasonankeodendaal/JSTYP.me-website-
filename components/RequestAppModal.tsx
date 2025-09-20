import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

interface RequestAppModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (description: string) => void;
    initialProblem: string;
}

const RequestAppModal: React.FC<RequestAppModalProps> = ({ isOpen, onClose, onSubmit, initialProblem }) => {
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!description.trim()) {
            alert("Please provide some details about your problem.");
            return;
        }
        setIsSubmitting(true);
        // Combine initial problem with detailed description
        const fullDescription = `Initial problem: "${initialProblem}"\n\nDetailed explanation: "${description}"`;
        onSubmit(fullDescription);
        // No need to set isSubmitting to false, as the modal will close.
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
                <h2 id="modal-title" className="text-2xl font-bold text-white mb-4">We don't have a solution... yet!</h2>
                <p className="text-gray-400 mb-6">But we'd love to build one for you. Please describe your problem in more detail, and our team will get to work on a solution.</p>
                <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="For example: 'I need an app that helps me track my water intake and reminds me to drink water every hour...'"
                    rows={5}
                    className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    aria-label="Detailed problem description"
                />
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-500 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={isSubmitting} className="py-2 px-6 rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors font-bold flex items-center gap-2 disabled:bg-gray-500">
                        {isSubmitting ? <LoadingSpinner size={5} /> : "Submit Idea"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RequestAppModal;
