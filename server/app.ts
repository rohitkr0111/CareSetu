import express from 'express';
import { router } from './routes';
import { initDatabase } from './db';

// Initialize SQLite database and tables
initDatabase();

export const app = express();

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Permissive CORS middleware for cross-origin or proxied requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Routes
app.use('/api', router);

// Root health probe
app.get('/', (req, res) => {
  res.json({
    name: 'CareSetu Hospital Resource Intelligence Engine',
    version: '2.4.0',
    status: 'Operational',
    documentation: '/api/health',
  });
});
