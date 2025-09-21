import express from 'express';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';
// FIX: Added url import to correctly resolve __dirname in an ES module context.
import { fileURLToPath } from 'url';

// Import routes
import aiRoutes from './routes/ai';
import appsRoutes from './routes/apps';
import appRequestsRoutes from './routes/app-requests';
import clientsRoutes from './routes/clients';
import pinsRoutes from './routes/pins';
import redownloadRequestsRoutes from './routes/redownload-requests';
import teamMembersRoutes from './routes/team-members';
import websiteDetailsRoutes from './routes/website-details';
import uploadRoutes from './routes/upload';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
// Increase payload size limit for base64 image uploads
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/ai', aiRoutes);
app.use('/api/apps', appsRoutes);
app.use('/api/app-requests', appRequestsRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/pins', pinsRoutes);
app.use('/api/redownload-requests', redownloadRequestsRoutes);
app.use('/api/team-members', teamMembersRoutes);
app.use('/api/website-details', websiteDetailsRoutes);
app.use('/api/upload', uploadRoutes);


// Serve frontend
// Resolve the path relative to the current file's directory (__dirname)
// FIX: Replaced __dirname with a standards-compliant method for ES modules to resolve the frontend build path.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const feBuildPath = path.resolve(__dirname, '..', '..', 'dist');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(feBuildPath));

  app.get('*', (_, res) => {
    res.sendFile(path.join(feBuildPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});