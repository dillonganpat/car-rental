import express from 'express';
import Car from '../models/Car.js';
import { protect, ownerOnly } from '../middleware/authMiddleware.js';
import { upload, uploadToCloudinary } from '../configs/cloudinary.js';

const router = express.Router();

// Get all available cars (public)
router.get('/', async (req, res) => {
  try {
    const { category, location, minPrice, maxPrice, seats, fuelType, transmission } = req.query;
    const filter = { isAvailable: true };

    if (category) filter.category = category;
    if (location) filter.location = { $regex: location, $options: 'i' };
    if (seats) filter.seats = { $gte: parseInt(seats) };
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = parseInt(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = parseInt(maxPrice);
    }

    const cars = await Car.find(filter).populate('owner', 'name email').sort({ createdAt: -1 });
    res.json({ success: true, cars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single car
router.get('/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id).populate('owner', 'name email phone');
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    res.json({ success: true, car });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create car (owner only)
router.post('/', protect, ownerOnly, upload.array('images', 5), async (req, res) => {
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
      description, features: features ? JSON.parse(features) : [], images, location,
      owner: req.user._id,
    });

    res.status(201).json({ success: true, car });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update car (owner only)
router.put('/:id', protect, ownerOnly, upload.array('images', 5), async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    if (car.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updates = { ...req.body };
    if (req.files?.length > 0) {
      const images = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, `car-${Date.now()}`);
        images.push(result.secure_url);
      }
      updates.images = images;
    }
    if (updates.features && typeof updates.features === 'string') updates.features = JSON.parse(updates.features);

    const updatedCar = await Car.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json({ success: true, car: updatedCar });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete car (owner only)
router.delete('/:id', protect, ownerOnly, async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });
    if (car.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await car.deleteOne();
    res.json({ success: true, message: 'Car deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get owner's cars
router.get('/owner/my-cars', protect, ownerOnly, async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, cars });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
