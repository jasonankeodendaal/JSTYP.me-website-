/**
 * API Service
 * This file now communicates with a real backend API built with Vercel Serverless Functions.
 * Each function makes a `fetch` call to a corresponding API endpoint.
 */
import type { 
    AppShowcaseItem, 
    AppRequest, 
    WebsiteDetails, 
    PinRecord, 
    TeamMember, 
    Client, 
    RedownloadRequest 
} from '../types';

// --- Helper for API calls ---
const apiFetch = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'An API error occurred');
    }
    return response.json();
};

// Helper to upload a base64 image and get a URL
const uploadImage = async (base64: string): Promise<string> => {
    if (!base64 || !base64.startsWith('data:image')) {
        return base64; // It's already a URL or empty
    }
    const { url } = await apiFetch<{ url: string }>('/api/website-details', {
        method: 'POST',
        body: JSON.stringify({ file: base64 }),
    });
    return url;
};

// --- Apps API ---
export const getApps = (): Promise<AppShowcaseItem[]> => apiFetch('/api/apps');

export const createApp = async (newApp: Omit<AppShowcaseItem, 'id' | 'ratings'>): Promise<AppShowcaseItem> => {
    // Upload all new base64 images first
    const imageUrl = await uploadImage(newApp.imageUrl);
    const heroImageUrl = await uploadImage(newApp.heroImageUrl);
    const screenshots = await Promise.all(newApp.screenshots.map(s => uploadImage(s)));

    const appWithUrls = { ...newApp, imageUrl, heroImageUrl, screenshots };

    return apiFetch('/api/apps', {
        method: 'POST',
        body: JSON.stringify(appWithUrls),
    });
};

export const updateApp = async (appToUpdate: AppShowcaseItem): Promise<AppShowcaseItem> => {
    const imageUrl = await uploadImage(appToUpdate.imageUrl);
    const heroImageUrl = await uploadImage(appToUpdate.heroImageUrl);
    const screenshots = await Promise.all(appToUpdate.screenshots.map(s => uploadImage(s)));

    const appWithUrls = { ...appToUpdate, imageUrl, heroImageUrl, screenshots };
    
    return apiFetch(`/api/apps?id=${appToUpdate.id}`, {
        method: 'PUT',
        body: JSON.stringify(appWithUrls),
    });
};

export const deleteApp = (appId: string): Promise<void> => apiFetch(`/api/apps?id=${appId}`, { method: 'DELETE' });

export const addAppRating = (appId: string, clientId: string, rating: number): Promise<AppShowcaseItem> => {
    return apiFetch(`/api/apps?id=${appId}`, {
        method: 'POST',
        body: JSON.stringify({ clientId, rating }),
    });
};


// --- App Requests API ---
export const getAppRequests = (): Promise<AppRequest[]> => apiFetch('/api/app-requests');

export const createAppRequest = (problemDescription: string): Promise<AppRequest> => {
    return apiFetch('/api/app-requests', {
        method: 'POST',
        body: JSON.stringify({ problemDescription }),
    });
};

export const updateAppRequestStatus = (requestId: string, status: 'thinking' | 'done'): Promise<AppRequest> => {
    return apiFetch(`/api/app-requests?id=${requestId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
};


// --- Website Details API ---
export const getWebsiteDetails = (): Promise<WebsiteDetails> => apiFetch('/api/website-details');

export const updateWebsiteDetails = async (newDetails: WebsiteDetails): Promise<WebsiteDetails> => {
     // Upload images if they are new base64 strings
    const logoUrl = await uploadImage(newDetails.logoUrl);
    const introLogoUrl = await uploadImage(newDetails.introLogoUrl);
    const introImageUrl = await uploadImage(newDetails.introImageUrl);

    const aboutPageContent = newDetails.aboutPageContent ? {
        ...newDetails.aboutPageContent,
        introduction: {
            ...newDetails.aboutPageContent.introduction,
            imageUrl: await uploadImage(newDetails.aboutPageContent.introduction.imageUrl || ''),
        },
        sections: await Promise.all(newDetails.aboutPageContent.sections.map(async (section) => ({
            ...section,
            imageUrl: await uploadImage(section.imageUrl || ''),
        }))),
    } : null;
    
    const detailsWithUrls = { ...newDetails, logoUrl, introLogoUrl, introImageUrl, aboutPageContent };

    return apiFetch('/api/website-details', {
        method: 'POST',
        body: JSON.stringify(detailsWithUrls),
    });
};

// --- Team Members API ---
export const getTeamMembers = (): Promise<TeamMember[]> => apiFetch('/api/team-members');

export const createTeamMember = async (newMember: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
    const profileImageUrl = await uploadImage(newMember.profileImageUrl);
    return apiFetch('/api/team-members', {
        method: 'POST',
        body: JSON.stringify({ ...newMember, profileImageUrl }),
    });
};

export const updateTeamMember = async (memberToUpdate: TeamMember): Promise<TeamMember> => {
    const profileImageUrl = await uploadImage(memberToUpdate.profileImageUrl);
    return apiFetch(`/api/team-members?id=${memberToUpdate.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...memberToUpdate, profileImageUrl }),
    });
};

export const deleteTeamMember = (memberId: string): Promise<void> => apiFetch(`/api/team-members?id=${memberId}`, { method: 'DELETE' });


// --- PIN Records API ---
export const getPinRecords = (): Promise<PinRecord[]> => apiFetch('/api/pins');

export const createPinRecord = (data: Omit<PinRecord, 'id' | 'pin' | 'isRedeemed' | 'generatedAt'>): Promise<PinRecord> => {
    return apiFetch('/api/pins', {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

export const redeemPin = (pin: string, appId: string, client?: { id: string, name: string }): Promise<PinRecord> => {
    return apiFetch('/api/pins', {
        method: 'POST',
        body: JSON.stringify({ pin, appId, client, action: 'redeem' }),
    });
};

// --- Clients API ---
export const getClients = (): Promise<Client[]> => apiFetch('/api/clients');

export const getClientById = (id: string): Promise<Client | null> => apiFetch(`/api/clients?id=${id}`);

export const getClientByEmail = (email: string): Promise<Client | null> => apiFetch(`/api/clients?email=${encodeURIComponent(email)}`);

export const createClient = (newClientData: Omit<Client, 'id'>): Promise<Client> => {
    return apiFetch('/api/clients', {
        method: 'POST',
        body: JSON.stringify(newClientData),
    });
};


// --- Redownload Requests API ---
export const getRedownloadRequests = (): Promise<RedownloadRequest[]> => apiFetch('/api/redownload-requests');

export const createRedownloadRequest = (requestData: Omit<RedownloadRequest, 'id' | 'status' | 'requestedAt'>): Promise<RedownloadRequest | null> => {
    return apiFetch('/api/redownload-requests', {
        method: 'POST',
        body: JSON.stringify(requestData),
    });
};

export const updateRedownloadRequest = (requestId: string, status: 'approved' | 'denied', resolutionNotes: string): Promise<RedownloadRequest> => {
    return apiFetch(`/api/redownload-requests?id=${requestId}`, {
        method: 'PUT',
        body: JSON.stringify({ status, resolutionNotes }),
    });
};