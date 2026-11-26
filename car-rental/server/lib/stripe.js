import Stripe from 'stripe';

let client;

// Created on first use so the API (and its tests) can start without a Stripe key.
export const getStripe = () => {
  if (!client) client = new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
};
