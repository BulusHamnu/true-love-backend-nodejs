import dotenv from "dotenv";
import Stripe from "stripe";
dotenv.config();

// init stripe
export const StripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);

// env variables
export const Env = {
  PASSWORD_HASH_SALT: 10,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || "",
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || "",
  STRIPE_WEBHOOK_SECRET_KEY_TEST:
    process.env.STRIPE_WEBHOOK_SECRET_KEY_TEST || "",
  STRIPE_WEBHOOK_SECRET_KEY_LIVE: process.env.STRIPE_WEBHOOK_SECRET_KEY_LIVE,

  COACHING_PRODUCT_ID: process.env.COACHING_PRODUCT_ID || "",
  COACHING_PRODUCT_NAME: process.env.COACHING_PRODUCT_NAME || "",
  COACHING_PRICE_ID: process.env.COACHING_PRICE_ID || "",
  NEWDOOR_COACHING_PRICE_ID: process.env.NEWDOOR_COACHING_PRICE_ID || "",

  SELF_GUIDED_PRODUCT_NAME: process.env.SELF_GUIDED_PRODUCT_NAME,
  SELF_GUIDED_PRODUCT_ID: process.env.SELF_GUIDED_PRODUCT_ID,
  SELF_GUIDED_PRICE_ID: process.env.SELF_GUIDED_PRICE_ID,

  EMAIL: process.env.EMAIL || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  TOTUR_EMAIL: process.env.TOTUR_EMAIL,
  RESEND_EMAIL_DOMAIN: process.env.RESEND_EMAIL_DOMAIN,

  GOOGLE_OAUTH2_ENDPOINT: process.env.GOOGLE_OAUTH2_ENDPOINT || "",
  GOOGLE_TOKEN_REQUEST_URL: process.env.GOOGLE_TOKEN_REQUEST_URL || "",

  TOKEN_SECRET_KEY: process.env.TOKEN_SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY: process.env.REFRESH_TOKEN_SECRET_KEY,
  TRUE_LOVE_GOOGLE_CLIENT_SECRET: process.env.TRUE_LOVE_GOOGLE_CLIENT_SECRET,
  TRUE_LOVE_GOOGLE_CLIENT_ID: process.env.TRUE_LOVE_GOOGLE_CLIENT_ID,
  OPEN_API_KEY: process.env.OPEN_API_KEY,

  LOGIN_COOKIE_OPTS: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },

  PRODUCTION: process.env.PRODUCTION,
  ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN,
  PORT: process.env.PORT,
  BACKEND_URL: process.env.BACKEND_URL || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "",

  MAINTENANCE_MODE: process.env.MAINTENANCE_MODE || "false",
  MONGO_DATABASE_HOST: process.env.MONGO_DATABASE_HOST || "",
  MONGO_DATABASE_NAME: process.env.MONGO_DATABASE_NAME || "",
  MONGO_DATABASE_URI: process.env.MONGO_DATABASE_URI || "",

  REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
  REDIS_PORT: process.env.REDIS_PORT || 6379,
  REDIS_URL: process.env.REDIS_URL || "",

  REDIS_CONNECTION: process.env.REDIS_URL
    ? { url: process.env.REDIS_URL }
    : {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
};

export default Env;
