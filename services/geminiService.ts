import type { AppShowcaseItem, AboutPageContent } from '../types';

const apiFetch = async <T>(url: string, body: object): Promise<T> => {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'An AI API error occurred');
    }
    return response.json();
};


export const generateAppDescription = async (keywords: string): Promise<string> => {
    try {
        const { description } = await apiFetch<{ description: string }>('/api/ai/generate-description', { keywords });
        return description;
    } catch (error) {
        console.error("Error generating description via backend:", error);
        return error instanceof Error ? error.message : "Failed to generate AI description. Please try again or write one manually.";
    }
};

export const generateAppListing = async (idea: string): Promise<Partial<AppShowcaseItem>> => {
    return apiFetch('/api/ai/generate-listing', { idea });
};

export const generateAppImage = async (prompt: string, aspectRatio: '1:1' | '16:9' = '1:1'): Promise<string> => {
    const { imageUrl } = await apiFetch<{ imageUrl: string }>('/api/ai/generate-image', { prompt, aspectRatio });
    return imageUrl;
};

export const findMatchingApp = async (problem: string, apps: AppShowcaseItem[]): Promise<{ bestMatchAppId: string | null, reasoning: string }> => {
    try {
        return await apiFetch('/api/ai/find-matching-app', { problem, apps });
    } catch (error) {
        console.error("Error finding matching app via backend:", error);
        const reasoning = error instanceof Error ? error.message : "An error occurred while searching for a solution. Please try again.";
        return { bestMatchAppId: null, reasoning };
    }
};

export const generateAboutPageContent = async (rawText: string): Promise<AboutPageContent> => {
    return apiFetch('/api/ai/generate-about-page', { rawText });
};