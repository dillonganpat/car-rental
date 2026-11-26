const DAY_MS = 1000 * 60 * 60 * 24;

export const MAX_RENTAL_DAYS = 90;

// Bookings in these states hold the car for their dates.
export const BLOCKING_STATUSES = ['pending', 'confirmed', 'active'];

export const calcTotalDays = (pickup, ret) => Math.ceil((ret - pickup) / DAY_MS);

export const startOfTodayUTC = (now = new Date()) =>
  new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

// Returns an error message for unusable dates, or null when they are fine.
export const validateRentalDates = (pickup, ret, now = new Date()) => {
  if (pickup < startOfTodayUTC(now)) return 'Pickup date cannot be in the past';
  const days = calcTotalDays(pickup, ret);
  if (days < 1) return 'Return date must be after pickup date';
  if (days > MAX_RENTAL_DAYS) return `Rentals are limited to ${MAX_RENTAL_DAYS} days`;
  return null;
};

// Two date ranges overlap when each starts before the other ends.
export const overlapQuery = (carId, pickup, ret) => ({
  car: carId,
  status: { $in: BLOCKING_STATUSES },
  pickupDate: { $lt: ret },
  returnDate: { $gt: pickup },
});

// Stripe works in the smallest currency unit; round to avoid float errors like 19.99 * 100.
export const toCents = (amount) => Math.round(amount * 100);
