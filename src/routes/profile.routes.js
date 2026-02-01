import express from "express";
import * as profileController from "../controllers/profile.controller.js";
import withAuth from "../middlewares/withAuth.js";
import rateLimter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get(
  "/",
  withAuth,
  rateLimter(5 * 60 * 1000, 30, "user-id"),
  profileController.getProfile,
);
router.patch(
  "/",
  withAuth,
  rateLimter(5 * 60 * 1000, 30, "user-id"),
  profileController.updateProfile,
);

export default router;
