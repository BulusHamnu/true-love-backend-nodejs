import express from "express";
import {
  createCheckOut,
  paymentSucessful,
  createSelfGuidedCheckOut,
} from "../controllers/paymentController.js";
import withAuth from "../middlewares/withAuth.js";
import rateLimter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get(
  "/create-checkout",
  withAuth,
  rateLimter(60 * 60 * 1000, 5, "user-id"),
  createCheckOut
);
router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  paymentSucessful
);

router.get(
  "/checkout-self-guided",
  withAuth,
  rateLimter(60 * 60 * 1000, 5, "user-id"),
  createSelfGuidedCheckOut
);

export default router;
