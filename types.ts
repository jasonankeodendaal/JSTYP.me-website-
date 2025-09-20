export interface AppShowcaseItem {
  id: string;
  name: string;
  description: string; // Short description for card
  imageUrl: string; // For card thumbnail

  // Fields for detail page
  heroImageUrl: string;
  longDescription: string;
  price: string;
  screenshots: string[];
  features: string[];
  abilities: string[];
  whyItWorks: string;
  dedicatedPurpose: string;
  termsAndConditions: string;
  ratings: { clientId: string; rating: number }[];
  
  // Download fields
  pinCode: string; // This will now be a master/dev pin
  apkUrl: string;
  iosUrl:string;
  pwaUrl: string;
}

export interface AppRequest {
  id: string;
  problemDescription: string;
  status: 'thinking' | 'done';
  submittedAt: string;
}

export interface AboutPageSection {
  heading: string;
  content: string;
  imagePrompt: string;
  imageUrl?: string;
}

export interface AboutPageContent {
  pageTitle: string;
  introduction: AboutPageSection;
  sections: AboutPageSection[];
}

export interface WebsiteDetails {
    companyName: string;
    logoUrl: string;
    tel: string;
    whatsapp: string;
    email: string;
    address: string;
    bankDetails: string;
    
    // Theme & Branding
    themeColor: string; // Primary accent/glow color
    introLogoUrl: string;
    introImageUrl: string;
    fontFamily: string;
    backgroundColor: string;
    textColor: string;
    cardColor: string;
    borderColor: string;

    // New About Page Content
    aboutPageContent: AboutPageContent | null;
}

export interface PinRecord {
    id: string;
    pin: string;
    appId: string;
    appName: string; // Denormalized for easy display
    clientDetails: {
        companyName: string;
        contactPerson: string;
        contactInfo: string;
    };
    clientId?: string; // Link to the client who redeemed it
    clientName?: string;
    isRedeemed: boolean;
    generatedAt: string;
    redeemedAt?: string;
}

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  tel: string;
  email: string;
  pin: string; // Used for login
  role: string; // e.g., "Developer", "Manager"
  profileImageUrl: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  password: string; // In a real app, this would be a hash
}

export interface RedownloadRequest {
  id: string;
  clientId: string;
  clientName: string;
  appId: string;
  appName: string;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: string;
  resolutionNotes?: string;
}

export interface AuthContextType {
  currentUser: Client | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loading: boolean;
}