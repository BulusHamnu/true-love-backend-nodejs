import { Router } from "express";
import * as checkOutController from "../controllers/checkout.controller.js";
import rateLimter from "../middlewares/rateLimiter.js";
import autoCreateUser from "../middlewares/autoCreateUser.js";

const router = Router();

// Users should be able to make purchase even without an account, that is why the autoCreateUser middleware is added.
router.post(
  "/",
  rateLimter(3 * 60 * 1000, 10),
  autoCreateUser,
  checkOutController.createCheckOutHandler,
);

export default router;
