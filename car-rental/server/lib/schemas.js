import { z } from 'zod';
import mongoose from 'mongoose';

const email = z.string().trim().toLowerCase().pipe(z.email());
const objectId = z.string().refine((v) => mongoose.isValidObjectId(v), 'Invalid id');

// Only "user" and "owner" can be chosen at sign-up; admins are never self-assigned.
export const registerSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email,
  password: z.string().min(8).max(72),
  role: z.enum(['user', 'owner']).default('user'),
});

// Strings only, which also blocks NoSQL operator objects like {"$gt": ""}.
export const loginSchema = z.object({
  email,
  password: z.string().min(1).max(72),
});

export const profileSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  phone: z.string().trim().max(30).optional(),
});

export const createBookingSchema = z.object({
  carId: objectId,
  pickupLocation: z.string().trim().min(1).max(200),
  dropoffLocation: z.string().trim().min(1).max(200),
  pickupDate: z.coerce.date(),
  returnDate: z.coerce.date(),
  notes: z.string().trim().max(500).optional(),
});

export const BOOKING_STATUSES = ['pending', 'confirmed', 'active', 'completed', 'cancelled'];
export const statusSchema = z.object({ status: z.enum(BOOKING_STATUSES) });
