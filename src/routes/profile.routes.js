import express from "express";
import * as profileController from "../controllers/profile.controller.js";
import withAuth from "../middlewares/withAuth.js";
import rateLimter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.use(withAuth);
router.get(
  "/",
  rateLimter(5 * 60 * 1000, 30, "user-id"),
  profileController.getProfile,
);
router.patch(
  "/",
  rateLimter(5 * 60 * 1000, 30, "user-id"),
  profileController.updateProfile,
);

export default router;
