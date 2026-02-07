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
  selfGuidedController.getSelfGuidedProgram,
);

router.use(requiredVerifiedEmail);
router.patch(
  "/",
  rateLimter(5 * 60 * 1000, 20, "user-id"),
  selfGuidedController.updateSelfGuidedProgram,
);

// reflection corner messages
router.post(
  "/reflection-messages/:weekNumber",
  rateLimter(5 * 60 * 1000, 20, "user-id"),
  selfGuidedController.reflectionCorner,
);
// router.get(
//   "/reflection-messages",
//   withAuth,
//   rateLimter(60 * 60 * 1000, 20, "user-id"),
//   getAllReflectionMessages
// );

export default router;
