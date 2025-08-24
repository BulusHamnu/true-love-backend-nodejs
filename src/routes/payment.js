import express from "express";
import {
  createCheckOut,
  paymentSucessful,
} from "../controllers/paymentController.js";
import withAuth from "../middlewares/withAuth.js";

const router = express.Router();

router.get("/create-checkout", withAuth, createCheckOut);
router.post(
  "/stripe-webhook",
  express.raw({ type: "application/json" }),
  paymentSucessful
);

export default router;
