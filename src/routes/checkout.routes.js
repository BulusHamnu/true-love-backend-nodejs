import express from "express";
import * as checkOutController from "../controllers/checkout.controller.js";
import rateLimter from "../middlewares/rateLimiter.js";
import autoCreateUser from "../middlewares/autoCreateUser.js";
import stripeWebhookHandler from "../controllers/stripeWebhook.js";

const router = express.Router();

// Users should be able to make purchase even without an account, that is why the autoCreateUser middleware is added.
router.post(
  "/create-checkout",
  rateLimter(3 * 60 * 1000, 10, "ip"),
  autoCreateUser,
  checkOutController.createCheckOutHandler,
);

router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler,
);

export default router;
