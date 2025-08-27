import express from "express";
import {
  updateProfile,
  getProfile,
  getProgramProgress,
  updateProgramProgress,
} from "../controllers/profile.js";
import withAuth from "../middlewares/withAuth.js";
import rateLimter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get(
  "/",
  withAuth,
  rateLimter(60 * 60 * 1000, 25, "user-id"),
  getProfile
);
router.patch(
  "/",
  withAuth,
  rateLimter(60 * 60 * 1000, 20, "user-id"),
  updateProfile
);
router.get(
  "/self-guided-progress",
  withAuth,
  rateLimter(60 * 60 * 1000, 25, "user-id"),
  getProgramProgress
);
router.patch(
  "/self-guided-progress",
  withAuth,
  rateLimter(60 * 60 * 1000, 20, "user-id"),
  updateProgramProgress
);

export default router;
