import React from 'react';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    terms: string;
    appName: string;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, terms, appName }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-8 w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <h2 id="modal-title" className="text-2xl font-bold text-white mb-4">Terms & Conditions for {appName}</h2>
                <div className="flex-grow overflow-y-auto pr-4 text-gray-300 whitespace-pre-wrap">
                    <p>{terms || "No terms and conditions provided for this app."}</p>
                </div>
                <div className="flex justify-end mt-6">
                    <button onClick={onClose} className="py-2 px-6 rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors font-bold">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;
