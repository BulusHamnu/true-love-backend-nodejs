import express from "express";
import {
  updateProfile,
  getProfile,
  getProgramProgress,
  updateProgramProgress,
} from "../controllers/profile.js";
import withAuth from "../middlewares/withAuth.js";

const router = express.Router();

router.get("/", withAuth, getProfile);
router.patch("/", withAuth, updateProfile);
router.get("/self-guided-progress", withAuth, getProgramProgress);
router.patch("/self-guided-progress", withAuth, updateProgramProgress);

export default router;
