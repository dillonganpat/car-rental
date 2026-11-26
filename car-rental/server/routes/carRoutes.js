import express from 'express';
import Car from '../models/Car.js';
import { protect, ownerOnly } from '../middleware/authMiddleware.js';
import { upload, uploadToCloudinary } from '../configs/cloudinary.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Fields an owner may change on a listing; anything else (owner, rating, ...) is ignored.
const EDITABLE_FIELDS = [
  'brand', 'model', 'year', 'category', 'pricePerDay', 'seats', 'fuelType',
  'transmission', 'mileage', 'description', 'location', 'isAvailable',
];

const parseFeatures = (value) => {
  if (!value) return [];
  const parsed = typeof value === 'string' ? JSON.parse(value) : value;
  if (!Array.isArray(parsed) || parsed.some((f) => typeof f !== 'string')) {
    throw Object.assign(new Error('features must be a list of text'), { status: 400 });
  }
  return parsed;
};

const router = express.Router();

// Get all available cars (public)
router.get('/', async (req, res, next) => {
  try {
    const { category, location, minPrice, maxPrice, seats, fuelType, transmission } = req.query;
    const filter = { isAvailable: true };

    if (category) filter.category = String(category);
    if (location) filter.location = { $regex: escapeRegex(String(location)), $options: 'i' };
    if (seats) filter.seats = { $gte: parseInt(seats) };
    if (fuelType) filter.fuelType = String(fuelType);
    if (transmission) filter.transmission = String(transmission);
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = parseInt(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = parseInt(maxPrice);
    }

    const cars = await Car.find(filter).populate('owner', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, cars });
  } catch (error) {
    next(error);
  }
});

// Get single car
router.get('/:id', async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id).populate('owner', 'name email phone');
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, car });
  } catch (error) {
    next(error);
  }
});

// Create car (owner only)
router.post('/', protect, ownerOnly, upload.array('images', 5), async (req, res, next) => {
  try {
    const { brand, model, year, category, pricePerDay, seats, fuelType, transmission, mileage, description, features, location } = req.body;
    const images = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, `car-${Date.now()}`);
        images.push(result.secure_url);
      }
    }

    const car = await Car.create({
      brand, model, year: parseInt(year), category, pricePerDay: parseInt(pricePerDay),
      seats: parseInt(seats), fuelType, transmission, mileage: parseInt(mileage) || 0,
      description, features: parseFeatures(features), images, location,
      owner: req.user._id,
    });

    res.status(201).json({ success: true, car });
  } catch (error) {
    next(error);
  }
});

// Update car (owner only)
router.put('/:id', protect, ownerOnly, upload.array('images', 5), async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    if (car.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updates = {};
    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (req.body.features !== undefined) updates.features = parseFeatures(req.body.features);
    if (req.files?.length > 0) {
      const images = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, `car-${Date.now()}`);
        images.push(result.secure_url);
      }
      updates.images = images;
    }

    const updatedCar = await Car.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    res.json({ success: true, car: updatedCar });
  } catch (error) {
    next(error);
  }
});

// Delete car (owner only)
router.delete('/:id', protect, ownerOnly, async (req, res, next) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    if (car.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await car.deleteOne();
    res.json({ success: true, message: 'Car deleted' });
  } catch (error) {
    next(error);
  }
});

// Get owner's cars
router.get('/owner/my-cars', protect, ownerOnly, async (req, res, next) => {
  try {
    const cars = await Car.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, cars });
  } catch (error) {
    next(error);
  }
});

export default router;
