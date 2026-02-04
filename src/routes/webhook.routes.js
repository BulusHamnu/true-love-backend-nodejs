import express, { Router } from "express";
import stripeWebhookHandler from "../controllers/stripeWebhook.js";

const router = new Router();
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhookHandler,
);

export default router;
