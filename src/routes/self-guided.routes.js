import express from "express";
import * as selfGuidedController from "../controllers/self-guided.controller.js";
import withAuth from "../middlewares/withAuth.js";
import rateLimter from "../middlewares/rateLimiter.js";
import requiredVerifiedEmail from "../middlewares/requiredVerifiedEmail.js";

const router = express.Router();

router.use(withAuth);
router.get(
  "/",
  rateLimter(5 * 60 * 1000, 25, "user-id"),
  selfGuidedController.getSelfGuidedProgramHandler,
);

router.use(requiredVerifiedEmail);
router.patch(
  "/",
  rateLimter(5 * 60 * 1000, 20, "user-id"),
  selfGuidedController.updateSelfGuidedProgramHandler,
);

router.post(
  "/reflection-messages",
  rateLimter(5 * 60 * 1000, 20, "user-id"),
  selfGuidedController.reflectionMessageHandler,
);

router.get(
  "/reflection-messages/:weekNumber",
  rateLimter(5 * 60 * 1000, 20, "user-id"),
  selfGuidedController.getReflectionMessageHandler,
);

export default router;
