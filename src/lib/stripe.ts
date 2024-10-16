import Stripe from "stripe";

export const stripe = (): Stripe => {
  return new Stripe(process.env.STRIPE_API_KEY!, {
    apiVersion: "2024-09-30.acacia",
    typescript: true,
  });
};
