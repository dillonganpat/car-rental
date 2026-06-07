import mongoose from 'mongoose';

const carSchema = new mongoose.Schema({
  brand: { type: String, required: true, trim: true },
  model: { type: String, required: true, trim: true },
  year: { type: Number, required: true },
  category: {
    type: String,
    enum: ['sedan', 'suv', 'sports', 'luxury', 'truck', 'van', 'electric'],
    required: true,
  },
  pricePerDay: { type: Number, required: true },
  seats: { type: Number, required: true },
  fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid'], required: true },
  transmission: { type: String, enum: ['automatic', 'manual'], required: true },
  mileage: { type: Number, default: 0 },
  description: { type: String, default: '' },
  features: [{ type: String }],
  images: [{ type: String }],
  location: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Car', carSchema);
