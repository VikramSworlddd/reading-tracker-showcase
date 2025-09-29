import express from 'express';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import { getDb } from '../db/connection.js';
import { validate } from '../middleware/validate.js';
import { setAuthCookie, clearAuthCookie, requireAuth, COOKIE_NAME } from '../middleware/auth.js';
import { loginSchema } from '../schemas/index.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Rate limiting for login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { error: { message: 'Too many login attempts, please try again later', code: 'RATE_LIMITED' } }
});

// POST /api/auth/login
router.post('/login', loginLimiter, validate(loginSchema), (req, res, next) => {
  try {
    const { email, password } = req.body;
    const db = getDb();

    const user = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(email);

    if (!user) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);
    if (!validPassword) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    setAuthCookie(res, user.id, user.email);

    res.json({
      user: {
        id: user.id,
        email: user.email
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({
    user: {
      id: req.user.userId,
      email: req.user.email
    }
  });
});

export default router;

