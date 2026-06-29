import Stripe from "stripe";

export function hasStripeKeys() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getAppUrl() {
  return process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;

  if (!key) {
    return null;
  }

  return new Stripe(key, {
    apiVersion: "2025-02-24.acacia"
  });
}
