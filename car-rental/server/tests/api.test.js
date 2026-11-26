import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-secret';
process.env.CLIENT_URL = 'http://localhost:5173';

// Models and Stripe are mocked, so these tests need no database or network.
vi.mock('../models/User.js', () => ({
  default: { findOne: vi.fn(), findById: vi.fn(), create: vi.fn(), findByIdAndUpdate: vi.fn() },
}));
vi.mock('../models/Car.js', () => ({
  default: { findById: vi.fn(), find: vi.fn(), findByIdAndUpdate: vi.fn(), create: vi.fn() },
}));
vi.mock('../models/Booking.js', () => ({
  default: { findById: vi.fn(), exists: vi.fn(), create: vi.fn(), find: vi.fn() },
}));
const stripe = { paymentIntents: { retrieve: vi.fn(), create: vi.fn() } };
vi.mock('../lib/stripe.js', () => ({ getStripe: () => stripe }));
vi.mock('../configs/cloudinary.js', async () => {
  const multer = (await import('multer')).default;
  return { upload: multer(), uploadToCloudinary: vi.fn() };
});

const { default: app } = await import('../app.js');
const User = (await import('../models/User.js')).default;
const Car = (await import('../models/Car.js')).default;
const Booking = (await import('../models/Booking.js')).default;

const USER_ID = '64b000000000000000000001';
const OWNER_ID = '64b000000000000000000002';
const CAR_ID = '64b000000000000000000003';
const BOOKING_ID = '64b000000000000000000004';

const tokenFor = (id) => jwt.sign({ id }, process.env.JWT_SECRET);
const asUser = (role = 'user', id = USER_ID) => {
  User.findById.mockReturnValue({ select: () => Promise.resolve({ _id: id, role }) });
  return { Authorization: `Bearer ${tokenFor(id)}` };
};

const future = (days) => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10);

beforeEach(() => vi.clearAllMocks());

describe('POST /api/auth/register', () => {
  it('never lets a visitor register as admin', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Eve', email: 'eve@example.com', password: 'password123', role: 'admin' });
    expect(res.status).toBe(400);
    expect(User.create).not.toHaveBeenCalled();
  });

  it('creates a normal user and returns a token', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: USER_ID, name: 'Ann', email: 'ann@example.com', role: 'user', image: '' });
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Ann', email: 'Ann@Example.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(User.create).toHaveBeenCalledWith(expect.objectContaining({ email: 'ann@example.com', role: 'user' }));
  });

  it('rejects short passwords', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Ann', email: 'ann@example.com', password: 'short' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('rejects NoSQL operator objects in place of an email', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: { $gt: '' }, password: 'x' });
    expect(res.status).toBe(400);
    expect(User.findOne).not.toHaveBeenCalled();
  });
});

describe('POST /api/bookings', () => {
  const body = () => ({
    carId: CAR_ID, pickupLocation: 'Port of Spain', dropoffLocation: 'Port of Spain',
    pickupDate: future(5), returnDate: future(8),
  });

  it('requires a login', async () => {
    const res = await request(app).post('/api/bookings').send(body());
    expect(res.status).toBe(401);
  });

  it('rejects a pickup date in the past', async () => {
    Car.findById.mockResolvedValue({ _id: CAR_ID, isAvailable: true, pricePerDay: 50, owner: OWNER_ID });
    const res = await request(app).post('/api/bookings').set(asUser())
      .send({ ...body(), pickupDate: '2020-01-01', returnDate: '2020-01-03' });
    expect(res.status).toBe(400);
    expect(Booking.create).not.toHaveBeenCalled();
  });

  it('rejects a car that is already booked for those dates', async () => {
    Car.findById.mockResolvedValue({ _id: CAR_ID, isAvailable: true, pricePerDay: 50, owner: OWNER_ID });
    Booking.exists.mockResolvedValue({ _id: 'x' });
    const res = await request(app).post('/api/bookings').set(asUser()).send(body());
    expect(res.status).toBe(409);
    expect(Booking.create).not.toHaveBeenCalled();
  });

  it('creates a booking and prices it by the number of days', async () => {
    Car.findById.mockResolvedValue({ _id: CAR_ID, isAvailable: true, pricePerDay: 50, owner: OWNER_ID });
    Booking.exists.mockResolvedValue(null);
    Booking.create.mockImplementation(async (doc) => ({ _id: BOOKING_ID, ...doc }));
    const res = await request(app).post('/api/bookings').set(asUser()).send(body());
    expect(res.status).toBe(201);
    expect(res.body.booking.totalDays).toBe(3);
    expect(res.body.booking.totalAmount).toBe(150);
  });
});

