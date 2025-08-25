import express from "express";
import {
  createCheckOut,
  paymentSucessful,
  createSelfGuidedCheckOut
} from "../controllers/paymentController.js";
import withAuth from "../middlewares/withAuth.js";

const router = express.Router();

router.get("/create-checkout", withAuth, createCheckOut);
router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  paymentSucessful
);

router.get("/checkout-self-guided", withAuth, createSelfGuidedCheckOut);

export default router;
