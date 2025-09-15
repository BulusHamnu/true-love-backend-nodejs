import express from "express";
import {
  createCheckOut,
  paymentSucessful,
  createSelfGuidedCheckOut,
} from "../controllers/paymentController.js";
// import withAuth from "../middlewares/withAuth.js";
import rateLimter from "../middlewares/rateLimiter.js";
import autoCreateUser from "../middlewares/autoCreateUser.js";

const router = express.Router();

// the client wants users to make purchase even without signing up
router.post(
  "/create-checkout",
  rateLimter(3 * 60 * 1000, 10, "ip"),
  autoCreateUser,
  createCheckOut
);
router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  paymentSucessful
);

router.post(
  "/checkout-self-guided",
  rateLimter(3 * 60 * 1000, 10, "ip"),
  autoCreateUser,
  createSelfGuidedCheckOut
);

export default router;
