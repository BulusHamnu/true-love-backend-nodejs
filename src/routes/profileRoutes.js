import express from "express";
import { updateProfile, getProfile } from "../controllers/profile.js";
import withAuth from "../middlewares/withAuth.js";
import rateLimter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get(
  "/",
  withAuth,
  rateLimter(5 * 60 * 1000, 30, "user-id"),
  getProfile
);
router.patch(
  "/",
  withAuth,
  rateLimter(5 * 60 * 1000, 30, "user-id"),
  updateProfile
);

export default router;
