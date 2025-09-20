/**
 * API Service
 * This file simulates a backend API by using localStorage.
 * When you move to a real backend (e.g., on Vercel), you will only
 * need to change the implementation of these functions to make real `fetch`
 * calls to your API endpoints. The rest of the frontend will work as-is.
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

// MOCK DATA and INITIALIZATION HELPERS
// These would be replaced by a real database.

const MOCK_APPS: AppShowcaseItem[] = [
    {
        id: '1', name: 'QuantumLeap AI', description: 'Predictive scheduling & smart reminders.',
        imageUrl: 'https://picsum.photos/seed/quantum/500/500', heroImageUrl: 'https://picsum.photos/seed/quantum-hero/1200/600',
        longDescription: 'An AI-powered productivity app that organizes your life with predictive scheduling and smart reminders. Experience the future of personal management. Integrates with all your calendars and learns your habits to proactively manage your day.',
        price: 'R499.99', pinCode: '1234', apkUrl: '#download-apk', iosUrl: '#download-ios', pwaUrl: '#download-pwa',
        screenshots: ['https://picsum.photos/seed/quantum-ss1/400/800', 'https://picsum.photos/seed/quantum-ss2/400/800', 'https://picsum.photos/seed/quantum-ss3/400/800', 'https://picsum.photos/seed/quantum-ss4/400/800'],
        features: ['AI Predictive Scheduling', 'Smart Reminders', 'Calendar Integration', 'Habit Tracking', 'Cross-Platform Sync'],
        abilities: ['Organizes your daily tasks automatically.', 'Learns your routine to suggest optimal schedules.', 'Prevents scheduling conflicts across all your devices.'],
        whyItWorks: 'Stop managing your time and let your time manage itself. QuantumLeap uses advanced AI to understand your workflow, priorities, and energy levels, crafting the perfect schedule for you every day so you can focus on what truly matters.',
        dedicatedPurpose: 'For busy professionals, students, and anyone looking to reclaim their time from the chaos of manual scheduling and planning. It is your personal AI assistant dedicated to maximizing your productivity and minimizing stress.',
        termsAndConditions: 'By using QuantumLeap AI, you agree to allow the app to access your calendar and contact data for scheduling purposes. We do not sell your data. Subscription is required for advanced features.',
        ratings: [{clientId: 'client-1', rating: 5}, {clientId: 'client-2', rating: 4}],
    },
    {
        id: '2', name: 'NovaArt Generator', description: 'Turn text prompts into stunning art.',
        imageUrl: 'https://picsum.photos/seed/nova/500/500', heroImageUrl: 'https://picsum.photos/seed/nova-hero/1200/600',
        longDescription: 'Unleash your creativity with NovaArt. Turn simple text prompts into stunning works of art using our advanced generative AI. Your imagination is the only limit. Perfect for artists, designers, and content creators.',
        price: 'R249.99', pinCode: '5678', apkUrl: '#download-apk', iosUrl: '#download-ios', pwaUrl: '#download-pwa',
        screenshots: ['https://picsum.photos/seed/nova-ss1/400/800', 'https://picsum.photos/seed/nova-ss2/400/800'],
        features: ['Text-to-Image Generation', 'Multiple Art Styles', 'High-Resolution Export', 'Aspect Ratio Control', 'Inpainting & Outpainting'],
        abilities: ['Creates breathtaking images from simple text descriptions.', 'Allows for fine-tuning and editing of generated art.', 'Exports in various formats for professional use.'],
        whyItWorks: 'You dont need to be a professional artist to create professional-grade art. NovaArt provides an intuitive and powerful toolset that turns your creative ideas into visual reality, perfect for social media, marketing materials, or personal projects.',
        dedicatedPurpose: 'Built for creatives of all skill levels—from digital marketers who need quick visuals to artists exploring new mediums. NovaArt is your partner in visual creation.',
        termsAndConditions: 'All images generated are owned by the user. The service is provided "as is". Excessive use may be throttled. No refunds on credit packs.',
        ratings: [{clientId: 'client-1', rating: 4}],
    },
    {
        id: '3', name: 'SecureSphere VPN', description: 'Military-grade encryption for privacy.',
        imageUrl: 'https://picsum.photos/seed/secure/500/500', heroImageUrl: 'https://picsum.photos/seed/secure-hero/1200/600',
        longDescription: 'Protect your digital privacy with SecureSphere. Our VPN offers military-grade encryption and a global network of servers for secure, anonymous browsing. Bypass geo-restrictions and keep your data safe from prying eyes.',
        price: 'R99.99 / month', pinCode: '9012', apkUrl: '#download-apk', iosUrl: '#download-ios', pwaUrl: '#download-pwa',
        screenshots: ['https://picsum.photos/seed/secure-ss1/400/800', 'https://picsum.photos/seed/secure-ss2/400/800', 'https://picsum.photos/seed/secure-ss3/400/800'],
        features: ['AES-256 Encryption', 'Global Server Network', 'No-Logs Policy', 'One-Click Connect', 'Kill Switch'],
        abilities: ['Encrypts your internet connection to hide your activity.', 'Unblocks streaming services and websites from other countries.', 'Protects you from trackers and hackers on public Wi-Fi.'],
        whyItWorks: 'In a world where your data is a commodity, SecureSphere acts as your digital shield. We provide a simple, powerful solution to anonymize your browsing, secure your data, and give you unrestricted access to the global internet.',
        dedicatedPurpose: 'For anyone who values their online privacy and freedom. Whether you are a frequent traveler, a remote worker, or just someone who wants to browse securely, SecureSphere is the essential tool for your digital life.',
        termsAndConditions: 'Our service operates under a strict no-logs policy. We are not responsible for user activity. Use of the service for illegal activities is strictly prohibited.',
        ratings: [],
    }
];
const MOCK_DETAILS: WebsiteDetails = {
    companyName: 'JSTYP.me', logoUrl: '', tel: '+1234567890', whatsapp: 'https://wa.me/27695989427',
    email: 'contact@jstyp.me', address: '123 Innovation Drive, Tech City',
    bankDetails: 'Bank: Future Bank\nAccount: 123456789\nBranch Code: 987654', 
    themeColor: '#f97316',
    // New theme defaults
    introLogoUrl: '',
    introImageUrl: 'https://picsum.photos/1920/1080?grayscale&blur=2',
    fontFamily: "'Inter', sans-serif",
    backgroundColor: '#000000',
    textColor: '#ffffff',
    cardColor: '#111827', // gray-900
    borderColor: '#374151', // gray-700
    aboutPageContent: null,
};
const MOCK_TEAM: TeamMember[] = [
    {
        id: 'admin-01', firstName: 'Jason', lastName: 'Typ', tel: '+270000000', email: 'jason@jstyp.me',
        pin: '1723', role: 'Lead Developer', profileImageUrl: 'https://i.pravatar.cc/150?u=admin-01',
    }
];
const MOCK_CLIENTS: Client[] = [
    { id: 'client-1', name: 'John Doe', email: 'john@example.com', password: 'password123' },
    { id: 'client-2', name: 'Jane Smith', email: 'jane@example.com', password: 'password123' }
];

// --- Generic LocalStorage Functions ---
const getFromStorage = <T>(key: string, mockData: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : mockData;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return mockData;
    }
};

const saveToStorage = <T>(key: string, data: T): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving to localStorage key “${key}”:`, error);
    }
};

// --- API Functions ---
const FAKE_DELAY = 300; // Simulate network latency

// --- Apps API ---
export const getApps = (): Promise<AppShowcaseItem[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const apps = getFromStorage('jstyp-apps', MOCK_APPS);
            resolve(apps);
        }, FAKE_DELAY);
    });
};

export const createApp = (newApp: Omit<AppShowcaseItem, 'id' | 'ratings'>): Promise<AppShowcaseItem> => {
    return new Promise(async resolve => {
        const apps = await getApps();
        const appWithId: AppShowcaseItem = { ...newApp, id: new Date().toISOString(), ratings: [] };
        const updatedApps = [...apps, appWithId];
        saveToStorage('jstyp-apps', updatedApps);
        setTimeout(() => resolve(appWithId), FAKE_DELAY);
    });
};

export const updateApp = (appToUpdate: AppShowcaseItem): Promise<AppShowcaseItem> => {
     return new Promise(async resolve => {
        let apps = await getApps();
        apps = apps.map(app => app.id === appToUpdate.id ? appToUpdate : app);
        saveToStorage('jstyp-apps', apps);
        setTimeout(() => resolve(appToUpdate), FAKE_DELAY);
    });
};

export const deleteApp = (appId: string): Promise<void> => {
    return new Promise(async resolve => {
        let apps = await getApps();
        apps = apps.filter(app => app.id !== appId);
        saveToStorage('jstyp-apps', apps);
        setTimeout(() => resolve(), FAKE_DELAY);
    });
};

export const addAppRating = (appId: string, clientId: string, rating: number): Promise<AppShowcaseItem> => {
    return new Promise(async (resolve, reject) => {
        const apps = await getApps();
        const appIndex = apps.findIndex(app => app.id === appId);
        if (appIndex === -1) return reject(new Error("App not found"));

        const appToUpdate = { ...apps[appIndex] };
        const existingRatingIndex = appToUpdate.ratings.findIndex(r => r.clientId === clientId);
        if (existingRatingIndex > -1) {
            appToUpdate.ratings[existingRatingIndex] = { clientId, rating };
        } else {
            appToUpdate.ratings.push({ clientId, rating });
        }
        
        apps[appIndex] = appToUpdate;
        saveToStorage('jstyp-apps', apps);
        setTimeout(() => resolve(appToUpdate), FAKE_DELAY);
    });
};

// --- App Requests API ---
export const getAppRequests = (): Promise<AppRequest[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(getFromStorage<AppRequest[]>('jstyp-app-requests', []));
        }, FAKE_DELAY);
    });
};

export const createAppRequest = (problemDescription: string): Promise<AppRequest> => {
    return new Promise(async resolve => {
        const requests = await getAppRequests();
        const newRequest: AppRequest = {
            id: new Date().toISOString(),
            problemDescription,
            status: 'thinking',
            submittedAt: new Date().toISOString(),
        };
        const updated = [...requests, newRequest];
        saveToStorage('jstyp-app-requests', updated);
        setTimeout(() => resolve(newRequest), FAKE_DELAY);
    });
};

export const updateAppRequestStatus = (requestId: string, status: 'thinking' | 'done'): Promise<AppRequest> => {
    return new Promise(async (resolve, reject) => {
        const requests = await getAppRequests();
        const reqIndex = requests.findIndex(r => r.id === requestId);
        if (reqIndex === -1) return reject(new Error("Request not found"));
        
        requests[reqIndex].status = status;
        saveToStorage('jstyp-app-requests', requests);
        setTimeout(() => resolve(requests[reqIndex]), FAKE_DELAY);
    });
};


// --- Website Details API ---
export const getWebsiteDetails = (): Promise<WebsiteDetails> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(getFromStorage('jstyp-website-details', MOCK_DETAILS)), FAKE_DELAY);
    });
};

export const updateWebsiteDetails = (newDetails: WebsiteDetails): Promise<WebsiteDetails> => {
    return new Promise(resolve => {
        saveToStorage('jstyp-website-details', newDetails);
        setTimeout(() => resolve(newDetails), FAKE_DELAY);
    });
};

// --- Team Members API ---
export const getTeamMembers = (): Promise<TeamMember[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(getFromStorage('jstyp-team-members', MOCK_TEAM)), FAKE_DELAY);
    });
};

export const createTeamMember = (newMember: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
    return new Promise(async resolve => {
        const members = await getTeamMembers();
        const memberWithId = { ...newMember, id: new Date().toISOString() };
        saveToStorage('jstyp-team-members', [...members, memberWithId]);
        setTimeout(() => resolve(memberWithId), FAKE_DELAY);
    });
};

export const updateTeamMember = (memberToUpdate: TeamMember): Promise<TeamMember> => {
    return new Promise(async resolve => {
        let members = await getTeamMembers();
        members = members.map(m => m.id === memberToUpdate.id ? memberToUpdate : m);
        saveToStorage('jstyp-team-members', members);
        setTimeout(() => resolve(memberToUpdate), FAKE_DELAY);
    });
};

export const deleteTeamMember = (memberId: string): Promise<void> => {
    return new Promise(async resolve => {
        let members = await getTeamMembers();
        members = members.filter(m => m.id !== memberId);
        saveToStorage('jstyp-team-members', members);
        setTimeout(() => resolve(), FAKE_DELAY);
    });
};

// --- PIN Records API ---
export const getPinRecords = (): Promise<PinRecord[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(getFromStorage<PinRecord[]>('jstyp-pin-records', [])), FAKE_DELAY);
    });
};

const generateRandomPin = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < length; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return result;
};

export const createPinRecord = (data: Omit<PinRecord, 'id' | 'pin' | 'isRedeemed' | 'generatedAt'>): Promise<PinRecord> => {
    return new Promise(async resolve => {
        const records = await getPinRecords();
        let pin: string;
        do { pin = generateRandomPin(); } while (records.some(rec => rec.pin === pin));
        
        const newPinRecord: PinRecord = {
            ...data,
            id: new Date().toISOString(),
            pin,
            isRedeemed: false,
            generatedAt: new Date().toISOString(),
        };
        
        saveToStorage('jstyp-pin-records', [...records, newPinRecord]);
        setTimeout(() => resolve(newPinRecord), FAKE_DELAY);
    });
};

export const redeemPin = (pin: string, appId: string, client?: { id: string, name: string }): Promise<PinRecord> => {
    return new Promise(async (resolve, reject) => {
        const records = await getPinRecords();
        const recordIndex = records.findIndex(rec => rec.pin === pin);
        if (recordIndex === -1) return reject(new Error("Invalid PIN code. Please try again."));
        
        const recordToUpdate = records[recordIndex];
        if (recordToUpdate.appId !== appId) return reject(new Error(`This PIN is not valid for this app.`));
        if (recordToUpdate.isRedeemed) return reject(new Error("This PIN has already been used."));
        
        recordToUpdate.isRedeemed = true;
        recordToUpdate.redeemedAt = new Date().toISOString();
        if (client) {
            recordToUpdate.clientId = client.id;
            recordToUpdate.clientName = client.name;
        }

        records[recordIndex] = recordToUpdate;
        saveToStorage('jstyp-pin-records', records);
        setTimeout(() => resolve(recordToUpdate), FAKE_DELAY);
    });
};

// --- Clients API ---
export const getClients = (): Promise<Client[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(getFromStorage('jstyp-clients', MOCK_CLIENTS)), FAKE_DELAY);
    });
};

export const getClientById = (id: string): Promise<Client | null> => {
    return new Promise(async resolve => {
        const clients = await getClients();
        const client = clients.find(c => c.id === id) || null;
        setTimeout(() => resolve(client), FAKE_DELAY);
    });
};

export const getClientByEmail = (email: string): Promise<Client | null> => {
    return new Promise(async resolve => {
        const clients = await getClients();
        const client = clients.find(c => c.email.toLowerCase() === email.toLowerCase()) || null;
        setTimeout(() => resolve(client), FAKE_DELAY);
    });
};

export const createClient = (newClientData: Omit<Client, 'id'>): Promise<Client> => {
    return new Promise(async resolve => {
        const clients = await getClients();
        const clientWithId = { ...newClientData, id: new Date().toISOString() };
        saveToStorage('jstyp-clients', [...clients, clientWithId]);
        setTimeout(() => resolve(clientWithId), FAKE_DELAY);
    });
};

// --- Redownload Requests API ---
export const getRedownloadRequests = (): Promise<RedownloadRequest[]> => {
    return new Promise(resolve => {
        setTimeout(() => resolve(getFromStorage<RedownloadRequest[]>('jstyp-redownload-requests', [])), FAKE_DELAY);
    });
};

export const createRedownloadRequest = (requestData: Omit<RedownloadRequest, 'id' | 'status' | 'requestedAt'>): Promise<RedownloadRequest | null> => {
    return new Promise(async resolve => {
        const requests = await getRedownloadRequests();
        const existingPending = requests.find(r => r.clientId === requestData.clientId && r.appId === requestData.appId && r.status === 'pending');
        if (existingPending) {
            alert('You already have a pending request for this app.');
            return resolve(null);
        }
        
        const newRequest: RedownloadRequest = {
            ...requestData,
            id: new Date().toISOString(),
            status: 'pending',
            requestedAt: new Date().toISOString(),
        };
        
        saveToStorage('jstyp-redownload-requests', [...requests, newRequest]);
        setTimeout(() => resolve(newRequest), FAKE_DELAY);
    });
};

export const updateRedownloadRequest = (requestId: string, status: 'approved' | 'denied', resolutionNotes: string): Promise<RedownloadRequest> => {
    return new Promise(async (resolve, reject) => {
        const requests = await getRedownloadRequests();
        const reqIndex = requests.findIndex(r => r.id === requestId);
        if (reqIndex === -1) return reject(new Error("Request not found"));
        
        requests[reqIndex] = { ...requests[reqIndex], status, resolutionNotes };
        saveToStorage('jstyp-redownload-requests', requests);
        setTimeout(() => resolve(requests[reqIndex]), FAKE_DELAY);
    });
};