import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import carRoutes from './routes/carRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// CLIENT_URL may hold one origin or several, separated by commas.
const allowedOrigins = () =>
  (process.env.CLIENT_URL || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

export function createApp() {
  const app = express();

  // The API runs behind Render/Vercel proxies; needed for correct client IPs in rate limiting.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors({ origin: allowedOrigins(), credentials: true }));
  app.use(express.json({ limit: '10kb' }));

  // Slow down password guessing and automated sign-ups.
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 50,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts, please try again later' },
  });

  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/cars', carRoutes);
  app.use('/api/bookings', bookingRoutes);

  app.get('/', (req, res) => res.json({ message: 'Car Rental API is running' }));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp();
