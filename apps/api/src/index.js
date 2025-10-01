import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler.js';
import { requireAuth } from './middleware/auth.js';
import { requireMutationHeader } from './middleware/mutationHeader.js';
import authRoutes from './routes/auth.js';
import itemsRoutes from './routes/items.js';
import tagsRoutes from './routes/tags.js';
import metricsRoutes from './routes/metrics.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4006;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Require X-Requested-With header for mutations
app.use(requireMutationHeader);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', requireAuth, itemsRoutes);
app.use('/api/tags', requireAuth, tagsRoutes);
app.use('/api/metrics', requireAuth, metricsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

