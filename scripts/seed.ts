import { db, sql } from '@vercel/postgres';
import type { AppShowcaseItem, WebsiteDetails, TeamMember, Client } from '../types';

// Mock data copied from the original api.ts
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
    introLogoUrl: '',
    introImageUrl: 'https://picsum.photos/1920/1080?grayscale&blur=2',
    fontFamily: "'Inter', sans-serif",
    backgroundColor: '#000000',
    textColor: '#ffffff',
    cardColor: '#111827',
    borderColor: '#374151',
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

async function main() {
  const client = await db.connect();

  console.log('Creating tables...');
  await client.sql`
    CREATE TABLE IF NOT EXISTS apps (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      imageUrl TEXT,
      heroImageUrl TEXT,
      longDescription TEXT,
      price TEXT,
      screenshots JSONB,
      features JSONB,
      abilities JSONB,
      whyItWorks TEXT,
      dedicatedPurpose TEXT,
      termsAndConditions TEXT,
      ratings JSONB,
      pinCode TEXT,
      apkUrl TEXT,
      iosUrl TEXT,
      pwaUrl TEXT
    );`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS app_requests (
      id TEXT PRIMARY KEY,
      problemDescription TEXT NOT NULL,
      status TEXT NOT NULL,
      submittedAt TIMESTAMPTZ NOT NULL
    );`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS website_details (
      id INT PRIMARY KEY,
      details JSONB NOT NULL
    );`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS pin_records (
      id TEXT PRIMARY KEY,
      pin TEXT UNIQUE NOT NULL,
      appId TEXT NOT NULL,
      appName TEXT NOT NULL,
      clientDetails JSONB,
      clientId TEXT,
      clientName TEXT,
      isRedeemed BOOLEAN NOT NULL,
      generatedAt TIMESTAMPTZ NOT NULL,
      redeemedAt TIMESTAMPTZ
    );`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS team_members (
      id TEXT PRIMARY KEY,
      firstName TEXT NOT NULL,
      lastName TEXT NOT NULL,
      tel TEXT,
      email TEXT UNIQUE NOT NULL,
      pin TEXT UNIQUE NOT NULL,
      role TEXT,
      profileImageUrl TEXT
    );`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS clients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS redownload_requests (
      id TEXT PRIMARY KEY,
      clientId TEXT NOT NULL,
      clientName TEXT NOT NULL,
      appId TEXT NOT NULL,
      appName TEXT NOT NULL,
      status TEXT NOT NULL,
      requestedAt TIMESTAMPTZ NOT NULL,
      resolutionNotes TEXT
    );`;
  console.log('Tables created successfully.');


  console.log('Seeding data...');
  
  // Seed apps
  for (const app of MOCK_APPS) {
    await client.sql`
      INSERT INTO apps (id, name, description, imageUrl, heroImageUrl, longDescription, price, screenshots, features, abilities, whyItWorks, dedicatedPurpose, termsAndConditions, ratings, pinCode, apkUrl, iosUrl, pwaUrl)
      VALUES (${app.id}, ${app.name}, ${app.description}, ${app.imageUrl}, ${app.heroImageUrl}, ${app.longDescription}, ${app.price}, ${JSON.stringify(app.screenshots)}, ${JSON.stringify(app.features)}, ${JSON.stringify(app.abilities)}, ${app.whyItWorks}, ${app.dedicatedPurpose}, ${app.termsAndConditions}, ${JSON.stringify(app.ratings)}, ${app.pinCode}, ${app.apkUrl}, ${app.iosUrl}, ${app.pwaUrl})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
  console.log('Seeded apps.');

  // Seed website_details (using a single row with id=1)
  await client.sql`
    INSERT INTO website_details (id, details)
    VALUES (1, ${JSON.stringify(MOCK_DETAILS)})
    ON CONFLICT (id) DO UPDATE SET details = ${JSON.stringify(MOCK_DETAILS)};
  `;
  console.log('Seeded website details.');

  // Seed team members
  for (const member of MOCK_TEAM) {
    await client.sql`
      INSERT INTO team_members (id, firstName, lastName, tel, email, pin, role, profileImageUrl)
      VALUES (${member.id}, ${member.firstName}, ${member.lastName}, ${member.tel}, ${member.email}, ${member.pin}, ${member.role}, ${member.profileImageUrl})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
  console.log('Seeded team members.');

  // Seed clients
  for (const c of MOCK_CLIENTS) {
    await client.sql`
      INSERT INTO clients (id, name, email, password)
      VALUES (${c.id}, ${c.name}, ${c.email}, ${c.password})
      ON CONFLICT (id) DO NOTHING;
    `;
  }
  console.log('Seeded clients.');
  
  console.log('Database seeding complete!');
  await client.release();
}

main().catch(err => {
  console.error('An error occurred while seeding the database:', err);
});