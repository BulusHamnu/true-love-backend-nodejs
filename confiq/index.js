import dotenv from "dotenv";
import Stripe from "stripe";
dotenv.config();

// init stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// env variables
export const env = {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || "",
  BACKEND_URL: process.env.BACKEND_URL || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "",
  PRODUCT_ID: process.env.PRODUCT_ID || "",
  PRODUCT_NAME: process.env.PRODUCT_NAME || "",
  PRODUCT_PRICE_ID: process.env.PRODUCT_PRICE_ID || "",
  STRIPE_WEBHOOK_SECRET_KEY: process.env.STRIPE_WEBHOOK_SECRET_KEY || "",
  EMAIL: process.env.EMAIL || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  TOTUR_EMAIL: process.env.TOTUR_EMAIL || "hamnubulus@gmail.com", // for test purpose,
  SECRET_KEY: process.env.SECRET_KEY,
  PRODUCTION: process.env.PRODUCTION,
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
  PORT: process.env.PORT,
  SELF_GUIDED_NAME: process.env.SELF_GUIDED_NAME,
  SELF_GUIDED_PRODUCT_ID: process.env.SELF_GUIDED_PRODUCT_ID,
  SELF_GUIDED_PRICE_ID: process.env.SELF_GUIDED_PRICE_ID,
};
