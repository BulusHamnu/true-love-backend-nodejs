import express from "express";
import {
  getProgramProgress,
  updateProgramProgress,
  reflectionCorner,
} from "../controllers/selfGuidedController.js";
import withAuth from "../middlewares/withAuth.js";
import rateLimter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get(
  "/progress",
  withAuth,
  rateLimter(60 * 60 * 1000, 25, "user-id"),
  getProgramProgress
);
router.patch(
  "/progress",
  withAuth,
  rateLimter(60 * 60 * 1000, 20, "user-id"),
  updateProgramProgress
);
router.post(
  "/reflection-corner",
  // withAuth,
  rateLimter(60 * 60 * 1000, 20, "user-id"),
  reflectionCorner
);

export default router;
