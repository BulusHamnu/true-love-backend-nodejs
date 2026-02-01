import express from "express";
import * as selfGuidedController from "../controllers/self-guided.controller.js";
import withAuth from "../middlewares/withAuth.js";
import rateLimter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get(
  "/",
  withAuth,
  rateLimter(5 * 60 * 1000, 25, "user-id"),
  selfGuidedController.getSelfGuidedProgram,
);
router.patch(
  "/",
  withAuth,
  rateLimter(5 * 60 * 1000, 20, "user-id"),
  selfGuidedController.updateSelfGuidedProgram,
);

// reflection corner messages
router.post(
  "/reflection-messages/:weekNumber",
  withAuth,
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
