import express from "express";
import * as selfGuidedController from "../controllers/self-guided.controller.js";
import withAuth from "../middlewares/withAuth.js";
import rateLimter from "../middlewares/rateLimiter.js";
import requiredVerifiedEmail from "../middlewares/requiredVerifiedEmail.js";

const router = express.Router();

router.use(withAuth);
router.get(
  "/",
  rateLimter(5 * 60 * 1000, 25),
  selfGuidedController.getSelfGuidedProgramHandler,
);

router.use(requiredVerifiedEmail);
router.patch(
  "/",
  rateLimter(5 * 60 * 1000, 20),
  selfGuidedController.updateSelfGuidedProgramHandler,
);

router.post(
  "/reflection-messages",
  rateLimter(5 * 60 * 1000, 20),
  selfGuidedController.reflectionMessageHandler,
);

router.get(
  "/reflection-messages/:weekNumber",
  rateLimter(5 * 60 * 1000, 20),
  selfGuidedController.getReflectionMessageHandler,
);

export default router;
