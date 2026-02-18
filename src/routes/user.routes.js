import express from "express";
import * as profileController from "../controllers/user.controller.js";
import withAuth from "../middlewares/withAuth.js";
import rateLimter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.use(withAuth);
router.get(
  "/me",
  rateLimter(5 * 60 * 1000, 30, "user-id"),
  profileController.getProfileHandler,
);
router.patch(
  "/me",
  rateLimter(5 * 60 * 1000, 30, "user-id"),
  profileController.updateProfileHandler,
);

export default router;
