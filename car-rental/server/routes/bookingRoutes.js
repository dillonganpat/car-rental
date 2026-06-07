import express from 'express';
import Booking from '../models/Booking.js';
import Car from '../models/Car.js';
import { protect, ownerOnly } from '../middleware/authMiddleware.js';
import Stripe from 'stripe';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create booking
router.post('/', protect, async (req, res) => {
  try {
    const { carId, pickupLocation, dropoffLocation, pickupDate, returnDate, notes } = req.body;
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    if (!car.isAvailable) return res.status(400).json({ success: false, message: 'Car is not available' });

    const pickup = new Date(pickupDate);
    const returnD = new Date(returnDate);
    const totalDays = Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24));
    if (totalDays < 1) return res.status(400).json({ success: false, message: 'Invalid dates' });

    const totalAmount = totalDays * car.pricePerDay;

    const booking = await Booking.create({
      car: carId, user: req.user._id, owner: car.owner,
      pickupLocation, dropoffLocation, pickupDate: pickup, returnDate: returnD,
      totalDays, totalAmount, notes,
    });

    res.status(201).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create Stripe payment intent
router.post('/:id/pay', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('car');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.totalAmount * 100,
      currency: 'usd',
      metadata: { bookingId: booking._id.toString() },
    });

    booking.paymentIntentId = paymentIntent.id;
    await booking.save();

    res.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Confirm payment
router.post('/:id/confirm-payment', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.paymentStatus = 'paid';
    booking.status = 'confirmed';
    await booking.save();

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's bookings
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('car', 'brand model images pricePerDay location')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get owner's bookings
router.get('/owner-bookings', protect, ownerOnly, async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user._id })
      .populate('car', 'brand model images')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update booking status (owner)
router.put('/:id/status', protect, ownerOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    booking.status = status;
    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Cancel booking (user)
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (['completed', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