describe('POST /api/bookings/:id/confirm-payment', () => {
  const booking = (extra = {}) => ({
    _id: BOOKING_ID, user: USER_ID, totalAmount: 150, paymentStatus: 'unpaid',
    status: 'pending', paymentIntentId: 'pi_123', save: vi.fn(), ...extra,
  });

  it('does not mark a booking paid when Stripe says the payment is incomplete', async () => {
    const b = booking();
    Booking.findById.mockResolvedValue(b);
    stripe.paymentIntents.retrieve.mockResolvedValue({ status: 'requires_payment_method', amount: 15000, metadata: { bookingId: BOOKING_ID } });
    const res = await request(app).post(`/api/bookings/${BOOKING_ID}/confirm-payment`).set(asUser());
    expect(res.status).toBe(402);
    expect(b.paymentStatus).toBe('unpaid');
    expect(b.save).not.toHaveBeenCalled();
  });

  it('refuses when no payment was ever started', async () => {
    Booking.findById.mockResolvedValue(booking({ paymentIntentId: '' }));
    const res = await request(app).post(`/api/bookings/${BOOKING_ID}/confirm-payment`).set(asUser());
    expect(res.status).toBe(400);
  });

  it("refuses someone else's booking", async () => {
    Booking.findById.mockResolvedValue(booking({ user: OWNER_ID }));
    const res = await request(app).post(`/api/bookings/${BOOKING_ID}/confirm-payment`).set(asUser());
    expect(res.status).toBe(403);
  });

  it('refuses when the paid amount does not match the booking', async () => {
    Booking.findById.mockResolvedValue(booking());
    stripe.paymentIntents.retrieve.mockResolvedValue({ status: 'succeeded', amount: 100, metadata: { bookingId: BOOKING_ID } });
    const res = await request(app).post(`/api/bookings/${BOOKING_ID}/confirm-payment`).set(asUser());
    expect(res.status).toBe(402);
  });

  it('confirms the booking once Stripe reports a matching successful payment', async () => {
    const b = booking();
    Booking.findById.mockResolvedValue(b);
    stripe.paymentIntents.retrieve.mockResolvedValue({ status: 'succeeded', amount: 15000, metadata: { bookingId: BOOKING_ID } });
    const res = await request(app).post(`/api/bookings/${BOOKING_ID}/confirm-payment`).set(asUser());
    expect(res.status).toBe(200);
    expect(b.paymentStatus).toBe('paid');
    expect(b.status).toBe('confirmed');
    expect(b.save).toHaveBeenCalled();
  });
});

describe('PUT /api/bookings/:id/status', () => {
  it('rejects statuses that are not in the allowed list', async () => {
    const res = await request(app).put(`/api/bookings/${BOOKING_ID}/status`)
      .set(asUser('owner', OWNER_ID)).send({ status: 'free-ride' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/cars/:id', () => {
  it('ignores fields an owner should not change, such as the owner id and rating', async () => {
    Car.findById.mockResolvedValue({ _id: CAR_ID, owner: OWNER_ID });
    Car.findByIdAndUpdate.mockResolvedValue({ _id: CAR_ID });
    const res = await request(app).put(`/api/cars/${CAR_ID}`).set(asUser('owner', OWNER_ID))
      .field('pricePerDay', '75').field('owner', USER_ID).field('rating', '5');
    expect(res.status).toBe(200);
    const updates = Car.findByIdAndUpdate.mock.calls[0][1];
    expect(updates).toEqual({ pricePerDay: '75' });
  });
});

describe('API hardening', () => {
  it('does not leak internal error messages', async () => {
    Car.find.mockImplementation(() => { throw new Error('secret connection string'); });
    const res = await request(app).get('/api/cars');
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toMatch(/secret/);
  });

  it('sends security headers', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('reports database status on /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(['connected', 'disconnected']).toContain(res.body.database);
  });

  it('returns 404 JSON for unknown routes', async () => {
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
  });
});
