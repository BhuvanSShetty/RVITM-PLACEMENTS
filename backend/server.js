import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables (.env in backend or parent root)
dotenv.config();
if (!process.env.MONGO_URI) {
  dotenv.config({ path: '../.env' });
}

import cron from 'node-cron';
import { connectToDatabase } from './src/config/db.js';
import authRouter from './src/routes/auth.js';
import verifyRouter from './src/routes/verify.js';
import resultsRouter from './src/routes/results.js';
import eventsRouter from './src/routes/events.js';
import parseRouter from './src/routes/parse.js';

const app = express();

// Standard middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', '*'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get(['/', '/health'], (req, res) => {
  res.json({
    status: 'ok',
    message: 'Fast Student API (Express ESM) is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
app.use('/api/auth', authRouter);
app.use('/api/verify', verifyRouter);
app.use('/api/results', resultsRouter);
app.use('/api/events', eventsRouter);
app.use('/api/ai/parse', parseRouter);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ detail: `Route ${req.method} ${req.url} not found` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ detail: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Student API server running at http://localhost:${PORT}`);
    console.log(`   - Health:   http://localhost:${PORT}/health`);
    console.log(`   - Results:  http://localhost:${PORT}/api/results/:usn`);
    console.log(`   - Events:   http://localhost:${PORT}/api/events`);
    console.log(`   - Auth:     http://localhost:${PORT}/api/auth`);
    console.log(`   - Verify:   http://localhost:${PORT}/api/verify`);
    console.log(`   - AI Parse: http://localhost:${PORT}/api/ai/parse`);

    // Pre-warm database connection pool so first incoming request is instant
    connectToDatabase()
      .then(() => console.log('⚡ Connected & pre-warmed MongoDB connection pool'))
      .catch((err) => console.warn('⚠️ Initial MongoDB connection warning:', err.message));

    // Cron job: run every 5 minutes (*/5 * * * *) to prevent server sleep / cold starts
    const pingTarget = process.env.PING_URL || `http://localhost:${PORT}/health`;

    cron.schedule('*/5 * * * *', async () => {
      try {
        const response = await fetch(pingTarget);
        if (response.ok) {
          console.log(`[Cron: */5 * * * *] Health check ping success (${new Date().toLocaleTimeString()}): ${pingTarget}`);
        } else {
          console.warn(`[Cron: */5 * * * *] Health check returned status ${response.status}`);
        }
      } catch (err) {
        console.error(`[Cron: */5 * * * *] Health check failed:`, err.message);
      }
    });
  });
}

export default app;
