import express from 'express';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import { protect, ownerOnly } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import { createBookingSchema, statusSchema } from '../lib/schemas.js';
import { calcTotalDays, validateRentalDates, overlapQuery, toCents } from '../lib/bookingRules.js';
import { getStripe } from '../lib/stripe.js';

const router = express.Router();

const isBookingUser = (booking, user) => booking.user.toString() === user._id.toString();

// Create booking
router.post('/', protect, validate(createBookingSchema), async (req, res, next) => {
  try {
    const { carId, pickupLocation, dropoffLocation, pickupDate, returnDate, notes } = req.body;

    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    if (!car.isAvailable) return res.status(400).json({ success: false, message: 'Car is not available' });

    const dateError = validateRentalDates(pickupDate, returnDate);
    if (dateError) return res.status(400).json({ success: false, message: dateError });

    // Refuse if another active booking already holds this car on any of these dates.
    if (await Booking.exists(overlapQuery(carId, pickupDate, returnDate))) {
      return res
        .status(409)
        .json({ success: false, message: 'This car is already booked for those dates' });
    }

    const totalDays = calcTotalDays(pickupDate, returnDate);
    const booking = await Booking.create({
      car: carId, user: req.user._id, owner: car.owner,
      pickupLocation, dropoffLocation, pickupDate, returnDate,
      totalDays, totalAmount: totalDays * car.pricePerDay, notes,
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

// Create Stripe payment intent
router.post('/:id/pay', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!isBookingUser(booking, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (booking.paymentStatus === 'paid' || booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'This booking cannot be paid' });
    }

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: toCents(booking.totalAmount),
      currency: 'usd',
      metadata: { bookingId: booking._id.toString() },
    });

    booking.paymentIntentId = paymentIntent.id;
    await booking.save();

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    next(error);
  }
});

// Confirm payment: only trust Stripe, never the caller.
router.post('/:id/confirm-payment', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!isBookingUser(booking, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (booking.paymentStatus === 'paid') return res.json({ success: true, booking });
    if (!booking.paymentIntentId) {
      return res.status(400).json({ success: false, message: 'No payment started for this booking' });
    }

    const intent = await getStripe().paymentIntents.retrieve(booking.paymentIntentId);
    const matches =
      intent.status === 'succeeded' &&
      intent.metadata?.bookingId === booking._id.toString() &&
      intent.amount === toCents(booking.totalAmount);
    if (!matches) {
      return res.status(402).json({ success: false, message: 'Payment has not been completed' });
    }

    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

// Get user's bookings
router.get('/my-bookings', protect, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('car', 'brand model images pricePerDay location')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
});

// Get owner's bookings
router.get('/owner-bookings', protect, ownerOnly, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate('car', 'brand model images')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
});

// Update booking status (owner)
router.put('/:id/status', protect, ownerOnly, validate(statusSchema), async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    booking.status = req.body.status;
    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

// Cancel booking (user)
router.put('/:id/cancel', protect, async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!isBookingUser(booking, req.user)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
});

export default router;
