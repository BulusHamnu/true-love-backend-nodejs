import express from "express";
import { updateProfile, getProfile } from "../controllers/profile.js";
import withAuth from "../middlewares/withAuth.js";

const router = express.Router();

router.get("/", withAuth, getProfile);
router.patch("/", withAuth, updateProfile);

export default router;
