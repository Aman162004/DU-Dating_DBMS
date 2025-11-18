import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';

// Import routes
import authRouter from './api/auth.js';
import coreRouter from './api/core.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Authentication Middleware
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// API Routes
app.use('/api/auth', authRouter);
app.get('/api/interests', async (req, res, next) => {
  try {
    const authModule = await import('./api/auth.js');
    // Re-import to get the interests handler
    const { query } = await import('./db.js');
    const result = await query(
      'SELECT interest_id, interest_name FROM interests ORDER BY interest_name'
    );

    res.json({
      success: true,
      interests: result.rows
    });
  } catch (error) {
    console.error('Error fetching interests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interests'
    });
  }
});
app.use('/api', authMiddleware, coreRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'DU Dating App API is running',
    timestamp: new Date().toISOString()
  });
});

// Serve home page as landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'HTML', 'home.html'));
});

// Serve other HTML pages
app.get('*', (req, res) => {
  const requestedPath = path.join(__dirname, 'public', req.path);
  
  // If it's a request for an HTML file, serve it
  if (req.path.endsWith('.html')) {
    res.sendFile(requestedPath);
  } else {
    // Otherwise serve the home page
    res.sendFile(path.join(__dirname, 'public', 'HTML', 'home.html'));
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 DU Dating App Server Running`);
  console.log(`📡 Server: http://localhost:${PORT}`);
  console.log(`🌐 Frontend: http://localhost:${PORT}`);
  console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});
