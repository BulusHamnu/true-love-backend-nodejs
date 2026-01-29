import express from "express";
import {
  getSelfGuidedProgram,
  updateSelfGuidedProgram,
  reflectionCorner,
  // getAllReflectionMessages,
} from "../controllers/self-guided.controller.js";
import withAuth from "../middlewares/withAuth.js";
import rateLimter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.get(
  "/",
  withAuth,
  rateLimter(5 * 60 * 1000, 25, "user-id"),
  getSelfGuidedProgram
);
router.patch(
  "/",
  withAuth,
  rateLimter(5 * 60 * 1000, 20, "user-id"),
  updateSelfGuidedProgram
);

// reflection corner messages
router.post(
  "/reflection-messages/:weekNumber",
  withAuth,
  rateLimter(5 * 60 * 1000, 20, "user-id"),
  reflectionCorner
);
// router.get(
//   "/reflection-messages",
//   withAuth,
//   rateLimter(60 * 60 * 1000, 20, "user-id"),
//   getAllReflectionMessages
// );

export default router;
