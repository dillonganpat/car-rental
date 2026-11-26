import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema, profileSchema } from '../lib/schemas.js';

const router = express.Router();

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  image: user.image,
});

// Register
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already in use' });

    const user = await User.create({ name, email, password, role });
    res.status(201).json({ success: true, token: generateToken(user._id), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    res.json({ success: true, token: generateToken(user._id), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Update profile
router.put('/update-profile', protect, validate(profileSchema), async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

export default router;
