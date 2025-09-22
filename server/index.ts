import express from 'express';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';
import { ensureUploadsDir } from './uploader';
// FIX: Add import for __dirname polyfill
import { fileURLToPath } from 'url';

// Import routers
import aiRouter from './routes/ai';
import appsRouter from './routes/apps';
import appRequestsRouter from './routes/app-requests';
import clientsRouter from './routes/clients';
import pinsRouter from './routes/pins';
import redownloadRequestsRouter from './routes/redownload-requests';
import teamMembersRouter from './routes/team-members';
import websiteDetailsRouter from './routes/website-details';
import videosRouter from './routes/videos';

// FIX: Polyfill __dirname for ES modules environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize uploads directory
ensureUploadsDir();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase limit for base64 uploads

// --- API Routes ---
app.use('/api/ai', aiRouter);
app.use('/api/apps', appsRouter);
app.use('/api/app-requests', appRequestsRouter);
app.use('/api/clients', clientsRouter);
app.use('/api/pins', pinsRouter);
app.use('/api/redownload-requests', redownloadRequestsRouter);
app.use('/api/team-members', teamMembersRouter);
app.use('/api/website-details', websiteDetailsRouter);
app.use('/api/videos', videosRouter);

// --- File Serving for Uploads ---
// This path corresponds to the disk mount path in render.yaml
const uploadsPath = process.env.NODE_ENV === 'production' 
    ? '/var/data/uploads' 
    : path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// --- Health Check for Render ---
app.get('/api/health', (req, res) => {
    res.status(200).send('OK');
});

// --- Frontend Serving ---
// This part serves the React app's build folder from the 'dist' directory
const clientBuildPath = path.join(__dirname, '..', '..', 'dist');
app.use(express.static(clientBuildPath));

// For any other request, serve the index.html file to allow client-side routing
app.get('*', (req, res) => {
    // Exclude API routes from being served index.html
    if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
        return res.status(404).send('Not Found');
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});