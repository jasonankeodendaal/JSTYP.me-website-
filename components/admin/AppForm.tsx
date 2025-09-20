import React, { useState, useEffect } from 'react';
import type { AppShowcaseItem } from '../../types';
import { PlusCircleIcon, SparklesIcon } from '../IconComponents';
import { generateAppListing, generateAppImage } from '../../services/geminiService';
import LoadingSpinner from '../LoadingSpinner';

interface AppFormProps {
    editingApp: AppShowcaseItem | null;
    onCancelEdit: () => void;
    addApp: (app: Omit<AppShowcaseItem, 'id' | 'ratings'>) => Promise<void>;
    updateApp: (app: AppShowcaseItem) => Promise<void>;
}

// Define a type for the form state to correctly handle `features` and `abilities` as strings for the textareas,
// while the main type `AppShowcaseItem` expects string arrays. This resolves type conflicts.
interface AppFormState extends Omit<Partial<AppShowcaseItem>, 'features' | 'abilities' | 'ratings'> {
    features?: string;
    abilities?: string;
}

const AppForm: React.FC<AppFormProps> = ({ editingApp, onCancelEdit, addApp, updateApp }) => {
    // Form State
    const [formData, setFormData] = useState<AppFormState>({});
    
    // AI Interaction State
    const [appIdea, setAppIdea] = useState('');
    const [isGeneratingListing, setIsGeneratingListing] = useState(false);
    const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
    const [isGeneratingHero, setIsGeneratingHero] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (editingApp) {
            setFormData({
                ...editingApp,
                features: editingApp.features.join('\n'),
                abilities: editingApp.abilities.join('\n'),
            });
        } else {
            resetAppForm();
        }
    }, [editingApp]);

    const resetAppForm = () => {
        setFormData({});
        setAppIdea('');
        onCancelEdit();
    };
    
    const handleInputChange = (field: keyof AppFormState, value: string | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleGenerateListing = async () => {
        if (!appIdea) { alert('Please enter an app idea first.'); return; }
        setIsGeneratingListing(true);
        try {
            const generatedData = await generateAppListing(appIdea);
            setFormData(prev => ({
                ...prev,
                ...generatedData,
                features: Array.isArray(generatedData.features) ? generatedData.features.join('\n') : '',
                abilities: Array.isArray(generatedData.abilities) ? generatedData.abilities.join('\n') : '',
            }));
        } catch (error) {
            console.error(error);
            alert((error as Error).message);
        } finally {
            setIsGeneratingListing(false);
        }
    };

    const handleGenerateImage = async (type: 'thumbnail' | 'hero') => {
        const prompt = formData.name && formData.description ? `${formData.name}: ${formData.description}` : appIdea;
        if (!prompt) {
            alert('Please provide an app idea or name/description before generating images.');
            return;
        }

        if (type === 'thumbnail') setIsGeneratingThumb(true);
        else setIsGeneratingHero(true);

        try {
            const aspectRatio = type === 'thumbnail' ? '1:1' : '16:9';
            const imageUrl = await generateAppImage(prompt, aspectRatio);
            const field = type === 'thumbnail' ? 'imageUrl' : 'heroImageUrl';
            handleInputChange(field, imageUrl);
        } catch (error) {
            console.error(error);
            alert((error as Error).message);
        } finally {
            if (type === 'thumbnail') setIsGeneratingThumb(false);
            else setIsGeneratingHero(false);
        }
    };
    
    const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const fileReadPromises = Array.from(files).map(file => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve(reader.result as string);
                    };
                    reader.onerror = (error) => {
                        reject(error);
                    };
                    reader.readAsDataURL(file);
                });
            });
    
            Promise.all(fileReadPromises)
                .then(newBase64Strings => {
                    handleInputChange('screenshots', [...(formData.screenshots || []), ...newBase64Strings]);
                })
                .catch(error => {
                    console.error("Error reading files for screenshots:", error);
                    alert("An error occurred while trying to upload screenshots. Please try again.");
                });
        }
    };

    const handleAppSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.imageUrl || !formData.heroImageUrl) { 
            alert('Please ensure App Name, Thumbnail, and Hero Image are present.'); 
            return; 
        }
        setIsSubmitting(true);
        
        // Convert form state back to the AppShowcaseItem structure
        const finalData: Omit<AppShowcaseItem, 'id' | 'ratings'> = {
            name: formData.name || '',
            description: formData.description || '',
            imageUrl: formData.imageUrl || '',
            heroImageUrl: formData.heroImageUrl || '',
            longDescription: formData.longDescription || '',
            price: formData.price || '',
            screenshots: formData.screenshots || [],
            features: typeof formData.features === 'string' ? formData.features.split('\n').filter(f => f.trim() !== '') : [],
            abilities: typeof formData.abilities === 'string' ? formData.abilities.split('\n').filter(a => a.trim() !== '') : [],
            whyItWorks: formData.whyItWorks || '',
            dedicatedPurpose: formData.dedicatedPurpose || '',
            termsAndConditions: formData.termsAndConditions || '',
            pinCode: formData.pinCode || '',
            apkUrl: formData.apkUrl || '',
            iosUrl: formData.iosUrl || '',
            pwaUrl: formData.pwaUrl || '',
        };

        if (editingApp) {
            await updateApp({ ...finalData, id: editingApp.id, ratings: editingApp.ratings });
            alert('App updated successfully!');
        } else {
            await addApp(finalData);
            alert('App added successfully!');
        }
        resetAppForm();
        setIsSubmitting(false);
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
                <PlusCircleIcon className="w-8 h-8 text-orange-500" />
                {editingApp ? 'Edit App' : 'Create New App with AI'}
            </h2>
            
            {!editingApp && (
                <div className="space-y-4 mb-8 p-4 bg-gray-700/50 rounded-lg">
                    <h3 className="font-bold text-lg text-orange-400">Start with an Idea</h3>
                    <textarea
                        placeholder="e.g., An AI-powered app to help users learn new languages through interactive stories."
                        value={appIdea}
                        onChange={e => setAppIdea(e.target.value)}
                        rows={3}
                        className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    />
                    <button type="button" onClick={handleGenerateListing} disabled={isGeneratingListing} className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-500 flex justify-center items-center gap-2">
                        {isGeneratingListing ? <LoadingSpinner size={6} /> : <><SparklesIcon className="w-5 h-5" /> Generate App Draft</>}
                    </button>
                </div>
            )}
            
            <form onSubmit={handleAppSubmit} className="space-y-4">
                <input type="text" placeholder="App Name" value={formData.name || ''} onChange={e => handleInputChange('name', e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                <input type="text" placeholder="Price (e.g., R499.99)" value={formData.price || ''} onChange={e => handleInputChange('price', e.target.value)} required className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                <textarea placeholder="Short Description (for card)" value={formData.description || ''} onChange={e => handleInputChange('description', e.target.value)} rows={2} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"></textarea>
                <textarea placeholder="Long Description (About the App)" value={formData.longDescription || ''} onChange={e => handleInputChange('longDescription', e.target.value)} rows={4} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"></textarea>
                
                <h3 className="text-xl font-bold pt-4 border-t border-gray-700">Detailed Content</h3>
                <textarea placeholder="Features (one per line)" value={formData.features || ''} onChange={e => handleInputChange('features', e.target.value)} rows={4} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"></textarea>
                <textarea placeholder="Abilities (one per line)" value={formData.abilities || ''} onChange={e => handleInputChange('abilities', e.target.value)} rows={4} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"></textarea>
                <textarea placeholder="Why it will work for you" value={formData.whyItWorks || ''} onChange={e => handleInputChange('whyItWorks', e.target.value)} rows={3} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"></textarea>
                <textarea placeholder="Dedicated Purpose" value={formData.dedicatedPurpose || ''} onChange={e => handleInputChange('dedicatedPurpose', e.target.value)} rows={3} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"></textarea>
                <textarea placeholder="Terms and Conditions" value={formData.termsAndConditions || ''} onChange={e => handleInputChange('termsAndConditions', e.target.value)} rows={4} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"></textarea>

                <h3 className="text-xl font-bold pt-4 border-t border-gray-700">Images</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">App Thumbnail (Square)</label>
                    <button type="button" onClick={() => handleGenerateImage('thumbnail')} disabled={isGeneratingThumb} className="mb-2 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-500 flex justify-center items-center gap-2">
                        {isGeneratingThumb ? <LoadingSpinner size={5}/> : <><SparklesIcon className="w-5 h-5"/> Generate with AI</>}
                    </button>
                    {formData.imageUrl && <img src={formData.imageUrl} alt="preview" className="mt-4 rounded-lg w-24 h-24 object-cover"/>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">App Hero Image (Landscape)</label>
                    <button type="button" onClick={() => handleGenerateImage('hero')} disabled={isGeneratingHero} className="mb-2 w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-500 flex justify-center items-center gap-2">
                        {isGeneratingHero ? <LoadingSpinner size={5}/> : <><SparklesIcon className="w-5 h-5"/> Generate with AI</>}
                    </button>
                    {formData.heroImageUrl && <img src={formData.heroImageUrl} alt="preview" className="mt-4 rounded-lg w-48 h-auto"/>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Screenshots</label>
                    <input type="file" accept="image/*" multiple onChange={handleMultipleImageUpload} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500 file:text-white hover:file:bg-orange-600"/>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {formData.screenshots?.map((ss, index) => <img key={index} src={ss} alt={`ss ${index}`} className="w-24 h-auto rounded"/>)}
                    </div>
                </div>

                <h3 className="text-xl font-bold pt-4 border-t border-gray-700">Download Settings</h3>
                <input type="text" placeholder="Master PIN (for Devs)" value={formData.pinCode || ''} onChange={e => handleInputChange('pinCode', e.target.value)} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                <input type="text" placeholder="Android APK URL" value={formData.apkUrl || ''} onChange={e => handleInputChange('apkUrl', e.target.value)} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                <input type="text" placeholder="iOS AppStore URL" value={formData.iosUrl || ''} onChange={e => handleInputChange('iosUrl', e.target.value)} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                <input type="text" placeholder="PWA URL" value={formData.pwaUrl || ''} onChange={e => handleInputChange('pwaUrl', e.target.value)} className="w-full bg-gray-700 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-orange-500 focus:outline-none"/>
                
                <div className="flex gap-4 pt-4 border-t border-gray-700">
                    {editingApp && (<button type="button" onClick={resetAppForm} className="w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel Edit</button>)}
                    <button type="submit" disabled={isSubmitting} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-500 flex justify-center items-center gap-2">
                        {isSubmitting ? <LoadingSpinner size={6} /> : (editingApp ? 'Update App' : 'Add App')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AppForm;